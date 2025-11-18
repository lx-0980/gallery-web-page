// ---------- Header Typing Animation ----------
document.addEventListener("DOMContentLoaded", () => {
  const headerText = "राजकीय उच्च माध्यमिक विद्यालय अचलपुर, प्रतापगढ़ (राज) कक्षा 12वीं (2024 - 25)";
  const header = document.querySelector(".header h1");
  let i = 0;

  function typeWriter() {
    if (i < headerText.length) {
      header.innerHTML += headerText.charAt(i);
      i++;
      setTimeout(typeWriter, 50); // typing speed
    } else {
      header.classList.add("blink"); // add blinking caret
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

// ---------- Modal ----------
let currentIndex = 0;
let startX = 0;
let endX = 0;

function openModal(index) {
  currentIndex = index;
  const modal = document.getElementById("myModal");
  const modalImg = document.getElementById("modalImg");
  const downloadBtn = document.getElementById("downloadBtn");

  modal.style.display = "flex";
  modalImg.src = galleryImages[currentIndex].full;

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

  // Touch events for mobile swipe
  modalImg.addEventListener("touchstart", touchStart, false);
  modalImg.addEventListener("touchend", touchEnd, false);
}

function closeModal() {
  const modalImg = document.getElementById("modalImg");
  modalImg.removeEventListener("touchstart", touchStart);
  modalImg.removeEventListener("touchend", touchEnd);
  document.getElementById("myModal").style.display = "none";
}

// ---------- Modal Navigation ----------
function nextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  document.getElementById("modalImg").src = galleryImages[currentIndex].full;
}

function prevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  document.getElementById("modalImg").src = galleryImages[currentIndex].full;
}

function touchStart(e) { 
  if (e.touches.length > 1) return; // More than 1 finger = PICH ZOOM
  startX = e.changedTouches[0].screenX;
}

function touchEnd(e) {
  if (e.changedTouches.length > 1) return; // Prevent swipe on zoom
  endX = e.changedTouches[0].screenX;

  if (startX - endX > 50) nextImage();  // swipe left
  if (endX - startX > 50) prevImage();  // swipe right
}

// ---------- Keyboard Support ----------
window.addEventListener("keydown", e => {
  if (document.getElementById("myModal").style.display === "flex") {
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") closeModal();
  }
});

const shareBtn = document.getElementById("shareBtn");

shareBtn.onclick = async () => {
  const imgUrl = galleryImages[currentIndex].full;
  
  // If Web Share API is available (mobile devices)
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
    // Fallback: copy image URL to clipboard
    navigator.clipboard.writeText(imgUrl).then(() => {
      alert("Image link copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy link.");
    });
  }
};

// ---------- Preload Background Images ----------
bgImages.forEach(url => { const img = new Image(); img.src = url; });
