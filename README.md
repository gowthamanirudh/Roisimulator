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

## 🌐 Deployment

### Frontend (Vercel)
1. Push your code to a GitHub repository
2. Sign up on [Vercel](https://vercel.com)
3. Import your repository and deploy

### Backend (Render)
1. Sign up on [Render](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure your service:
   - **Name**: roi-simulator-backend (or your preferred name)
   - **Region**: Choose the one closest to your users
   - **Branch**: main (or your preferred branch)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
5. Set environment variables:
   - `PYTHON_VERSION`: 3.9 (or your preferred version)
   - `FLASK_APP`: wsgi:app
   - `FLASK_ENV`: production
6. Click "Create Web Service"

## 📊 Features in Detail

- **ROI Calculator**: Input your current costs and projected savings to see potential ROI
- **Scenario Comparison**: Save multiple scenarios and compare them side by side
- **Data Visualization**: Interactive charts showing cost breakdowns and savings over time
- **Export Options**: Export your calculations as PDF or CSV

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any questions or feedback, please contact [your-email@example.com](kpgowthamanirudh@example.com)
