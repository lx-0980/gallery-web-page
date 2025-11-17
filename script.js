// ---------- Background Rotation ----------
let bgIndex = 0;
function changeBackground() {
  document.getElementById("header").style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % bgImages.length;
}
setInterval(changeBackground, 2000);

// ---------- Load Gallery ----------
const galleryContainer = document.getElementById("galleryContainer");

galleryImages.forEach(item => {
  const div = document.createElement("div");
  div.classList.add("gallery-item");
  div.innerHTML = `
    <img src="${item.src}" onclick="openModal('${item.src}')">
    <div class="date">${item.date}</div>
  `;
  galleryContainer.appendChild(div);
});

// ---------- Modal ----------
function openModal(imgSrc) {
  const modal = document.getElementById("myModal");
  const modalImg = document.getElementById("modalImg");
  const downloadBtn = document.getElementById("downloadBtn");

  modal.style.display = "flex";
  modalImg.src = imgSrc;

  // Trigger download using fetch + blob
  downloadBtn.onclick = () => {
    fetch(imgSrc)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = imgSrc.split('/').pop(); // filename from URL
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert('Download failed due to CORS restrictions.'));
  };
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", changeBackground);
