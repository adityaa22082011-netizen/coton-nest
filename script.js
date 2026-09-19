const prizes = [
  { amount: 150, text: '₹150 OFF (Grand Prize)', color: '#0f172a', textColor: '#ffffff' },
  { amount: 100, text: '₹100 OFF', color: '#f8fafc', textColor: '#0f172a' },
  { amount: 145, text: '₹145 OFF', color: '#0284c7', textColor: '#ffffff' },
  { amount: 105, text: '₹105 OFF', color: '#f1f5f9', textColor: '#0f172a' },
  { amount: 140, text: '₹140 OFF', color: '#38bdf8', textColor: '#0f172a' },
  { amount: 110, text: '₹110 OFF', color: '#e2e8f0', textColor: '#0f172a' },
  { amount: 135, text: '₹135 OFF', color: '#0369a1', textColor: '#ffffff' },
  { amount: 115, text: '₹115 OFF', color: '#cbd5e1', textColor: '#0f172a' },
  { amount: 130, text: '₹130 OFF', color: '#bae6fd', textColor: '#0f172a' },
  { amount: 120, text: '₹120 OFF', color: '#94a3b8', textColor: '#ffffff' },
  { amount: 125, text: '₹125 OFF', color: '#e0f2fe', textColor: '#0f172a' }
];

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const numSegments = prizes.length;
const arcSize = (2 * Math.PI) / numSegments;
let isSpinning = false;

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 20;
  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < numSegments; i++) {
    const angle = i * arcSize;
    ctx.fillStyle = prizes[i].color;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + arcSize);
    ctx.lineTo(center, center);
    ctx.fill();
    ctx.save();
    ctx.fillStyle = prizes[i].textColor;
    ctx.translate(center, center);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "bold 26px 'Outfit', sans-serif";
    ctx.fillText("₹" + prizes[i].amount, radius - 40, 0);
    ctx.restore();
  }
}

document.getElementById('btnSpin').addEventListener('click', () => {
  if (isSpinning) return;
  isSpinning = true;
  document.getElementById('btnSpin').disabled = true;
  const winningIndex = Math.floor(Math.random() * numSegments);
  const chosenPrize = prizes[winningIndex];
  const degreesPerSegment = 360 / numSegments;
  const targetAngle = 270 - (winningIndex * degreesPerSegment) - (degreesPerSegment / 2);
  const totalRotation = (5 * 360) + targetAngle;
  canvas.style.transform = `rotate(${totalRotation}deg)`;
  setTimeout(() => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    document.getElementById('voucherAmount').innerText = `₹${chosenPrize.amount} OFF`;
    const code = `LUCKY${chosenPrize.amount}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    document.getElementById('promoCode').innerText = code;
    document.getElementById('voucherSection').classList.remove('hidden');
    localStorage.setItem('cotton_nest_voucher', JSON.stringify({ amount: chosenPrize.amount, code: code }));
    updateHistory();
    isSpinning = false;
  }, 4000);
});

document.getElementById('btnCopy').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('promoCode').innerText).then(() => {
    document.getElementById('btnCopy').innerText = 'Copied!';
  });
});

document.getElementById('btnReset').addEventListener('click', () => {
  localStorage.removeItem('cotton_nest_voucher');
  canvas.style.transform = 'rotate(0deg)';
  document.getElementById('btnSpin').disabled = false;
  document.getElementById('voucherSection').classList.add('hidden');
  updateHistory();
});

document.getElementById('btnPrizeTable').addEventListener('click', () => {
  document.getElementById('prizeList').innerHTML = prizes.map(p => `<div><b>${p.text}</b> - Guaranteed Pool</div>`).join('');
  document.getElementById('modalPrizes').classList.remove('hidden');
});

document.getElementById('btnHistory').addEventListener('click', () => { 
  updateHistory(); 
  document.getElementById('modalHistory').classList.remove('hidden'); 
});

document.querySelectorAll('.closeModal').forEach(btn => { 
  btn.addEventListener('click', () => { 
    document.getElementById('modalPrizes').classList.add('hidden'); 
    document.getElementById('modalHistory').classList.add('hidden'); 
  }); 
});

function updateHistory() {
  const data = localStorage.getItem('cotton_nest_voucher');
  document.getElementById('historyContent').innerHTML = data ? `Claimed Code: ${JSON.parse(data).code}` : `No coupons claimed yet.`;
}

drawWheel();
updateHistory();
const saved = localStorage.getItem('cotton_nest_voucher');
if (saved) {
  document.getElementById('voucherAmount').innerText = `₹${JSON.parse(saved).amount} OFF`;
  document.getElementById('promoCode').innerText = JSON.parse(saved).code;
  document.getElementById('btnSpin').disabled = true;
  document.getElementById('voucherSection').classList.remove('hidden');
}
