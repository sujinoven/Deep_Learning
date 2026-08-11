import os
from app import create_app
from config import DevelopmentConfig, ProductionConfig

env = os.environ.get('FLASK_ENV', 'development')
config_cls = DevelopmentConfig if env == 'development' else ProductionConfig

app = create_app(config_cls)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))
