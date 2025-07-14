const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const couponText = document.getElementById("couponText");
const copyBtn = document.getElementById("copyBtn");

const img = new Image();
img.src = "/gold-mask.png";

const prizes = [
  { text: "Congratulations! You get 5% Off on orders above Rs 399\nCoupon Code: SPSCRATCH5", weight: 40 },
  { text: "Better luck next time.\nDon't worry, our perfumes never fail!", weight: 40 },
  { text: "Woah! You get 10% off on orders above Rs 399\nCoupon Code: SPSCRATCH10", weight: 10 },
  { text: "Free 15ml Tester worth Rs 499 on orders above Rs 399\nCoupon Code: SPTEST15", weight: 10 },
  { text: "You get Rs 100 off on orders above Rs 399\nCoupon Code: SPSCRATCH100", weight: 5 }
];

function pickPrize() {
  const total = prizes.reduce((acc, p) => acc + p.weight, 0);
  let r = Math.random() * total;
  for (const prize of prizes) {
    if (r < prize.weight) return prize.text;
    r -= prize.weight;
  }
  return prizes[0].text;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isScratchedToday() {
  return localStorage.getItem("scratchDate") === getTodayKey();
}

function saveScratch(prize) {
  localStorage.setItem("scratchDate", getTodayKey());
  localStorage.setItem("scratchPrize", prize);
}

function revealAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.pointerEvents = "none";
}

img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let prizeText = "";
  if (isScratchedToday()) {
    prizeText = localStorage.getItem("scratchPrize");
    revealAll();
  } else {
    prizeText = pickPrize();
    saveScratch(prizeText);
  }

  couponText.innerText = prizeText;

  let isDrawing = false;

  function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  }

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] === 0) cleared++;
    }

    const percent = cleared / (canvas.width * canvas.height) * 100;
    if (percent > 30) revealAll();
  }

  // Mouse Events
  canvas.addEventListener("mousedown", () => isDrawing = true);
  canvas.addEventListener("mouseup", () => isDrawing = false);
  canvas.addEventListener("mouseleave", () => isDrawing = false);
  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && !isScratchedToday()) {
      const { x, y } = getPosition(e);
      scratchAt(x, y);
    }
  });

  // Touch Events
  canvas.addEventListener("touchstart", () => isDrawing = true);
  canvas.addEventListener("touchend", () => isDrawing = false);
  canvas.addEventListener("touchcancel", () => isDrawing = false);
  canvas.addEventListener("touchmove", (e) => {
    if (isDrawing && !isScratchedToday()) {
      const { x, y } = getPosition(e);
      scratchAt(x, y);
    }
  });
};

// Copy Code
copyBtn.addEventListener("click", () => {
  const prize = localStorage.getItem("scratchPrize") || couponText.innerText;
  const match = prize.match(/SPSCRATCH\d+|SPTEST15/);
  if (match) {
    navigator.clipboard.writeText(match[0]).then(() => {
      copyBtn.classList.add("copied");
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "Copy Code";
      }, 1500);
    });
  }
});
