import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Sliders,
  FileImage,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api";

export default function App() {
  // Model status
  const [modelStatus, setModelStatus] = useState({ loaded: false, loading: true, error: null });

  // Mode selection
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'webcam'

  // Settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Detection result
  const [currentResult, setCurrentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const webcamIntervalRef = useRef(null);
  const isPredictingFrameRef = useRef(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    goodCount: 0,
    badCount: 0,
    totalConfidenceSum: 0
  });

  // History log
  const [history, setHistory] = useState([]);

  // Check Backend Health on Mount
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setModelStatus({ loaded: data.model_loaded, loading: false, error: data.error });
      } else {
        setModelStatus({ loaded: false, loading: false, error: "Backend health check failed." });
      }
    } catch (err) {
      setModelStatus({
        loaded: false,
        loading: false,
        error: "Unable to connect to the detection server (localhost:8000)."
      });
    }
  };

  // Helper to record inspection history & update stats
  const recordInspection = (result, mode) => {
    if (!result || result.overall_result === "NO WELD" && result.total_detections === 0) {
      return;
    }

    const isGood = result.overall_result === "GOOD WELD";
    const conf = result.overall_confidence || 0;

    setStats(prev => ({
      total: prev.total + 1,
      goodCount: prev.goodCount + (isGood ? 1 : 0),
      badCount: prev.badCount + (isGood ? 0 : 1),
      totalConfidenceSum: prev.totalConfidenceSum + conf
    }));

    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      mode: mode === 'upload' ? 'Upload' : 'Webcam',
      result: result.overall_result,
      confidence: (conf * 100).toFixed(1) + '%',
      detectionsCount: result.total_detections
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 19)]);
  };

  // File Upload Handlers
  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Auto trigger prediction on select
    runImagePrediction(file, confidenceThreshold);
  };

  const runImagePrediction = async (file, threshold) => {
    if (!file) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("confidence", threshold.toString());

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentResult(data);
        recordInspection(data, 'upload');
      } else {
        setErrorMsg(data.detail || "Detection failed.");
      }
    } catch (err) {
      setErrorMsg("Unable to connect to the detection server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentResult(null);
    setErrorMsg(null);
  };

  // Webcam Controls
  const startWebcam = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);

      // Start frame prediction loop (every 300ms)
      webcamIntervalRef.current = setInterval(captureAndPredictFrame, 300);
    } catch (err) {
      setErrorMsg("Unable to access camera. Please check browser permissions and ensure no other application is using the camera.");
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (webcamIntervalRef.current) {
      clearInterval(webcamIntervalRef.current);
      webcamIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsWebcamActive(false);
  };

  const captureAndPredictFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isPredictingFrameRef.current) return;
    const video = videoRef.current;
    if (video.readyState !== 4) return;

    isPredictingFrameRef.current = true;

    try {
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

      const res = await fetch(`${API_BASE_URL}/predict_frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          confidence: confidenceThreshold
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data);
      }
    } catch (err) {
      console.warn("Frame prediction error:", err);
    } finally {
      isPredictingFrameRef.current = false;
    }
  };

  // Switch tabs cleanly
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      if (activeTab === 'webcam') stopWebcam();
      setActiveTab(tab);
      setCurrentResult(null);
      setErrorMsg(null);
    }
  };

  const avgConfidence = stats.total > 0
    ? ((stats.totalConfidenceSum / stats.total) * 100).toFixed(1) + '%'
    : '0.0%';

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon-wrapper">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="brand-title">AI Weld Quality Inspection</h1>
            <p className="brand-subtitle">YOLO-Based Automated Weld Quality Inspection Dashboard</p>
          </div>
        </div>

        <div className={`model-status-badge ${modelStatus.loaded ? 'status-ready' : 'status-error'}`}>
          <div className="status-dot"></div>
          <span>
            {modelStatus.loading
              ? 'Connecting...'
              : modelStatus.loaded
              ? 'Model Ready'
              : 'Model Offline'}
          </span>
        </div>
      </header>

      {/* Global Error Notice if Model Failed */}
      {!modelStatus.loaded && !modelStatus.loading && (
        <div className="verdict-banner verdict-bad" style={{ marginBottom: 24 }}>
          <div className="verdict-title-group">
            <AlertTriangle size={24} />
            <div>
              <div style={{ fontWeight: 700 }}>YOLO Model Unavailable</div>
              <div style={{ fontSize: '0.85rem' }}>{modelStatus.error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-label">Total Inspections</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-label">Good Welds</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.goodCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="stat-label">Bad Welds</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats.badCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-label">Avg Confidence</div>
            <div className="stat-value">{avgConfidence}</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Mode Selection & Controls Panel */}
        <div className="panel-card">
          <div className="panel-title">
            <Sliders size={20} />
            <span>Inspection Controls</span>
          </div>

          {/* Mode Switcher */}
          <div className="mode-tabs">
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => handleTabChange('upload')}
            >
              <Upload size={16} />
              <span>Upload Image</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'webcam' ? 'active' : ''}`}
              onClick={() => handleTabChange('webcam')}
            >
              <Camera size={16} />
              <span>Open Webcam</span>
            </button>
          </div>

          {/* Confidence Slider */}
          <div className="control-group">
            <div className="control-label-row">
              <span>Confidence Threshold</span>
              <span className="threshold-val">{(confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={confidenceThreshold}
              className="slider-input"
              onChange={(e) => {
                const newConf = parseFloat(e.target.value);
                setConfidenceThreshold(newConf);
                if (activeTab === 'upload' && selectedFile) {
                  runImagePrediction(selectedFile, newConf);
                }
              }}
            />
          </div>

          {/* TAB A: UPLOAD INTERFACE */}
          {activeTab === 'upload' && (
            <>
              <div
                className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('weld-file-input').click()}
              >
                <input
                  id="weld-file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />
                <div className="dropzone-icon">
                  <FileImage size={36} />
                </div>
                <div className="dropzone-text">
                  {selectedFile ? selectedFile.name : "Drag & Drop Weld Image"}
                </div>
                <div className="dropzone-hint">
                  Supported formats: JPG, JPEG, PNG, WEBP
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => document.getElementById('weld-file-input').click()}
                  disabled={isAnalyzing}
                >
                  <Upload size={18} />
                  <span>{isAnalyzing ? "Analyzing..." : "Upload Weld Image"}</span>
                </button>

                {(selectedFile || currentResult) && (
                  <button className="btn-secondary" onClick={handleReset}>
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB B: WEBCAM INTERFACE */}
          {activeTab === 'webcam' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!isWebcamActive ? (
                <button
                  className="btn-primary"
                  onClick={startWebcam}
                  disabled={!modelStatus.loaded}
                >
                  <Camera size={18} />
                  <span>Open Webcam</span>
                </button>
              ) : (
                <button className="btn-danger" onClick={stopWebcam}>
                  <Camera size={18} />
                  <span>Stop Camera</span>
                </button>
              )}

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Real-time YOLO frame inference executes directly against your webcam stream.
              </p>
            </div>
          )}

          {/* Custom Error Banner */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-bad)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Side: Detection Results Viewport & Analysis */}
        <div className="result-viewport">
          {/* Verdict Banner Header */}
          {currentResult ? (
            <div className={`verdict-banner ${
              currentResult.overall_result === 'GOOD WELD'
                ? 'verdict-good'
                : currentResult.overall_result === 'BAD WELD'
                ? 'verdict-bad'
                : 'verdict-none'
            }`}>
              <div className="verdict-title-group">
                {currentResult.overall_result === 'GOOD WELD' && (
                  <CheckCircle2 size={36} color="#10b981" />
                )}
                {currentResult.overall_result === 'BAD WELD' && (
                  <AlertTriangle size={36} color="#ef4444" />
                )}
                {currentResult.overall_result === 'NO WELD' && (
                  <Info size={36} color="#94a3b8" />
                )}
                <div>
                  <div className="verdict-text" style={{
                    color: currentResult.overall_result === 'GOOD WELD' ? '#10b981' :
                           currentResult.overall_result === 'BAD WELD' ? '#ef4444' : '#94a3b8'
                  }}>
                    {currentResult.overall_result}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {currentResult.total_detections} weld feature(s) identified
                  </div>
                </div>
              </div>

              {currentResult.overall_result !== 'NO WELD' && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Confidence
                  </div>
                  <div className="verdict-confidence" style={{
                    color: currentResult.overall_result === 'GOOD WELD' ? '#10b981' : '#ef4444'
                  }}>
                    {(currentResult.overall_confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="verdict-banner verdict-none">
              <div className="verdict-title-group">
                <Info size={28} color="#94a3b8" />
                <div>
                  <div style={{ fontWeight: 700 }}>Awaiting Inspection</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Upload an image or launch the live camera stream to see weld quality predictions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Frame Viewport */}
          <div className="display-frame-container">
            {activeTab === 'upload' && (
              currentResult?.annotated_image ? (
                <img
                  src={currentResult.annotated_image}
                  alt="Annotated Weld Prediction"
                  className="display-image"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Uploaded Weld Preview"
                  className="display-image"
                />
              ) : (
                <div className="empty-placeholder">
                  <Upload size={48} strokeWidth={1.5} />
                  <span>No weld image selected</span>
                </div>
              )
            )}

            {activeTab === 'webcam' && (
              <>
                <video
                  ref={videoRef}
                  className="webcam-video-element"
                  style={{ display: isWebcamActive ? 'block' : 'none' }}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {isWebcamActive && (
                  <div className="camera-badge">
                    <div className="pulse-dot" />
                    <span>CAMERA ACTIVE</span>
                  </div>
                )}

                {!isWebcamActive && (
                  <div className="empty-placeholder">
                    <Camera size={48} strokeWidth={1.5} />
                    <span>Webcam is inactive</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detailed Bounding Boxes Table */}
          {currentResult?.detections && currentResult.detections.length > 0 && (
            <div className="detections-table-wrapper">
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} />
                <span>Detected Weld Features ({currentResult.detections.length})</span>
              </div>
              <table className="detections-table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Classification</th>
                    <th>Confidence</th>
                    <th>Bounding Box (x1, y1, x2, y2)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResult.detections.map((det, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{det.class_name}</td>
                      <td>
                        <span className={`badge-tag ${det.is_good ? 'badge-good' : 'badge-bad'}`}>
                          {det.is_good ? 'GOOD WELD' : 'DEFECTIVE'}
                        </span>
                      </td>
                      <td className="mono-text" style={{ fontWeight: 600 }}>
                        {(det.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="mono-text" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        [{det.bbox.x1}, {det.bbox.y1}, {det.bbox.x2}, {det.bbox.y2}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* History Log Section */}
      {history.length > 0 && (
        <div className="history-card">
          <div className="panel-title">
            <Activity size={20} />
            <span>Inspection Log History</span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table className="detections-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Mode</th>
                  <th>Verdict Result</th>
                  <th>Confidence Score</th>
                  <th>Feature Detections</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="mono-text">{item.time}</td>
                    <td>{item.mode}</td>
                    <td>
                      <span className={`badge-tag ${item.result === 'GOOD WELD' ? 'badge-good' : 'badge-bad'}`}>
                        {item.result}
                      </span>
                    </td>
                    <td className="mono-text" style={{ fontWeight: 600 }}>{item.confidence}</td>
                    <td>{item.detectionsCount} feature(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
