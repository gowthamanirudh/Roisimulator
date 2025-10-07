from flask import Blueprint, jsonify, request, send_file
from sqlalchemy.exc import SQLAlchemyError
from .roi import SimulationInputs, calculate_simulation
from .models import Scenario
from .extensions import db
import io
import re


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


@api_bp.post("/scenarios")
def create_scenario() -> tuple[dict, int]:
    try:
        payload = request.get_json(silent=True) or {}
        scenario_name = (payload.get("scenario_name") or "").strip()
        if not scenario_name:
            return jsonify({"error": "scenario_name is required"}), 400

        # Validate inputs and compute results to persist a consistent record
        inputs = SimulationInputs.from_payload(payload)
        results = calculate_simulation(inputs)

        import json as _json
        record = Scenario(
            scenario_name=scenario_name,
            inputs_json=_json.dumps(payload),
            results_json=_json.dumps(results),
        )
        db.session.add(record)
        db.session.commit()
        return jsonify({"id": record.id, "status": "created"}), 201
    except ValueError as err:
        db.session.rollback()
        return jsonify({"error": str(err)}), 400
    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({"error": "database error"}), 500


@api_bp.get("/scenarios")
def list_scenarios() -> tuple[dict, int]:
    items = [s.to_list_item() for s in Scenario.query.order_by(Scenario.created_at.desc()).all()]
    return jsonify({"scenarios": items}), 200


@api_bp.get("/scenarios/<int:scenario_id>")
def get_scenario(scenario_id: int) -> tuple[dict, int]:
    record = Scenario.query.get_or_404(scenario_id)
    return jsonify(record.to_dict()), 200


@api_bp.delete("/scenarios/<int:scenario_id>")
def delete_scenario(scenario_id: int) -> tuple[dict, int]:
    record = Scenario.query.get_or_404(scenario_id)
    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({"status": "deleted"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "database error"}), 500


_EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


@api_bp.post("/report/generate")
def generate_report():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip()
    if not email or not _EMAIL_REGEX.match(email):
        return jsonify({"error": "valid email is required"}), 400

    try:
        inputs = SimulationInputs.from_payload(payload)
        results = calculate_simulation(inputs)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    # Placeholder file content (stub). A real implementation would render HTML and
    # convert to PDF (e.g., via WeasyPrint) and stream the PDF bytes.
    report_text = (
        "ROI Report (Placeholder)\n\n"
        f"Email: {email}\n"
        f"Inputs: {payload}\n"
        f"Results: {results}\n"
    )
    data = io.BytesIO(report_text.encode("utf-8"))
    return send_file(
        data,
        mimetype="text/plain",
        as_attachment=True,
        download_name="roi_report_placeholder.txt",
    )


