from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(prices, fast=12, slow=26, signal=9):
    exp1 = prices.ewm(span=fast, adjust=False).mean()
    exp2 = prices.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line
    return macd, signal_line, histogram

def lstm_predict(prices_array, days=7):
    """Simple LSTM-style prediction using numpy (no TF dependency for serverless)"""
    try:
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled = scaler.fit_transform(prices_array.reshape(-1, 1))
        
        seq_len = min(60, len(scaled) - 1)
        X, y = [], []
        for i in range(seq_len, len(scaled)):
            X.append(scaled[i-seq_len:i, 0])
            y.append(scaled[i, 0])
        
        X, y = np.array(X), np.array(y)
        
        # Linear regression as fallback predictor (works on Vercel without TF)
        from sklearn.linear_model import LinearRegression
        from sklearn.ensemble import GradientBoostingRegressor
        
        # Feature engineering
        features = []
        for i in range(len(X)):
            row = X[i]
            features.append([
                row[-1],           # last price
                row[-5:].mean(),   # 5-day avg
                row[-10:].mean(),  # 10-day avg
                row[-20:].mean() if len(row) >= 20 else row.mean(),
                np.std(row[-10:]),  # volatility
                row[-1] - row[-5],  # momentum
            ])
        
        features = np.array(features)
        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
        model.fit(features, y)
        
        # Predict next N days
        predictions = []
        current_seq = list(scaled[-seq_len:, 0])
        
        for _ in range(days):
            seq = np.array(current_seq[-seq_len:])
            feat = [
                seq[-1],
                seq[-5:].mean(),
                seq[-10:].mean() if len(seq) >= 10 else seq.mean(),
                seq[-20:].mean() if len(seq) >= 20 else seq.mean(),
                np.std(seq[-10:]) if len(seq) >= 10 else np.std(seq),
                seq[-1] - seq[-5] if len(seq) >= 5 else 0,
            ]
            pred = model.predict([feat])[0]
            predictions.append(pred)
            current_seq.append(pred)
        
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = scaler.inverse_transform(predictions).flatten()
        return predictions.tolist()
    except Exception as e:
        # Fallback: simple trend extrapolation
        last_prices = prices_array[-30:]
        slope = np.polyfit(range(len(last_prices)), last_prices, 1)[0]
        last = prices_array[-1]
        return [last + slope * (i + 1) for i in range(days)]

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    try:
        period = request.args.get('period', '1y')
        ticker = yf.Ticker(symbol.upper())
        hist = ticker.history(period=period)
        
        if hist.empty:
            return jsonify({'error': f'No data found for {symbol}'}), 404
        
        info = ticker.info
        
        # Price data
        prices = hist['Close'].values
        dates = [d.strftime('%Y-%m-%d') for d in hist.index]
        
        # Indicators
        close_series = hist['Close']
        rsi = calculate_rsi(close_series).fillna(50)
        ma20 = close_series.rolling(20).mean().fillna(method='bfill')
        ma50 = close_series.rolling(50).mean().fillna(method='bfill')
        ma200 = close_series.rolling(200).mean().fillna(method='bfill')
        macd_line, signal_line, histogram = calculate_macd(close_series)
        
        # LSTM Predictions
        predictions = lstm_predict(prices, days=7)
        last_date = hist.index[-1]
        pred_dates = []
        for i in range(1, 8):
            d = last_date + timedelta(days=i)
            while d.weekday() >= 5:
                d += timedelta(days=1)
            pred_dates.append(d.strftime('%Y-%m-%d'))
        
        # Candlestick data
        candles = []
        for i, date in enumerate(dates):
            candles.append({
                'x': date,
                'o': round(float(hist['Open'].iloc[i]), 2),
                'h': round(float(hist['High'].iloc[i]), 2),
                'l': round(float(hist['Low'].iloc[i]), 2),
                'c': round(float(hist['Close'].iloc[i]), 2),
                'v': int(hist['Volume'].iloc[i]),
            })
        
        return jsonify({
            'symbol': symbol.upper(),
            'name': info.get('longName', symbol),
            'sector': info.get('sector', 'N/A'),
            'currency': info.get('currency', 'USD'),
            'currentPrice': round(float(prices[-1]), 2),
            'previousClose': round(float(info.get('previousClose', prices[-2])), 2),
            'marketCap': info.get('marketCap', 0),
            'volume': info.get('volume', 0),
            'pe': info.get('trailingPE', None),
            'high52w': info.get('fiftyTwoWeekHigh', None),
            'low52w': info.get('fiftyTwoWeekLow', None),
            'dates': dates,
            'prices': [round(float(p), 2) for p in prices],
            'volumes': [int(v) for v in hist['Volume'].values],
            'candles': candles,
            'rsi': [round(float(r), 2) for r in rsi.values],
            'ma20': [round(float(m), 2) if not np.isnan(m) else None for m in ma20.values],
            'ma50': [round(float(m), 2) if not np.isnan(m) else None for m in ma50.values],
            'ma200': [round(float(m), 2) if not np.isnan(m) else None for m in ma200.values],
            'macd': [round(float(m), 4) if not np.isnan(m) else 0 for m in macd_line.values],
            'macdSignal': [round(float(m), 4) if not np.isnan(m) else 0 for m in signal_line.values],
            'macdHist': [round(float(m), 4) if not np.isnan(m) else 0 for m in histogram.values],
            'predictions': [round(float(p), 2) for p in predictions],
            'predDates': pred_dates,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search/<query>', methods=['GET'])
def search_stocks(query):
    # Common stock suggestions
    common = {
        'AAPL': 'Apple Inc.', 'MSFT': 'Microsoft', 'GOOGL': 'Alphabet',
        'AMZN': 'Amazon', 'TSLA': 'Tesla', 'META': 'Meta Platforms',
        'NVDA': 'NVIDIA', 'NFLX': 'Netflix', 'AMD': 'Advanced Micro Devices',
        'INTC': 'Intel', 'BABA': 'Alibaba', 'TSM': 'TSMC',
        'V': 'Visa', 'JPM': 'JPMorgan Chase', 'WMT': 'Walmart',
        'DIS': 'Disney', 'BA': 'Boeing', 'GE': 'General Electric',
        'RELIANCE.NS': 'Reliance Industries', 'TCS.NS': 'Tata Consultancy Services',
        'INFY': 'Infosys', 'HDFCBANK.NS': 'HDFC Bank', 'WIPRO.NS': 'Wipro',
        'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum',
        'SPOT': 'Spotify', 'UBER': 'Uber', 'LYFT': 'Lyft',
        'ZM': 'Zoom', 'SHOP': 'Shopify', 'SQ': 'Block (Square)',
    }
    q = query.upper()
    results = [
        {'symbol': k, 'name': v}
        for k, v in common.items()
        if q in k or q in v.upper()
    ][:8]
    return jsonify(results)

@app.route('/api/trending', methods=['GET'])
def trending():
    symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN']
    results = []
    for sym in symbols:
        try:
            t = yf.Ticker(sym)
            hist = t.history(period='2d')
            if len(hist) >= 2:
                change = ((hist['Close'].iloc[-1] - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2]) * 100
                results.append({
                    'symbol': sym,
                    'price': round(float(hist['Close'].iloc[-1]), 2),
                    'change': round(float(change), 2),
                })
        except:
            pass
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
