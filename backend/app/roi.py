from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Dict, Any


MIN_ROI_BOOST_FACTOR: float = 1.1


@dataclass(frozen=True)
class SimulationInputs:
    labor_cost_manual: float
    error_savings: float
    auto_cost: float
    implementation_cost: Optional[float] = None

    @staticmethod
    def from_payload(payload: Dict[str, Any]) -> "SimulationInputs":
        def to_float(key: str, required: bool = True) -> Optional[float]:
            value = payload.get(key, None)
            if value is None:
                if required:
                    raise ValueError(f"Missing required field: {key}")
                return None
            try:
                return float(value)
            except (TypeError, ValueError) as exc:
                raise ValueError(f"Field '{key}' must be a number") from exc

        labor_cost_manual = to_float("labor_cost_manual", required=True)
        error_savings = to_float("error_savings", required=True)
        auto_cost = to_float("auto_cost", required=True)
        implementation_cost = to_float("implementation_cost", required=False)

        if labor_cost_manual < 0 or error_savings < 0 or auto_cost < 0:
            raise ValueError("Inputs must be non-negative numbers")
        if implementation_cost is not None and implementation_cost < 0:
            raise ValueError("implementation_cost must be non-negative if provided")

        return SimulationInputs(
            labor_cost_manual=labor_cost_manual,
            error_savings=error_savings,
            auto_cost=auto_cost,
            implementation_cost=implementation_cost,
        )


def calculate_simulation(inputs: SimulationInputs) -> Dict[str, Any]:
    base_savings = inputs.labor_cost_manual + inputs.error_savings - inputs.auto_cost
    monthly_savings = base_savings * MIN_ROI_BOOST_FACTOR

    payback_months: Optional[float] = None
    roi_percentage: Optional[float] = None

    if inputs.implementation_cost is not None and monthly_savings > 0:
        payback_months = inputs.implementation_cost / monthly_savings
        # Annualized ROI relative to implementation cost
        if inputs.implementation_cost > 0:
            roi_percentage = ((monthly_savings * 12) - inputs.implementation_cost) / inputs.implementation_cost * 100.0

    return {
        "monthly_savings": round(monthly_savings, 2),
        "payback_months": round(payback_months, 2) if payback_months is not None else None,
        "roi_percentage": round(roi_percentage, 2) if roi_percentage is not None else None,
        "boost_factor": MIN_ROI_BOOST_FACTOR,
    }


