from flask import Flask
from flask_cors import CORS
from .extensions import db


def create_app() -> Flask:
    app = Flask(__name__)

    # Basic config; SQLite file in instance folder
    app.config.setdefault("SQLALCHEMY_DATABASE_URI", "sqlite:///roi_simulator.db")
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

    # Init extensions
    db.init_app(app)
    CORS(app)

    # Blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app


