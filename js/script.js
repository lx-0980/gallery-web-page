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
   MODAL + PERFECT INSTAGRAM-STYLE ZOOM / SWIPE
------------------------------------------------------------ */

let currentIndex = 0;

let startX = 0;
let scale = 1;
let startDistance = 0;
let isZooming = false;
let allowSwipe = true;

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

  modalImg.addEventListener("touchstart", touchStart, { passive: false });
  modalImg.addEventListener("touchmove", touchMove, { passive: false });
  modalImg.addEventListener("touchend", touchEnd);

  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.onclick = () => downloadImage(galleryImages[currentIndex].full);
}


/* ------------------------------------------------------------
   CLOSE MODAL
------------------------------------------------------------ */
function closeModal() {
  modal.style.display = "none";

  modalImg.removeEventListener("touchstart", touchStart);
  modalImg.removeEventListener("touchmove", touchMove);
  modalImg.removeEventListener("touchend", touchEnd);

  resetZoom();
}


/* ------------------------------------------------------------
   RESET ZOOM AUTO
------------------------------------------------------------ */
function resetZoom() {
  scale = 1;
  isZooming = false;
  allowSwipe = true;

  modalImg.style.transition = "transform 0.3s ease";
  modalImg.style.transform = "scale(1)";
}


/* ------------------------------------------------------------
   TOUCH START
------------------------------------------------------------ */
function touchStart(e) {

  // 👉 Pinch zoom start
  if (e.touches.length === 2) {
    isZooming = true;
    allowSwipe = false;
    startDistance = getDistance(e.touches);
    return;
  }

  // 👉 1 finger → start swipe
  if (e.touches.length === 1) {
    startX = e.touches[0].clientX;
  }
}

function getDistance(t) {
  const dx = t[0].pageX - t[1].pageX;
  const dy = t[0].pageY - t[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}


/* ------------------------------------------------------------
   TOUCH MOVE
------------------------------------------------------------ */
function touchMove(e) {

  // 👉 Pinch Zoom
  if (isZooming && e.touches.length === 2) {
    e.preventDefault();

    let newDist = getDistance(e.touches);
    scale = Math.min(Math.max(newDist / startDistance, 1), 3); // clamp 1–3

    modalImg.style.transition = "none";
    modalImg.style.transform = `scale(${scale})`;
    return;
  }

  // Zoomed → disable swipe completely
  if (scale > 1.02) return;
}


/* ------------------------------------------------------------
   TOUCH END
------------------------------------------------------------ */
function touchEnd(e) {

  // 👉 After pinch zoom, auto reset
  if (isZooming) {
    modalImg.style.transition = "transform 0.25s ease";
    modalImg.style.transform = "scale(1)";
    scale = 1;

    setTimeout(() => {
      allowSwipe = true;
      isZooming = false;
    }, 250);

    return;
  }

  // 👉 Swipe (only when NOT zoomed)
  if (!allowSwipe) return;

  let endX = e.changedTouches[0].clientX;
  let diff = startX - endX;

  if (diff > SWIPE_MIN) nextImage();
  else if (diff < -SWIPE_MIN) prevImage();
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
    await navigator.share({ title: "Check this image!", url: imgUrl });
  } else {
    navigator.clipboard.writeText(imgUrl);
    alert("Link copied!");
  }
};


/* ------------------------------------------------------------
   PRELOAD BG IMAGES
------------------------------------------------------------ */
bgImages.forEach(url => {
  const img = new Image();
  img.src = url;
});
