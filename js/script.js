/* ------------------------------------------------------------
   HEADER TYPING
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const headerText = "GOVT. SENIOR SECONDARY SCHOOL ACHALPUR, PRATAPGARH (RAJ.) CLASS 12TH (2024–25)";
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

let translateX = 0;
let translateY = 0;

const SWIPE_MIN = 120;
const modal = document.getElementById("myModal");
const modalImg = document.getElementById("modalImg");
const imgWrapper = document.getElementById("imgWrapper");


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
  translateX = 0;
  translateY = 0;

  isZooming = false;
  allowSwipe = true;

  modalImg.style.transition = "transform 0.3s ease";
  modalImg.style.transform = "translate(0px,0px) scale(1)";
}


/* ------------------------------------------------------------
   TOUCH START
------------------------------------------------------------ */
function touchStart(e) {

  // Pinch zoom start
  if (e.touches.length === 2) {
    isZooming = true;
    allowSwipe = false;
    startDistance = getDistance(e.touches);
    return;
  }

  // 1 finger swipe start
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

  // Pinch Zoom
  if (isZooming && e.touches.length === 2) {
    e.preventDefault();

    let newDist = getDistance(e.touches);
    scale = Math.min(Math.max(newDist / startDistance, 1), 3); // limit zoom 1–3

    modalImg.style.transition = "none";
    updateImageTransform();
    return;
  }

  // Zoomed → disable swipe fully
  if (scale > 1.02) return;
}


/* ------------------------------------------------------------
   UPDATE TRANSFORM WITH BOUNDARY LOCK
------------------------------------------------------------ */
function updateImageTransform() {
  const imgRect = modalImg.getBoundingClientRect();
  const wrapRect = imgWrapper.getBoundingClientRect();

  const maxX = ((imgRect.width * scale) - wrapRect.width) / 2;
  const maxY = ((imgRect.height * scale) - wrapRect.height) / 2;

  translateX = Math.min(Math.max(translateX, -maxX), maxX);
  translateY = Math.min(Math.max(translateY, -maxY), maxY);

  modalImg.style.transform =
    `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}


/* ------------------------------------------------------------
   TOUCH END
------------------------------------------------------------ */
function touchEnd(e) {

  // After pinch zoom → auto reset (Instagram style)
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

  // Swipe only if zoom = 1
  if (!allowSwipe || scale > 1.02) return;

  let endX = e.changedTouches[0].clientX;
  let diff = startX - endX;

  if (diff > SWIPE_MIN) nextImage();
  else if (diff < -SWIPE_MIN) prevImage();
}


/* ------------------------------------------------------------
   NEXT / PREV
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
