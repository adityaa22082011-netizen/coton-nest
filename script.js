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

// --- Canvas Wheel Rendering (Navratri Red & Gold Festive Edition) ---
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const center = 400;
const radius = 370;

// Alternating Navratri Royal Crimson & Festive Imperial Gold (Deepened Tones)
const SLICE_CONFIG = [
  { bg: '#6e071a', text: '#fef08a', isRed: true },  // ₹100 - Deep Crimson
  { bg: '#b45309', text: '#fffbeb', isRed: false }, // ₹105 - Deep Antique Gold
  { bg: '#580512', text: '#fef08a', isRed: true },  // ₹110 - Deep Ruby
  { bg: '#c27803', text: '#fffbeb', isRed: false }, // ₹115 - Deep Amber Gold
  { bg: '#78091a', text: '#fef08a', isRed: true },  // ₹120 - Deep Scarlet
  { bg: '#a15004', text: '#fffbeb', isRed: false }, // ₹125 - Antique Gold
  { bg: '#5c0615', text: '#fef08a', isRed: true },  // ₹130 - Regal Crimson
  { bg: '#b85d06', text: '#fffbeb', isRed: false }, // ₹135 - Sunlit Brass
  { bg: '#700819', text: '#fef08a', isRed: true },  // ₹140 - Velvet Red
  { bg: '#9a4403', text: '#fffbeb', isRed: false }, // ₹145 - Marigold
  { bg: '#c47306', text: '#fffbeb', isRed: false }, // ₹150 - Ultimate Navratri Gold
];

function drawWheel(angle) {
  ctx.clearRect(0, 0, 800, 800);
  const arc = (Math.PI * 2) / SEGMENTS_COUNT;

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(angle);

  // 1. Draw Alternating Crimson & Gold Segments
  for (let i = 0; i < SEGMENTS_COUNT; i++) {
    const segAngle = i * arc;
    const slice = SLICE_CONFIG[i % SLICE_CONFIG.length];

    ctx.beginPath();
    ctx.fillStyle = slice.bg;
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 20, segAngle, segAngle + arc);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Radiant Gold Divider line
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    // High Contrast Text rotated along slice radius
    ctx.save();
    ctx.fillStyle = slice.text;
    ctx.font = 'bold 34px Outfit, sans-serif';
    ctx.shadowColor = slice.isRed ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;

    ctx.translate(
      Math.cos(segAngle + arc / 2) * (radius * 0.65),
      Math.sin(segAngle + arc / 2) * (radius * 0.65)
    );
    ctx.rotate(segAngle + arc / 2 + Math.PI / 2);
    const text = `₹${DISCOUNTS[i]}`;
    ctx.fillText(text, -ctx.measureText(text).width / 2, 8);

    // "OFF" Sub-label
    ctx.font = '800 13px sans-serif';
    ctx.letterSpacing = '1px';
    const subText = 'OFF';
    ctx.fillText(subText, -ctx.measureText(subText).width / 2, 26);

    ctx.restore();
  }

  // 2. Deep Royal Crimson Bezel (matching user reference image)
  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.lineWidth = 24;
  ctx.strokeStyle = '#540713';
  ctx.stroke();

  // Outer Gold Stroke
  ctx.beginPath();
  ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#92400e';
  ctx.stroke();

  // Inner Gold Stroke
  ctx.beginPath();
  ctx.arc(0, 0, radius - 22, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  // 3. Auspicious 3D Golden Rivets / Brass Studs (uniform perimeter)
  const totalRivets = 22;
  for (let p = 0; p < totalRivets; p++) {
    const pegAngle = (p * Math.PI * 2) / totalRivets;
    const px = Math.cos(pegAngle) * (radius - 10);
    const py = Math.sin(pegAngle) * (radius - 10);

    // 3D Spherical metallic gold rivet gradient
    const grad = ctx.createRadialGradient(px - 1.5, py - 1.5, 1, px, py, 6);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(0.7, '#eab308');
    grad.addColorStop(1, '#78350f');

    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1.5;
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

  // Automatically pop out winning ticket modal (no scrolling needed on mobile/phones)
  const modalPop = document.getElementById('modalWinningTicket');
  if (modalPop) {
    const modalAmt = document.getElementById('modalBannerAmountText');
    const modalCode = document.getElementById('modalBannerCodeText');
    if (modalAmt) modalAmt.textContent = coupon.amount;
    if (modalCode) modalCode.textContent = coupon.code;
    modalPop.classList.remove('hidden');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Pop out ticket modal controls
  const modalWinning = document.getElementById('modalWinningTicket');
  const btnPopout = document.getElementById('btnPopoutTicket');
  if (btnPopout && modalWinning) {
    btnPopout.addEventListener('click', () => {
      if (activeCoupon) {
        document.getElementById('modalBannerAmountText').textContent = activeCoupon.amount;
        document.getElementById('modalBannerCodeText').textContent = activeCoupon.code;
        modalWinning.classList.remove('hidden');
      }
    });
  }

  const btnCloseWinning = document.getElementById('btnCloseWinningTicket');
  if (btnCloseWinning && modalWinning) {
    btnCloseWinning.addEventListener('click', () => modalWinning.classList.add('hidden'));
  }
  const btnClaimWinning = document.getElementById('btnClaimWinningTicket');
  if (btnClaimWinning && modalWinning) {
    btnClaimWinning.addEventListener('click', () => {
      if (activeCoupon) {
        navigator.clipboard.writeText(activeCoupon.code);
        btnClaimWinning.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          btnClaimWinning.textContent = 'Copy Code & Shop Now';
          modalWinning.classList.add('hidden');
        }, 1200);
      } else {
        modalWinning.classList.add('hidden');
      }
    });
  }

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
