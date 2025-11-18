// ---------- Header Typing Animation ----------
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

// ---------- Background Rotation ----------
let bgIndex = 0;
function changeBackground() {
  document.getElementById("header").style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % bgImages.length;
}
setInterval(changeBackground, 2000);

// ---------- Load Gallery ----------
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

// ---------- Lazy Loading ----------
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, { rootMargin: "50px" });

document.querySelectorAll(".gallery-item img").forEach(img => observer.observe(img));


// ---------- Modal + Zoom + Swipe ----------
let currentIndex = 0;

let startX = 0;
let endX = 0;

let scale = 1;
let isZoomed = false;
let initialDistance = 0;

const modalImg = document.getElementById("modalImg");

function openModal(index) {
  currentIndex = index;

  const modal = document.getElementById("myModal");
  const downloadBtn = document.getElementById("downloadBtn");

  modal.style.display = "flex";
  modalImg.src = galleryImages[currentIndex].full;

  // Reset zoom
  modalImg.style.transform = "scale(1)";
  scale = 1;
  isZoomed = false;

  modalImg.addEventListener("touchstart", touchStartHandler);
  modalImg.addEventListener("touchmove", touchMoveHandler);
  modalImg.addEventListener("touchend", touchEndHandler);

  downloadBtn.onclick = () => {
    fetch(galleryImages[currentIndex].full)
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = galleryImages[currentIndex].full.split('/').pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert('Download failed due to CORS restrictions.'));
  };
}

function closeModal() {
  modalImg.removeEventListener("touchstart", touchStartHandler);
  modalImg.removeEventListener("touchmove", touchMoveHandler);
  modalImg.removeEventListener("touchend", touchEndHandler);
  document.getElementById("myModal").style.display = "none";
}

function nextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  modalImg.src = galleryImages[currentIndex].full;
  modalImg.style.transform = "scale(1)";
  scale = 1;
  isZoomed = false;
}

function prevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  modalImg.src = galleryImages[currentIndex].full;
  modalImg.style.transform = "scale(1)";
  scale = 1;
  isZoomed = false;
}

/* ---------------- INSTAGRAM STYLE ZOOM + PAN + SWIPE ---------------- */

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let scale = 1;
let isZoomed = false;
let initialDistance = 0;

let imgX = 0;     // Current pan X
let imgY = 0;     // Current pan Y
let lastX = 0;    // Previous pan X
let lastY = 0;    // Previous pan Y

let isDraggingImage = false;
let dragStartY = 0; // For swipe-down to close
let totalDragY = 0;

const modal = document.getElementById("myModal");
const modalImg = document.getElementById("modalImg");


// ---------------- TOUCH START ----------------
function touchStartHandler(e) {

  // Double tap zoom
  if (e.touches.length === 1) {
    const now = Date.now();
    if (modalImg.lastTapTime && (now - modalImg.lastTapTime < 300)) {
      toggleDoubleTapZoom(e.touches[0]);
      e.preventDefault();
      return;
    }
    modalImg.lastTapTime = now;
  }

  
  // 2-finger pinch start
  if (e.touches.length === 2) {
    const dx = e.touches[0].pageX - e.touches[1].pageX;
    const dy = e.touches[0].pageY - e.touches[1].pageY;
    initialDistance = Math.sqrt(dx * dx + dy * dy);
    return;
  }

  // 1 finger → swipe or drag start
  if (e.touches.length === 1) {

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    dragStartY = startY;
    totalDragY = 0;

    lastX = imgX;
    lastY = imgY;
  }
}



// ---------------- TOUCH MOVE ----------------
function touchMoveHandler(e) {

  // ----- PINCH ZOOM -----
  if (e.touches.length === 2) {
    const dx = e.touches[0].pageX - e.touches[1].pageX;
    const dy = e.touches[0].pageY - e.touches[1].pageY;
    const newDistance = Math.sqrt(dx * dx + dy * dy);

    scale = newDistance / initialDistance;

    if (scale > 1.05) isZoomed = true;

    updateTransform();
    
    e.preventDefault();
    return;
  }


  // ----- WHEN ZOOMED → PAN IMAGE -----
  if (isZoomed && e.touches.length === 1) {

    const moveX = e.touches[0].clientX - startX;
    const moveY = e.touches[0].clientY - startY;

    imgX = lastX + moveX;
    imgY = lastY + moveY;

    updateTransform();
    return;
  }


  // ----- SWIPE DOWN TO CLOSE -----
  if (!isZoomed) {
    totalDragY = e.touches[0].clientY - dragStartY;

    if (totalDragY > 80) {
      closeModal();
    }
  }
}



// ---------------- TOUCH END ----------------
function touchEndHandler(e) {

  // Zoom reset
  if (isZoomed) return;

  endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  const SWIPE_MIN = 110;

  if (diff > SWIPE_MIN) nextImage();
  if (diff < -SWIPE_MIN) prevImage();
}



// ---------------- UPDATE TRANSFORM ----------------
function updateTransform() {
  modalImg.style.transform =
    `translate(${imgX}px, ${imgY}px) scale(${Math.max(1, scale)})`;
}



// ---------------- DOUBLE TAP ZOOM ----------------
function toggleDoubleTapZoom(touch) {
  if (!isZoomed) {

    scale = 2;
    isZoomed = true;

    // Center zoom around tap
    imgX = -(touch.clientX - window.innerWidth / 2);
    imgY = -(touch.clientY - window.innerHeight / 2);

  } else {
    // Reset
    scale = 1;
    imgX = 0;
    imgY = 0;
    isZoomed = false;
  }

  updateTransform();
}

// ---------- KEYBOARD SUPPORT ----------
window.addEventListener("keydown", e => {
  if (document.getElementById("myModal").style.display === "flex") {
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") closeModal();
  }
});


// ---------- SHARE BUTTON ----------
const shareBtn = document.getElementById("shareBtn");

shareBtn.onclick = async () => {
  const imgUrl = galleryImages[currentIndex].full;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Check this image!",
        text: "Look at this photo from our gallery.",
        url: imgUrl
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  } else {
    navigator.clipboard.writeText(imgUrl).then(() => {
      alert("Image link copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy link.");
    });
  }
};


// ---------- PRELOAD BG ----------
bgImages.forEach(url => { const img = new Image(); img.src = url; });
