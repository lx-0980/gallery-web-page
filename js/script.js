// =====================
// Header 3D Text Animation
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header h1");
  header.textContent = "LX 0980";

  // Trigger 3D reveal animation
  setTimeout(() => {
    header.classList.add("show");
  }, 200);
});

// =====================
// Background Image Slider
// =====================
let bgIndex = 0;
function changeBackground() {
  const header = document.getElementById("header");
  if (!header) return;
  header.style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % bgImages.length;
}
setInterval(changeBackground, 2000);

// =====================
// Gallery Creation + Lazy Loading
// =====================
const galleryContainer = document.getElementById("galleryContainer");
const fragment = document.createDocumentFragment();

galleryImages.forEach((item, index) => {
  const div = document.createElement("div");
  div.classList.add("gallery-item");
  div.innerHTML = `
    <img data-src="${item.full}" loading="lazy" onclick="openModal(${index})">
    <div class="date">${item.date}</div>
  `;
  fragment.appendChild(div);
});
galleryContainer.appendChild(fragment);

// Lazy loading observer
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      obs.unobserve(img);
    }
  });
}, { rootMargin: "50px" });

document.querySelectorAll(".gallery-item img").forEach(img => observer.observe(img));

// =====================
// Modal Variables
// =====================
let currentIndex = 0;
let startX = 0;
let scale = 1;
let startDistance = 0;
let isZooming = false;
let allowSwipe = true;
let translateX = 0;
let translateY = 0;
const SWIPE_MIN = 120;

const modal = document.getElementById("myModal");
const modalImg = document.getElementById("modalImg");
const imgWrapper = document.getElementById("imgWrapper");

// =====================
// Open Modal Function
// =====================
function openModal(index) {
  currentIndex = index;
  modal.style.display = "flex";
  modalImg.src = galleryImages[currentIndex].full;
  resetZoom();

  // Touch events
  modalImg.addEventListener("touchstart", touchStart, { passive: false });
  modalImg.addEventListener("touchmove", touchMove, { passive: false });
  modalImg.addEventListener("touchend", touchEnd);

  // Download button
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.onclick = () => downloadImage(galleryImages[currentIndex].full);
}

// =====================
// Close Modal Function
// =====================
function closeModal() {
  modal.style.display = "none";

  modalImg.removeEventListener("touchstart", touchStart);
  modalImg.removeEventListener("touchmove", touchMove);
  modalImg.removeEventListener("touchend", touchEnd);

  resetZoom();
}

// =====================
// Reset Zoom
// =====================
function resetZoom() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  isZooming = false;
  allowSwipe = true;

  modalImg.style.transition = "transform 0.3s ease";
  modalImg.style.transform = "translate(0px,0px) scale(1)";
}

// =====================
// Touch Events
// =====================
function touchStart(e) {
  if (e.touches.length === 2) {
    isZooming = true;
    allowSwipe = false;
    startDistance = getDistance(e.touches);
    return;
  }

  if (e.touches.length === 1) {
    startX = e.touches[0].clientX;
  }
}

function getDistance(t) {
  const dx = t[0].pageX - t[1].pageX;
  const dy = t[0].pageY - t[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

function touchMove(e) {
  if (isZooming && e.touches.length === 2) {
    e.preventDefault();
    let newDist = getDistance(e.touches);
    scale = Math.min(Math.max(newDist / startDistance, 1), 3); // limit 1–3
    modalImg.style.transition = "none";
    updateImageTransform();
    return;
  }

  if (scale > 1.02) return; // disable swipe if zoomed
}

function touchEnd(e) {
  if (isZooming) {
    modalImg.style.transition = "transform 0.25s ease";
    scale = 1;
    translateX = 0;
    translateY = 0;
    modalImg.style.transform = "translate(0px,0px) scale(1)";
    setTimeout(() => {
      allowSwipe = true;
      isZooming = false;
    }, 250);
    return;
  }

  if (!allowSwipe || scale > 1.02) return;

  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (diff > SWIPE_MIN) nextImage();
  else if (diff < -SWIPE_MIN) prevImage();
}

function updateImageTransform() {
  const imgRect = modalImg.getBoundingClientRect();
  const wrapRect = imgWrapper.getBoundingClientRect();

  const maxX = ((imgRect.width * scale) - wrapRect.width) / 2;
  const maxY = ((imgRect.height * scale) - wrapRect.height) / 2;

  translateX = Math.min(Math.max(translateX, -maxX), maxX);
  translateY = Math.min(Math.max(translateY, -maxY), maxY);

  modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// =====================
// Next / Previous Image
// =====================
function nextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  modalImg.src = galleryImages[currentIndex].full;
  resetZoom();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  modalImg.src = galleryImages[currentIndex].full;
  resetZoom();
}

// =====================
// Download Image
// =====================
function downloadImage(url) {
  fetch(url)
    .then(r => r.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    });
}

// =====================
// Share Button
// =====================
const shareBtn = document.getElementById("shareBtn");
shareBtn.onclick = async () => {
  const imgUrl = galleryImages[currentIndex].full;

  if (navigator.share) {
    await navigator.share({ title: "Check this image!", url: imgUrl });
  } else {
    navigator.clipboard.writeText(imgUrl);
    alert("Link copied!");
  }
};

// =====================
// Preload Background Images
// =====================
bgImages.forEach(url => {
  const img = new Image();
  img.src = url;
});
