// ==========================================
// Cotton Nest Lucky Spin - script.js
// ==========================================

const DISCOUNTS = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];
const SEGMENTS_COUNT = DISCOUNTS.length;
const STORAGE_KEY = 'jackpot_won_coupon_v1';
const HISTORY_KEY = 'jackpot_coupon_history_v1';

let soundEnabled = true;
let isSpinning = false;
let currentRotation = 0; // in radians
let activeCoupon = null;

// --- Audio Synthesis via Web Audio API ---
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

function playFanfare() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.45);
    });
  } catch (e) {}
}

// --- Canvas Wheel Rendering ---
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const center = 400;
const radius = 370;

const COLORS = [
  '#0284c7', '#0369a1', '#0ea5e9', '#38bdf8',
  '#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa',
  '#0891b2', '#06b6d4', '#0284c7'
];

function drawWheel(angle) {
  ctx.clearRect(0, 0, 800, 800);
  const arc = (Math.PI * 2) / SEGMENTS_COUNT;

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(angle);

  // Draw Segments
  for (let i = 0; i < SEGMENTS_COUNT; i++) {
    const segAngle = i * arc;
    ctx.beginPath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, segAngle, segAngle + arc);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Divider line
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Amount text
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.translate(
      Math.cos(segAngle + arc / 2) * (radius * 0.72),
      Math.sin(segAngle + arc / 2) * (radius * 0.72)
    );
    ctx.rotate(segAngle + arc / 2 + Math.PI / 2);
    const text = `₹${DISCOUNTS[i]}`;
    ctx.fillText(text, -ctx.measureText(text).width / 2, 10);
    ctx.restore();
  }

  // Outer gold rim
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#f59e0b';
  ctx.stroke();

  // Perimeter pegs
  for (let p = 0; p < SEGMENTS_COUNT * 2; p++) {
    const pegAngle = (p * Math.PI) / SEGMENTS_COUNT;
    const px = Math.cos(pegAngle) * (radius - 1);
    const py = Math.sin(pegAngle) * (radius - 1);
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    ctx.fill();
  }

  ctx.restore();
}

// --- Spin Logic ---
function spinToPrize(targetAmount) {
  if (isSpinning) return;
  isSpinning = true;

  const targetIndex = DISCOUNTS.indexOf(targetAmount);
  const arc = (Math.PI * 2) / SEGMENTS_COUNT;
  const fullTurns = 6 + Math.floor(Math.random() * 2);
  const targetAngleAtTop = -Math.PI / 2;
  const segmentCenterAngle = targetIndex * arc + arc / 2;

  let finalRotation = fullTurns * Math.PI * 2 + (targetAngleAtTop - segmentCenterAngle);
  while (finalRotation < currentRotation + 4 * Math.PI * 2) {
    finalRotation += Math.PI * 2;
  }

  const startRotation = currentRotation;
  const duration = 5000;
  const startTime = performance.now();
  let lastPegIndex = -1;

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4.5);
    currentRotation = startRotation + (finalRotation - startRotation) * easeOut;

    drawWheel(currentRotation);

    const currentPeg = Math.floor((currentRotation / arc) * 2);
    if (currentPeg !== lastPegIndex) {
      playTick();
      lastPegIndex = currentPeg;

      const pointer = document.getElementById('wheelPointer');
      pointer.style.transform = 'rotate(-14deg)';
      setTimeout(() => { pointer.style.transform = 'rotate(0deg)'; }, 40);
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      onSpinComplete(targetAmount);
    }
  }

  requestAnimationFrame(animate);
}

function onSpinComplete(amount) {
  playFanfare();
  if (typeof confetti === 'function') {
    confetti({
      particleCount: amount >= 140 ? 110 : 80,
      spread: 85,
      origin: { y: 0.65 },
      colors: ['#38bdf8', '#0284c7', '#f59e0b', '#10b981', '#ffffff']
    });
  }

  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  activeCoupon = {
    amount: amount,
    code: `LUCKY${amount}-${randomChars}`,
    date: new Date().toLocaleDateString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(activeCoupon));

  let history = [];
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch(e) {}
  history.unshift(activeCoupon);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  showVoucher(activeCoupon);
  lockSpinButton();
}

