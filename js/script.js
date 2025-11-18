/* ------------------------------------------------------------
   HEADER TYPING
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const headerText = "राजकीय उच्च माध्यमिक विद्यालय अचलपुर, प्रतापगढ़ (राज) कक्षा 12वीं (2024 - 25)";
  const header = document.querySelector(".header h1");
  let i = 0;

  function typeWriter() {
    if (i < headerText.length) {
      header.innerHTML += headerText.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    } else {
      header.classList.add("blink");
    }
  }
  typeWriter();
});


/* ------------------------------------------------------------
   BACKGROUND ROTATION
------------------------------------------------------------ */
let bgIndex = 0;
function changeBackground() {
  document.getElementById("header").style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % bgImages.length;
}
setInterval(changeBackground, 2000);


/* ------------------------------------------------------------
   LOAD GALLERY
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   LAZY LOADING
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   MODAL + INSTAGRAM-STYLE SWIPE / ZOOM
------------------------------------------------------------ */

let currentIndex = 0;

/* gesture variables */
let startX = 0;
let startY = 0;
let endX = 0;

let imgX = 0;
let imgY = 0;
let lastX = 0;
let lastY = 0;

let scale = 1;
let initialDistance = 0;
let isZoomed = false;

let dragStartY = 0;
let totalDragY = 0;

const SWIPE_MIN = 120;

const modal = document.getElementById("myModal");
const modalImg = document.getElementById("modalImg");


/* ------------------------------------------------------------
   OPEN MODAL
------------------------------------------------------------ */
function openModal(index) {
  currentIndex = index;

  modal.style.display = "flex";
  modalImg.src = galleryImages[currentIndex].full;

  resetZoom();

  modalImg.addEventListener("touchstart", touchStartHandler, { passive: false });
  modalImg.addEventListener("touchmove", touchMoveHandler, { passive: false });
  modalImg.addEventListener("touchend", touchEndHandler);

  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.onclick = () => downloadImage(galleryImages[currentIndex].full);
}


/* ------------------------------------------------------------
   CLOSE MODAL
------------------------------------------------------------ */
function closeModal() {
  modal.style.display = "none";

  modalImg.removeEventListener("touchstart", touchStartHandler);
  modalImg.removeEventListener("touchmove", touchMoveHandler);
  modalImg.removeEventListener("touchend", touchEndHandler);

  resetZoom();
}


/* ------------------------------------------------------------
   RESET ZOOM
------------------------------------------------------------ */
function resetZoom() {
  scale = 1;
  imgX = 0;
  imgY = 0;
  isZoomed = false;
  modalImg.style.transform = "translate(0px, 0px) scale(1)";
}


/* ------------------------------------------------------------
   TOUCH START
------------------------------------------------------------ */
function touchStartHandler(e) {

  // Double TAP zoom
  if (e.touches.length === 1) {
    const now = Date.now();
    if (modalImg.lastTapTime && now - modalImg.lastTapTime < 300) {
      toggleDoubleTapZoom(e.touches[0]);
      return;
    }
    modalImg.lastTapTime = now;
  }

  // Pinch zoom start
  if (e.touches.length === 2) {
    const dx = e.touches[0].pageX - e.touches[1].pageX;
    const dy = e.touches[0].pageY - e.touches[1].pageY;
    initialDistance = Math.sqrt(dx * dx + dy * dy);
    return;
  }

  // 1 finger → swipe or pan
  if (e.touches.length === 1) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    dragStartY = startY;
    totalDragY = 0;

    lastX = imgX;
    lastY = imgY;
  }
}


/* ------------------------------------------------------------
   TOUCH MOVE
------------------------------------------------------------ */
function touchMoveHandler(e) {

  // PINCH ZOOM
  if (e.touches.length === 2) {
    const dx = e.touches[0].pageX - e.touches[1].pageX;
    const dy = e.touches[0].pageY - e.touches[1].pageY;
    const newDistance = Math.sqrt(dx * dx + dy * dy);

    scale = Math.max(1, newDistance / initialDistance);
    if (scale > 1.03) isZoomed = true;

    updateTransform();
    e.preventDefault();
    return;
  }

  // PAN (when zoomed)
  if (isZoomed && e.touches.length === 1) {
    const moveX = e.touches[0].clientX - startX;
    const moveY = e.touches[0].clientY - startY;

    imgX = lastX + moveX;
    imgY = lastY + moveY;

    updateTransform();
    e.preventDefault();
    return;
  }

  // SWIPE DOWN TO CLOSE
  if (!isZoomed) {
    totalDragY = e.touches[0].clientY - dragStartY;
    if (totalDragY > 90) closeModal();
  }
}


/* ------------------------------------------------------------
   TOUCH END
------------------------------------------------------------ */
function touchEndHandler(e) {

  if (isZoomed) return;

  endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (diff > SWIPE_MIN) nextImage();
  else if (diff < -SWIPE_MIN) prevImage();
}


/* ------------------------------------------------------------
   UPDATE IMAGE TRANSFORM
------------------------------------------------------------ */
function updateTransform() {
  modalImg.style.transform =
    `translate(${imgX}px, ${imgY}px) scale(${scale})`;
}


/* ------------------------------------------------------------
   DOUBLE TAP ZOOM
------------------------------------------------------------ */
function toggleDoubleTapZoom(touch) {
  if (!isZoomed) {
    scale = 2;
    isZoomed = true;

    imgX = -(touch.clientX - window.innerWidth / 2);
    imgY = -(touch.clientY - window.innerHeight / 2);

  } else {
    resetZoom();
  }
  updateTransform();
}


/* ------------------------------------------------------------
   NEXT & PREV IMAGE
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   DOWNLOAD IMAGE
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   SHARE BUTTON
------------------------------------------------------------ */
const shareBtn = document.getElementById("shareBtn");
shareBtn.onclick = async () => {
  const imgUrl = galleryImages[currentIndex].full;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Check this image!",
        url: imgUrl
      });
    } catch (_) {}
  } else {
    navigator.clipboard.writeText(imgUrl);
    alert("Image link copied!");
  }
};


/* ------------------------------------------------------------
   PRELOAD BG IMAGES
------------------------------------------------------------ */
bgImages.forEach(url => {
  const img = new Image();
  img.src = url;
});
