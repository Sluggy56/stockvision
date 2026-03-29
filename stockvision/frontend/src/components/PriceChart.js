import React, { useRef, useEffect } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
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
        title: (items) => items[0]?.label || '',
        label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.raw).toFixed(2)}`,
      }
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(30, 45, 77, 0.4)', drawBorder: false },
      ticks: {
        color: '#4a5878',
        font: { family: 'Space Mono', size: 10 },
        maxTicksLimit: 8,
        maxRotation: 0,
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

export default function PriceChart({ data, chartType, showMAs }) {
  // Thin data for performance
  const step = Math.max(1, Math.floor(data.dates.length / 200));
  const labels = data.dates.filter((_, i) => i % step === 0);
  const prices = data.prices.filter((_, i) => i % step === 0);
  const ma20 = (data.ma20 || []).filter((_, i) => i % step === 0);
  const ma50 = (data.ma50 || []).filter((_, i) => i % step === 0);
  const ma200 = (data.ma200 || []).filter((_, i) => i % step === 0);

  const isUp = prices[prices.length - 1] >= prices[0];
  const mainColor = isUp ? '#10b981' : '#ef4444';
  const mainColorAlpha = isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  // Candlestick via Bar chart approximation
  if (chartType === 'candle') {
    const candles = data.candles.filter((_, i) => i % step === 0);
    return <CandleChart candles={candles} />;
  }

  const datasets = [
    {
      label: data.symbol,
      data: prices,
      borderColor: mainColor,
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: chartType === 'area',
      backgroundColor: chartType === 'area'
        ? (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
            gradient.addColorStop(0, mainColor.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, mainColor.replace(')', ', 0)').replace('rgb', 'rgba'));
            return gradient;
          }
        : 'transparent',
      tension: 0.3,
    },
  ];

  if (showMAs.ma20) {
    datasets.push({
      label: 'MA20',
      data: ma20,
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderDash: [],
      pointRadius: 0,
      fill: false,
      tension: 0.3,
    });
  }
  if (showMAs.ma50) {
    datasets.push({
      label: 'MA50',
      data: ma50,
      borderColor: '#f59e0b',
      borderWidth: 1,
      pointRadius: 0,
      fill: false,
      tension: 0.3,
    });
  }
  if (showMAs.ma200) {
    datasets.push({
      label: 'MA200',
      data: ma200,
      borderColor: '#8b5cf6',
      borderWidth: 1,
      pointRadius: 0,
      fill: false,
      tension: 0.3,
    });
  }

  return (
    <div style={{ height: 300 }}>
      <Line
        data={{ labels, datasets }}
        options={{
          ...CHART_OPTIONS,
          plugins: {
            ...CHART_OPTIONS.plugins,
            tooltip: {
              ...CHART_OPTIONS.plugins.tooltip,
              callbacks: {
                title: (items) => items[0]?.label || '',
                label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.raw || 0).toFixed(2)}`,
              }
            }
          }
        }}
      />
    </div>
  );
}

function CandleChart({ candles }) {
  // Draw custom candlesticks using canvas
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 300;

    const prices_all = candles.flatMap(c => [c.h, c.l]);
    const minP = Math.min(...prices_all);
    const maxP = Math.max(...prices_all);
    const range = maxP - minP;
    const pad = { top: 20, bottom: 30, left: 10, right: 50 };

    const toY = (p) => pad.top + (1 - (p - minP) / range) * (H - pad.top - pad.bottom);
    const candleW = Math.max(1, Math.floor((W - pad.left - pad.right) / candles.length) - 1);
    const x = (i) => pad.left + i * ((W - pad.left - pad.right) / candles.length) + candleW / 2;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(30, 45, 77, 0.4)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * (H - pad.top - pad.bottom);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const val = maxP - (i / 4) * range;
      ctx.fillStyle = '#4a5878';
      ctx.font = '10px Space Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('$' + val.toFixed(0), W - pad.right + 4, y + 4);
    }

    // Candles
    candles.forEach((c, i) => {
      const isUp = c.c >= c.o;
      const color = isUp ? '#10b981' : '#ef4444';
      const cx = x(i);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, toY(c.h));
      ctx.lineTo(cx, toY(c.l));
      ctx.stroke();

      // Body
      const bodyTop = toY(Math.max(c.o, c.c));
      const bodyBot = toY(Math.min(c.o, c.c));
      const bodyH = Math.max(1, bodyBot - bodyTop);
      ctx.fillStyle = isUp ? color : color;
      ctx.globalAlpha = isUp ? 0.8 : 0.7;
      ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH);
      ctx.globalAlpha = 1;
    });

    // X axis labels
    ctx.fillStyle = '#4a5878';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'center';
    const step = Math.floor(candles.length / 6);
    for (let i = 0; i < candles.length; i += step) {
      const label = candles[i].x?.substring(5) || '';
      ctx.fillText(label, x(i), H - 8);
    }
  }, [candles]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 300, display: 'block' }} />;
}
