const mapImg = document.getElementById('world-map');
const canvas = document.getElementById('border-canvas');
const viewport = document.getElementById('map-viewport');
const popup = document.getElementById('info-popup');

let offsetX = 0;
let offsetY = 0;
let scale = 1;
const minScale = 1; // 100% is the minimum
const maxScale = 3; // You can adjust this for preferred max zoom
const scaleStep = 0.1;

// Always keep image and canvas at viewport size
function resizeMapElements() {
  mapImg.style.width = `${window.innerWidth}px`;
  mapImg.style.height = `${window.innerHeight}px`;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  viewport.style.width = `${window.innerWidth}px`;
  viewport.style.height = `${window.innerHeight}px`;
}
window.addEventListener('resize', () => {
  resizeMapElements();
  setInitialZoomAndPosition();
});
mapImg.onload = () => {
  resizeMapElements();
  setInitialZoomAndPosition();
};
if (mapImg.complete) {
  resizeMapElements();
  setInitialZoomAndPosition();
}

function setInitialZoomAndPosition() {
  scale = minScale;
  offsetX = 0;
  offsetY = 0;
  updateTransform();
}

function clampOffsets() {
  if (scale === minScale) {
    offsetX = 0;
    offsetY = 0;
    return;
  }
  // The visible area is always window.innerWidth/Height
  // When zoomed in, the map is larger than the viewport
  const maxPanX = (window.innerWidth * (scale - 1)) / 2;
  const maxPanY = (window.innerHeight * (scale - 1)) / 2;
  offsetX = Math.max(-maxPanX, Math.min(maxPanX, offsetX));
  offsetY = Math.max(-maxPanY, Math.min(maxPanY, offsetY));
}

function updateTransform() {
  viewport.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

// Mouse wheel zoom
viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const oldScale = scale;
  if (e.deltaY < 0) {
    scale = Math.min(maxScale, scale + scaleStep);
  } else {
    scale = Math.max(minScale, scale - scaleStep);
  }
  // Zoom towards mouse pointer
  const rect = viewport.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  offsetX -= (mx - window.innerWidth / 2) * (scale - oldScale) / scale;
  offsetY -= (my - window.innerHeight / 2) * (scale - oldScale) / scale;
  clampOffsets();
  updateTransform();
});

// Keyboard zoom
document.addEventListener('keydown', (e) => {
  if (e.key === '+' || e.key === '=') {
    scale = Math.min(maxScale, scale + scaleStep);
    clampOffsets();
    updateTransform();
  }
  if (e.key === '-' || e.key === '_') {
    scale = Math.max(minScale, scale - scaleStep);
    clampOffsets();
    updateTransform();
  }
});

// Touch pinch zoom logic
let lastTouchDist = 0;
let lastTouchScale = 1;
viewport.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    lastTouchScale = scale;
  }
});
viewport.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    let newScale = lastTouchScale * (dist / lastTouchDist);
    newScale = Math.max(minScale, Math.min(maxScale, newScale));
    scale = newScale;
    clampOffsets();
    updateTransform();
  }
});
viewport.addEventListener('touchend', (e) => {
  // No action needed for this case
});

// Drag panning
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;

viewport.addEventListener('mousedown', (e) => {
  if (scale === minScale) return; // Don't allow panning at min zoom
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOffsetX = offsetX;
  dragOffsetY = offsetY;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  offsetX = dragOffsetX + (e.clientX - dragStartX);
  offsetY = dragOffsetY + (e.clientY - dragStartY);
  clampOffsets();
  updateTransform();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

updateTransform();