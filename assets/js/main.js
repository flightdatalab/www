document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation toggle
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      siteNav.classList.toggle("open");
    });
  }

  // Copy install commands
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const orig = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = orig;
        }, 1600);
      } catch (e) {
        btn.textContent = "Copied";
      }
    });
  });

  // Interactive UAV Telemetry Inspector
  const canvas = document.getElementById("telemetryCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const scenarios = {
    nominal: {
      badgeText: "0 Anomalies Detected",
      badgeClass: "ok",
      remaining: "14m 20s",
      voltage: "3.82 V",
      hdop: "0.94",
      imu: "0.12 σ",
      voltSeries: [25.1, 24.9, 24.7, 24.5, 24.3, 24.1, 23.9, 23.7, 23.5, 23.3, 23.1, 22.9],
      imuSeries: [1.2, 1.3, 1.25, 1.4, 1.35, 1.3, 1.28, 1.32, 1.38, 1.3, 1.26, 1.24],
      anomalyRange: null,
      logs: [
        "[00:01.0] INFO  Normalized 12,480 frames -> Parquet",
        "[00:14.2] INFO  EKF2 innovation residuals within 0.25σ",
        "[00:28.5] INFO  LiPo 6S discharge slope nominal (-0.18 V/min)",
        "[00:42.0] OK    Battery Life Estimator: 14m 20s remaining"
      ]
    },
    voltage_sag: {
      badgeText: "1 Voltage Sag Event",
      badgeClass: "warn",
      remaining: "06m 45s",
      voltage: "3.41 V",
      hdop: "1.02",
      imu: "0.38 σ",
      voltSeries: [24.8, 24.5, 24.1, 23.6, 21.2, 20.6, 22.4, 22.3, 22.0, 21.8, 21.5, 21.2],
      imuSeries: [1.4, 1.5, 1.6, 1.9, 2.3, 2.1, 1.7, 1.6, 1.5, 1.5, 1.4, 1.4],
      anomalyRange: [4, 6],
      logs: [
        "[00:18.4] WARN  Sudden pack sag detected: 23.6V -> 20.6V",
        "[00:19.1] ALERT High current burst (54.2A) under climb load",
        "[00:24.0] INFO  Voltage recovery partial (+1.8V); cell IR elevated",
        "[00:31.5] EST   Adjusted endurance: 06m 45s (-4m 10s penalty)"
      ]
    },
    imu_gps: {
      badgeText: "2 Telemetry Outliers",
      badgeClass: "warn",
      remaining: "11m 50s",
      voltage: "3.76 V",
      hdop: "2.65",
      imu: "4.18 σ",
      voltSeries: [24.9, 24.7, 24.5, 24.3, 24.1, 23.9, 23.7, 23.5, 23.3, 23.1, 22.9, 22.7],
      imuSeries: [1.3, 1.4, 1.5, 4.8, 5.2, 1.9, 1.6, 3.9, 1.7, 1.4, 1.3, 1.3],
      anomalyRange: [3, 5],
      logs: [
        "[00:12.8] ALERT IMU Z-axis outlier (4.18σ) — harmonic prop vibration",
        "[00:15.0] WARN  GPS HDOP spike (0.95 -> 2.65); 4 sats dropped",
        "[00:22.4] INFO  Positional drift segmented (3.4m lateral offset)",
        "[00:35.0] OK    Flagged frames exported to anomaly_report.json"
      ]
    }
  };

  function drawChart(data) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pad = { top: 24, right: 28, bottom: 32, left: 44 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Grid lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    const n = data.voltSeries.length;
    const stepX = plotW / (n - 1);

    // Highlight anomaly window if present
    if (data.anomalyRange) {
      const [startIdx, endIdx] = data.anomalyRange;
      const x1 = pad.left + startIdx * stepX;
      const x2 = pad.left + endIdx * stepX;
      ctx.fillStyle = "rgba(245, 158, 11, 0.14)";
      ctx.fillRect(x1, pad.top, x2 - x1, plotH);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.55)";
      ctx.strokeRect(x1, pad.top, x2 - x1, plotH);
    }

    // Draw Voltage line (range 20V - 26V)
    ctx.beginPath();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2.5;
    data.voltSeries.forEach((v, idx) => {
      const x = pad.left + idx * stepX;
      const norm = (v - 20) / 6;
      const y = pad.top + plotH - norm * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw IMU line (range 0 - 6 m/s^2)
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.2;
    data.imuSeries.forEach((val, idx) => {
      const x = pad.left + idx * stepX;
      const norm = val / 6;
      const y = pad.top + plotH - norm * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("26V", 8, pad.top + 8);
    ctx.fillText("23V", 8, pad.top + plotH / 2 + 4);
    ctx.fillText("20V", 8, pad.top + plotH);
    ctx.fillText("t+0s", pad.left, h - 10);
    ctx.fillText("t+60s", w - pad.right - 36, h - 10);
  }

  function renderScenario(key) {
    const s = scenarios[key];
    if (!s) return;
    const badge = document.getElementById("anomalyBadge");
    badge.textContent = s.badgeText;
    badge.className = `status-pill ${s.badgeClass}`;
    document.getElementById("kpiRemaining").textContent = s.remaining;
    document.getElementById("kpiVoltage").textContent = s.voltage;
    document.getElementById("kpiHdop").textContent = s.hdop;
    document.getElementById("kpiImu").textContent = s.imu;
    document.getElementById("eventLogOutput").textContent = s.logs.join("\n");
    drawChart(s);
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      renderScenario(btn.getAttribute("data-scenario"));
    });
  });

  renderScenario("nominal");
});