function showVoucher(coupon) {
  document.getElementById('bannerAmountText').textContent = coupon.amount;
  document.getElementById('bannerCodeText').textContent = coupon.code;
  document.getElementById('voucherSection').classList.remove('hidden');
}

function lockSpinButton() {
  const btn = document.getElementById('btnSpin');
  btn.disabled = true;
  document.getElementById('spinButtonText').textContent = 'LOCKED';
  document.getElementById('spinButtonSub').textContent = 'CLAIMED';
}

// --- Initialize Event Listeners on Page Load ---
window.addEventListener('DOMContentLoaded', () => {
  drawWheel(0);

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      activeCoupon = JSON.parse(saved);
      showVoucher(activeCoupon);
      lockSpinButton();
      const targetIndex = DISCOUNTS.indexOf(activeCoupon.amount);
      const arc = (Math.PI * 2) / SEGMENTS_COUNT;
      currentRotation = -Math.PI / 2 - (targetIndex * arc + arc / 2);
      drawWheel(currentRotation);
    } catch(e) {}
  }

  document.getElementById('btnSpin').addEventListener('click', () => {
    if (isSpinning || activeCoupon) return;
    const prize = DISCOUNTS[Math.floor(Math.random() * DISCOUNTS.length)];
    spinToPrize(prize);
  });

  document.getElementById('btnSound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('iconSoundOn').classList.toggle('hidden', !soundEnabled);
    document.getElementById('iconSoundOff').classList.toggle('hidden', soundEnabled);
  });

  document.getElementById('btnCopyCode').addEventListener('click', () => {
    if (!activeCoupon) return;
    navigator.clipboard.writeText(activeCoupon.code);
    const btnText = document.getElementById('copyButtonText');
    btnText.textContent = 'Copied to Clipboard!';
    setTimeout(() => { btnText.textContent = 'Copy Promo Code'; }, 2200);
  });

  document.getElementById('btnResetSpin').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    activeCoupon = null;
    document.getElementById('voucherSection').classList.add('hidden');
    const btn = document.getElementById('btnSpin');
    btn.disabled = false;
    document.getElementById('spinButtonText').textContent = 'SPIN';
    document.getElementById('spinButtonSub').textContent = '100% Win';
  });

  // Modal logic
  const modalPrize = document.getElementById('modalPrizeTable');
  document.getElementById('btnPrizeTable').addEventListener('click', () => modalPrize.classList.remove('hidden'));
  document.getElementById('btnClosePrizeTable').addEventListener('click', () => modalPrize.classList.add('hidden'));
  document.getElementById('btnOkPrizeTable').addEventListener('click', () => modalPrize.classList.add('hidden'));

  const modalHistory = document.getElementById('modalHistory');
  document.getElementById('btnHistory').addEventListener('click', () => {
    let history = [];
    try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch(e) {}
    const list = document.getElementById('historyList');
    if (history.length === 0) {
      list.innerHTML = '<p class="text-slate-400 text-center py-6">No previous coupons claimed yet.</p>';
    } else {
      list.innerHTML = history.map(h => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div>
            <span class="font-extrabold text-slate-900 font-outfit">₹${h.amount} OFF</span>
            <span class="text-[10px] text-slate-400 block">${h.date || 'Recent'}</span>
          </div>
          <span class="font-mono text-xs font-bold text-sky-700 bg-white px-2 py-1 rounded border border-slate-200">${h.code}</span>
        </div>
      `).join('');
    }
    modalHistory.classList.remove('hidden');
  });
  document.getElementById('btnCloseHistory').addEventListener('click', () => modalHistory.classList.add('hidden'));
  document.getElementById('btnOkHistory').addEventListener('click', () => modalHistory.classList.add('hidden'));
});
