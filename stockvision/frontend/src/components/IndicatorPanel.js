import React from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

const BASE_OPTIONS = {
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
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(30, 45, 77, 0.3)', drawBorder: false },
      ticks: {
        color: '#4a5878',
        font: { family: 'Space Mono', size: 10 },
        maxTicksLimit: 6,
        maxRotation: 0,
      },
    },
    y: {
      position: 'right',
      grid: { color: 'rgba(30, 45, 77, 0.3)', drawBorder: false },
      ticks: {
        color: '#4a5878',
        font: { family: 'Space Mono', size: 10 },
      },
    },
  },
};

export default function IndicatorPanel({ data, type }) {
  const step = Math.max(1, Math.floor(data.dates.length / 150));
  const labels = data.dates.filter((_, i) => i % step === 0);

  if (type === 'rsi') {
    const rsi = (data.rsi || []).filter((_, i) => i % step === 0);
    const lastRSI = data.rsi?.[data.rsi.length - 1] || 50;
    const rsiColor = lastRSI > 70 ? '#ef4444' : lastRSI < 30 ? '#10b981' : '#3b82f6';
    const rsiStatus = lastRSI > 70 ? 'OVERBOUGHT' : lastRSI < 30 ? 'OVERSOLD' : 'NEUTRAL';

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 700,
            color: rsiColor,
          }}>
            {lastRSI.toFixed(1)}
          </div>
          <div style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            padding: '3px 8px',
            borderRadius: 20,
            background: `${rsiColor}22`,
            border: `1px solid ${rsiColor}44`,
            color: rsiColor,
          }}>
            {rsiStatus}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
            30 = Oversold · 70 = Overbought
          </div>
        </div>
        <div style={{ height: 100 }}>
          <Line
            data={{
              labels,
              datasets: [{
                data: rsi,
                borderColor: '#3b82f6',
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.3,
                fill: false,
              }],
            }}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                ...BASE_OPTIONS.plugins,
                tooltip: {
                  ...BASE_OPTIONS.plugins.tooltip,
                  callbacks: { label: (ctx) => ` RSI: ${Number(ctx.raw).toFixed(1)}` },
                },
                annotation: {},
              },
              scales: {
                ...BASE_OPTIONS.scales,
                y: {
                  ...BASE_OPTIONS.scales.y,
                  min: 0,
                  max: 100,
                  ticks: {
                    ...BASE_OPTIONS.scales.y.ticks,
                    callback: (v) => v,
                    stepSize: 25,
                  },
                },
              },
            }}
          />
        </div>
        {/* Reference lines drawn on canvas via CSS overlay */}
        <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>━ 70 Overbought</span>
          <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'var(--font-mono)' }}>━ 30 Oversold</span>
        </div>
      </div>
    );
  }

  if (type === 'macd') {
    const macd = (data.macd || []).filter((_, i) => i % step === 0);
    const signal = (data.macdSignal || []).filter((_, i) => i % step === 0);
    const hist = (data.macdHist || []).filter((_, i) => i % step === 0);
    const lastMACD = data.macd?.[data.macd.length - 1] || 0;
    const lastSignal = data.macdSignal?.[data.macdSignal.length - 1] || 0;
    const bullish = lastMACD > lastSignal;

    return (
      <div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
            MACD {lastMACD.toFixed(3)}
          </span>
          <span style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
            SIG {lastSignal.toFixed(3)}
          </span>
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 20,
            background: bullish ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${bullish ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: bullish ? '#10b981' : '#ef4444',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
          }}>
            {bullish ? '▲ BULLISH' : '▼ BEARISH'}
          </span>
        </div>
        <div style={{ height: 120 }}>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Histogram',
                  data: hist,
                  backgroundColor: hist.map(v => v >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'),
                  borderColor: hist.map(v => v >= 0 ? '#10b981' : '#ef4444'),
                  borderWidth: 0,
                  barPercentage: 0.8,
                },
                {
                  type: 'line',
                  label: 'MACD',
                  data: macd,
                  borderColor: '#3b82f6',
                  borderWidth: 1.5,
                  pointRadius: 0,
                  tension: 0.3,
                  fill: false,
                },
                {
                  type: 'line',
                  label: 'Signal',
                  data: signal,
                  borderColor: '#f59e0b',
                  borderWidth: 1.5,
                  pointRadius: 0,
                  tension: 0.3,
                  fill: false,
                },
              ],
            }}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                ...BASE_OPTIONS.plugins,
                tooltip: {
                  ...BASE_OPTIONS.plugins.tooltip,
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toFixed(4)}`,
                  },
                },
              },
              scales: {
                ...BASE_OPTIONS.scales,
                y: {
                  ...BASE_OPTIONS.scales.y,
                  ticks: {
                    ...BASE_OPTIONS.scales.y.ticks,
                    callback: (v) => v.toFixed(1),
                  },
                },
              },
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'volume') {
    const volumes = (data.volumes || []).filter((_, i) => i % step === 0);
    const prices = (data.prices || []).filter((_, i) => i % step === 0);
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const lastVol = data.volumes?.[data.volumes.length - 1] || 0;
    const volHigh = lastVol > avgVol * 1.5;

    return (
      <div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Last: {(lastVol / 1e6).toFixed(2)}M
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Avg: {(avgVol / 1e6).toFixed(2)}M
          </span>
          {volHigh && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 20,
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b',
              fontFamily: 'var(--font-mono)',
            }}>
              HIGH VOLUME
            </span>
          )}
        </div>
        <div style={{ height: 100 }}>
          <Bar
            data={{
              labels,
              datasets: [{
                label: 'Volume',
                data: volumes,
                backgroundColor: volumes.map((_, i) => {
                  if (i === 0) return 'rgba(59,130,246,0.4)';
                  return prices[i] >= prices[i - 1]
                    ? 'rgba(16,185,129,0.4)'
                    : 'rgba(239,68,68,0.4)';
                }),
                borderColor: volumes.map((_, i) => {
                  if (i === 0) return '#3b82f6';
                  return prices[i] >= prices[i - 1] ? '#10b981' : '#ef4444';
                }),
                borderWidth: 0,
                barPercentage: 0.9,
              }],
            }}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                ...BASE_OPTIONS.plugins,
                tooltip: {
                  ...BASE_OPTIONS.plugins.tooltip,
                  callbacks: {
                    label: (ctx) => ` Volume: ${(Number(ctx.raw) / 1e6).toFixed(2)}M`,
                  },
                },
              },
              scales: {
                ...BASE_OPTIONS.scales,
                y: {
                  ...BASE_OPTIONS.scales.y,
                  ticks: {
                    ...BASE_OPTIONS.scales.y.ticks,
                    callback: (v) => (v / 1e6).toFixed(0) + 'M',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}
