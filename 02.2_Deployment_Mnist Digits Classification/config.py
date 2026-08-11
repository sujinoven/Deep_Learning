import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mnist-ai-vision-super-secret-key-2026')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models', 'digits_intel.h5'))
    UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads'))

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    DEBUG = True
