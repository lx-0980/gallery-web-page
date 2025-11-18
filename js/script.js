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


// ---------- TOUCH HANDLERS ----------

// Start
function touchStartHandler(e) {

  // Two finger pinch start
  if (e.touches.length === 2) {
    const dx = e.touches[0].pageX - e.touches[1].pageX;
    const dy = e.touches[0].pageY - e.touches[1].pageY;
    initialDistance = Math.sqrt(dx * dx + dy * dy);
    return;
  }

  // Single finger swipe start (ONLY when not zoomed)
  if (!isZoomed && e.touches.length === 1) {
    startX = e.touches[0].clientX;
  }
}



// Move
function touchMoveHandler(e) {

  // --- PINCH ZOOM ---
  if (e.touches.length === 2) {
    const dx = e.touches[0].pageX - e.touches[1].pageX;
    const dy = e.touches[0].pageY - e.touches[1].pageY;
    const newDistance = Math.sqrt(dx * dx + dy * dy);

    scale = newDistance / initialDistance;

    // Mark zoom active only if scale is actually bigger
    if (scale > 1.03) isZoomed = true;

    modalImg.style.transform = `scale(${Math.max(1, scale)})`;

    e.preventDefault();
    return;
  }

  // --- IMPORTANT: IF ZOOMED → DISABLE SWIPE ---
  if (isZoomed) {
    e.preventDefault();
    return;
  }
}



// End
function touchEndHandler(e) {

  // --- If zoom was active → reset to full screen automatically ---
  if (isZoomed) {
    modalImg.style.transition = "transform 0.25s ease";
    modalImg.style.transform = "scale(1)";
    scale = 1;
    isZoomed = false;

    setTimeout(() => {
      modalImg.style.transition = "";
    }, 250);

    return;
  }

  // --- Swipe Only When NOT Zoomed AND Single Finger ---
  if (e.changedTouches.length === 1) {
    endX = e.changedTouches[0].clientX;

    const diff = startX - endX;

    // Require long swipe (100px)
    const SWIPE_MIN = 100;

    if (diff > SWIPE_MIN) nextImage();       // swipe left → next
    else if (diff < -SWIPE_MIN) prevImage(); // swipe right → prev
  }
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
