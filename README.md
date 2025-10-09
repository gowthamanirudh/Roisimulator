# ROI Simulator

A modern web application for calculating and simulating Return on Investment (ROI) for automation projects. This tool helps businesses and individuals estimate the financial benefits of implementing automation solutions.

## 🌟 Features

- **Real-time ROI Calculation**: Instantly see the financial impact of automation
- **Scenario Management**: Save, load, and compare different automation scenarios
- **Interactive Dashboard**: Visual representation of cost savings and payback periods
- **Report Generation**: Download detailed PDF reports of your simulations
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## 🚀 Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with modern styling
- **State Management**: React Hooks

### Backend
- **Framework**: Python with Flask
- **API**: RESTful API endpoints
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Authentication**: JWT-based authentication

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or later)
- Python (3.8 or later)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/roi-simulator.git
   cd roi-simulator
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

1. **Start the backend server**
   ```bash
   cd backend
   python wsgi.py
   ```

2. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

