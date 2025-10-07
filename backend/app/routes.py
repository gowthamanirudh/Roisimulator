from flask import Blueprint, jsonify, request
from .roi import SimulationInputs, calculate_simulation


api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health() -> tuple[dict, int]:
    return jsonify({"status": "ok"}), 200


@api_bp.post("/simulate")
def simulate() -> tuple[dict, int]:
    try:
        payload = request.get_json(silent=True) or {}
        inputs = SimulationInputs.from_payload(payload)
        results = calculate_simulation(inputs)
        return jsonify({"inputs": payload, "results": results}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 400


