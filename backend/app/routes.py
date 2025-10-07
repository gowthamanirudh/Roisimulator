from flask import Blueprint, jsonify


api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health() -> tuple[dict, int]:
    return jsonify({"status": "ok"}), 200


