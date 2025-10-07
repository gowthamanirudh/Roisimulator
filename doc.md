## ROI Simulator — Planned Approach and Architecture

### Overview
This application follows a three-tier architecture: a frontend SPA, a backend REST API, and a persistence layer for scenarios and reports.

### Architecture
- **Frontend (Presentation Layer)**: React Single Page Application (SPA) with functional components and Hooks. Handles user interaction, input validation, and real-time display of simulation results.
- **Backend (Application/API Layer)**: Python 3 + Flask REST API. Hosts core business logic (ROI calculation), manages persistence (CRUD for scenarios), and handles report generation.
- **Database (Data Layer)**: SQLite for lightweight persistence of named scenarios.

### Technologies, Frameworks, and Database
| Component  | Technology/Framework                 | Rationale |
|------------|--------------------------------------|-----------|
| Frontend   | React (functional components, Hooks) | Fast development of dynamic UI; real-time updates on input changes. |
| Backend    | Python 3, Flask                      | Lightweight, rapid API development; Python is well-suited for calculation logic. |
| Database   | SQLite                               | Zero-configuration; ideal for prototype CRUD of scenarios. |
| Styling    | Bootstrap (or simple CSS framework)  | Quick, responsive styling for clean, professional UI. |
| Report Gen | WeasyPrint (Python) or similar       | Convert rendered HTML (Jinja2) into a PDF for download. |

### Favorable Output Logic (Internal Bias)
- Internal constants are hardcoded on the backend and never exposed to the client.
- A minimum ROI boost factor is applied to bias results favorably:
  - `min_roi_boost_factor = 1.1`
- Monthly savings calculation uses the positive bias:
  - \(\text{monthly\_savings} = (\text{labor\_cost\_manual} + \text{error\_savings} - \text{auto\_cost}) \times 1.1\)

### Key Features and Functionality
1. **Quick Simulation (Core Feature)**
   - **Real-time Results**: Frontend posts inputs to `POST /simulate` on debounced changes.
   - **Instant Display**: Shows `monthly_savings`, `payback_months`, `roi_percentage` beside the form.
   - **Client-Side Validation**: Required numerical fields must be present and positive before simulation.

2. **Scenario Management (CRUD)**
   - **Save**: "Save Scenario" posts inputs (and derived results) to `POST /scenarios`.
   - **Load**: A list from `GET /scenarios` allows selecting a scenario; `GET /scenarios/:id` pre-populates the form and re-simulates.
   - **Delete**: Remove via `DELETE /scenarios/:id`.

3. **Report Generation (Lead Capture)**
   - **Email Gating**: "Download Full Report" disabled until a valid email is entered.
   - **Report Flow** (`POST /report/generate`):
     - Validate email format.
     - Render HTML with inputs, results, and brief ROI explanation using Jinja2.
     - Convert HTML to PDF via WeasyPrint (or similar).
     - Return the PDF file (or a link) as the response.

4. **Operational Notes**
   - Internal constants remain server-side only.
   - Input sanitation and validation on both client and server.
   - Debounce API calls to avoid excessive network chatter.

### API Endpoint Design
All endpoints are implemented in the Flask backend.

| Method | Endpoint             | Data Sent (Body/Query)                 | Data Returned (JSON)                               | Functionality |
|--------|----------------------|----------------------------------------|----------------------------------------------------|---------------|
| POST   | `/simulate`          | User inputs (e.g., monthly volumes, costs) | Calculated results: `monthly_savings`, `payback_months`, `roi_percentage` | Core calculation |
| POST   | `/scenarios`         | `scenario_name` + all user inputs      | Success status, ID of new scenario                 | Save scenario |
| GET    | `/scenarios`         | —                                      | List of scenarios: `[{ id, scenario_name }]`       | List scenarios |
| GET    | `/scenarios/:id`     | —                                      | Full details (inputs + results)                    | Retrieve scenario |
| DELETE | `/scenarios/:id`     | —                                      | Success status                                     | Delete scenario |
| POST   | `/report/generate`   | All user inputs + email                | PDF file (or link to PDF)                          | Generate PDF report |

### Frontend Behavior
- React form components manage local state with Hooks; inputs validated for positivity and completeness.
- Debounced calls to `/simulate` update derived result components in real-time.
- Scenario list view or modal fetches, loads, and deletes scenarios.
- Report button enabled only when email passes validation.

### Backend Behavior
- Flask blueprint(s) implement endpoints; input parsing and validation occur server-side.
- ROI calculation module applies internal boost factor and returns derived metrics.
- SQLite persistence via a thin data access layer for scenarios (create, read, delete).
- Jinja2 template renders report HTML; WeasyPrint converts to PDF.

### Data Model (Prototype)
- `Scenario` table (SQLite):
  - `id` (PK, integer, autoincrement)
  - `scenario_name` (text, unique or user-scoped)
  - `inputs_json` (text)
  - `results_json` (text)
  - `created_at` (datetime)

### Validation Rules (Examples)
- Numbers must be present, finite, and greater than zero where applicable.
- Email must match a basic RFC-compliant regex on both client and server.
- Backend rejects ill-formed payloads with meaningful error messages.

### Non-Functional Considerations
- Keep endpoints idempotent where applicable (e.g., `GET`).
- Log requests and errors on the server for troubleshooting.
- CORS enabled for the SPA origin during development.

### Getting Started (Run Locally)
- Backend (Flask):
  1. `cd backend`
  2. `./run.ps1`
  6. Health check: `GET http://127.0.0.1:5000/api/health`

- Frontend (Vite + React):
  1. Open a new terminal
  2. `cd frontend`
  3. `./run.ps1`
  5. Visit `http://localhost:5173` (proxy forwards `/api` to `http://127.0.0.1:5000`)

Notes:
- Run the backend before the frontend to avoid proxy errors.
- For API tests, use the documented endpoints (e.g., `POST /api/simulate`).

### One-command Dev (both servers)
- From project root: `./dev.ps1`
- Starts backend (http://127.0.0.1:5000) and frontend (http://localhost:5173) concurrently.


