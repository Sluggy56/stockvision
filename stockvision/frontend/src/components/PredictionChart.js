import React from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function PredictionChart({ data }) {
  const historyCount = 30;
  const histDates = data.dates.slice(-historyCount);
  const histPrices = data.prices.slice(-historyCount);
  const predDates = data.predDates || [];
  const predictions = data.predictions || [];

  const labels = [...histDates, ...predDates];
  const histData = [...histPrices, ...Array(predDates.length).fill(null)];
  const predData = [
    ...Array(historyCount - 1).fill(null),
    histPrices[histPrices.length - 1],
    ...predictions,
  ];

  const lastHist = histPrices[histPrices.length - 1];
  const lastPred = predictions[predictions.length - 1];
  const predUp = lastPred >= lastHist;
  const predColor = predUp ? '#10b981' : '#ef4444';

  const confidenceUpper = predData.map(v => v != null ? v * 1.025 : null);
  const confidenceLower = predData.map(v => v != null ? v * 0.975 : null);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Historical',
        data: histData,
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'AI Prediction',
        data: predData,
        borderColor: predColor,
        borderWidth: 2,
        borderDash: [6, 3],
        pointRadius: (ctx) => {
          const idx = ctx.dataIndex;
          return idx >= historyCount ? 4 : 0;
        },
        pointBackgroundColor: predColor,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Upper Confidence',
        data: confidenceUpper,
        borderColor: 'transparent',
        backgroundColor: predUp ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        fill: '+1',
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: 'Lower Confidence',
        data: confidenceLower,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        fill: false,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#8899bb',
          font: { family: 'Space Mono', size: 10 },
          boxWidth: 20,
          padding: 12,
          filter: (item) => item.text !== 'Upper Confidence' && item.text !== 'Lower Confidence',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(13, 18, 32, 0.95)',
        borderColor: '#2a3d6b',
        borderWidth: 1,
        titleColor: '#8899bb',
        bodyColor: '#e2e8f7',
        titleFont: { family: 'Space Mono', size: 11 },
        bodyFont: { family: 'Space Mono', size: 12 },
        padding: 12,
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.label === 'Upper Confidence' || ctx.dataset.label === 'Lower Confidence') return null;
            const v = ctx.raw;
            if (v == null) return null;
            return ` ${ctx.dataset.label}: $${Number(v).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 45, 77, 0.4)', drawBorder: false },
        ticks: {
          color: '#4a5878',
          font: { family: 'Space Mono', size: 10 },
          maxTicksLimit: 10,
          maxRotation: 0,
          callback: function(val, idx) {
            const label = this.getLabelForValue(val);
            return label ? label.substring(5) : '';
          },
        },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(30, 45, 77, 0.4)', drawBorder: false },
        ticks: {
          color: '#4a5878',
          font: { family: 'Space Mono', size: 10 },
          callback: (v) => '$' + v.toFixed(0),
        },
      },
    },
  };

  const totalChange = ((lastPred - lastHist) / lastHist * 100).toFixed(2);

  return (
    <div>
      {/* Prediction summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        {predictions.slice(0, 4).map((p, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 10px',
            textAlign: 'center',
            flex: 1,
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              {predDates[i] ? predDates[i].substring(5) : `Day ${i+1}`}
            </div>
            <div style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: p >= lastHist ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              ${p.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 240 }}>
        <Line data={chartData} options={options} />
      </div>

      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        background: predUp ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        border: `1px solid ${predUp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          🧠 LSTM 7-Day Forecast
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: predUp ? 'var(--accent-green)' : 'var(--accent-red)',
        }}>
          {predUp ? '▲' : '▼'} {Math.abs(totalChange)}% expected
        </span>
      </div>
    </div>
  );
}
