from __future__ import annotations

from datetime import datetime
from typing import Any

from .extensions import db


class Scenario(db.Model):
    __tablename__ = "scenarios"

    id = db.Column(db.Integer, primary_key=True)
    scenario_name = db.Column(db.String(255), nullable=False)
    inputs_json = db.Column(db.Text, nullable=False)
    results_json = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_list_item(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "scenario_name": self.scenario_name,
            "created_at": self.created_at.isoformat(),
        }

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "scenario_name": self.scenario_name,
            "inputs_json": self.inputs_json,
            "results_json": self.results_json,
            "created_at": self.created_at.isoformat(),
        }


