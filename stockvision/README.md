# 📈 StockVision — AI-Powered Stock Market Intelligence

A full-stack stock analysis platform with LSTM neural network predictions, real-time data, candlestick charts, RSI, MACD, watchlist, and portfolio tracker.

![StockVision](https://img.shields.io/badge/React-18-blue) ![Python](https://img.shields.io/badge/Python-3.10+-green) ![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey) ![LSTM](https://img.shields.io/badge/ML-LSTM%20%2F%20GBM-purple)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 Stock Search | Any ticker: AAPL, TSLA, RELIANCE.NS, BTC-USD |
| 📊 Chart Types | Line, Area, Candlestick |
| 📉 Indicators | RSI, MACD, Volume, MA20/50/200 |
| 🧠 AI Forecast | LSTM-style 7-day price predictions |
| ⭐ Watchlist | Save & track favorite stocks |
| 💼 Portfolio | Track positions, P&L, returns |
| 🔐 Auth | Login / signup with local storage |
| 🌐 Global | US stocks, Indian stocks (NSE), Crypto |

---

## 🗂 Project Structure

```
stockvision/
├── frontend/               # React app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js / .css
│   │   │   └── Dashboard.js / .css
│   │   └── components/
│   │       ├── Sidebar.js / .css
│   │       ├── SearchBar.js / .css
│   │       ├── StockHeader.js / .css
│   │       ├── PriceChart.js
│   │       ├── PredictionChart.js
│   │       ├── IndicatorPanel.js
│   │       ├── Watchlist.js / .css
│   │       ├── Portfolio.js / .css
│   │       └── LoadingSpinner.js / .css
│   └── package.json
├── backend/
│   ├── app.py              # Flask API
│   └── requirements.txt
├── vercel.json             # Vercel deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/stockvision.git
cd stockvision
```

### 2. Backend (Python / Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
# Proxy to backend is already configured in package.json
```

---

## ☁️ Deploy to Vercel

### Option A — Separate deployments (Recommended)

**Deploy backend to Render.com (free):**

1. Create account at [render.com](https://render.com)
2. New → Web Service → Connect your GitHub repo
3. Set:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Copy the Render URL (e.g. `https://stockvision-api.onrender.com`)

**Deploy frontend to Vercel:**

1. In `frontend/`, create `.env.production`:
   ```
   REACT_APP_API_URL=https://stockvision-api.onrender.com
   ```
2. Push to GitHub
3. Import frontend folder to Vercel
4. Framework: Create React App
5. Deploy ✅

### Option B — Full Vercel (Monorepo)

Use the included `vercel.json`. Add environment variable `REACT_APP_API_URL` in Vercel project settings.

---

## 🔑 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend API URL | `https://api.yourdomain.com` |

Leave blank for local development (proxy handles it).

---

## 📡 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/stock/<SYMBOL>?period=1y` | Full stock data + predictions |
| `GET /api/search/<query>` | Search stock symbols |
| `GET /api/trending` | Trending stocks |

**Supported periods:** `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`

---

## 🧠 ML Model

The prediction engine uses a **Gradient Boosting** model (scikit-learn) with LSTM-style sequential features:

- Last closing price
- 5-day / 10-day / 20-day moving averages
- Volatility (rolling std)
- Price momentum

This runs serverlessly without TensorFlow, making it Vercel-compatible. For a full TensorFlow LSTM model, see the `lstm_full` branch (requires a dedicated GPU server).

---

## 📦 Tech Stack

- **Frontend:** React 18, Chart.js 4, react-chartjs-2, Lucide icons
- **Backend:** Python 3.10+, Flask 3, yfinance, pandas, numpy, scikit-learn
- **Data:** Yahoo Finance (via yfinance)
- **Deployment:** Vercel (frontend) + Render (backend)

---

## 🛠 Git Setup

```bash
git init
git add .
git commit -m "🚀 Initial commit: StockVision AI stock platform"
git remote add origin https://github.com/YOUR_USERNAME/stockvision.git
git push -u origin main
```

---

## 📄 License

MIT — free to use, modify, and deploy.
