
function getCountryGroup(el) {
  let current = el.parentNode;

  while (current && current.tagName === 'g') {
    if (current.id && !current.id.endsWith('-Continent') && current.id !== 'layer1') {
      return current; // found the country group
    }
    current = current.parentNode; // keep going up
  }

  return null; // fallback → means path is the country itself
}

document.querySelectorAll('#map-borders path').forEach(path => {
  path.addEventListener('mouseenter', () => {
    let countryGroup = getCountryGroup(path);
    if (countryGroup) {
      countryGroup.classList.add('highlight');
    } else {
      path.classList.add('highlight');
    }
  });

  path.addEventListener('mouseleave', () => {
    let countryGroup = getCountryGroup(path);
    if (countryGroup) {
      countryGroup.classList.remove('highlight');
    } else {
      path.classList.remove('highlight');
    }
  });
});

const container = document.getElementById("map-container");
const wrapper = document.getElementById("zoom-wrapper");

const mapWidth = 4096;
const mapHeight = 3044;

let scale = 1;
let translateX = 0, translateY = 0;
const maxScale = 3;

// --- helpers ---
function getMinScale() {
  const rect = container.getBoundingClientRect();
  const aspectRatio = rect.width / rect.height;
  const mapAspectRatio = mapWidth / mapHeight;

  if (aspectRatio >= 1) {
    // landscape → must at least fill width
    return rect.width / mapWidth;
  } else {
    // portrait → must at least fill height
    return rect.height / mapHeight;
  }
}

function applyTransform() {
  const rect = container.getBoundingClientRect();
  const wrapperWidth = mapWidth * scale;
  const wrapperHeight = mapHeight * scale;

  // clamp scale
  const minScale = getMinScale();
  scale = Math.max(minScale, Math.min(maxScale, scale));

  // bounds
  const maxX = 0;
  const maxY = 0;
  const minX = rect.width - wrapperWidth;
  const minY = rect.height - wrapperHeight;

  // clamp translation but don’t force recenter
  translateX = Math.min(maxX, Math.max(minX, translateX));
  translateY = Math.min(maxY, Math.max(minY, translateY));

  wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// --- mouse zoom ---
container.addEventListener("wheel", e => {
  e.preventDefault();
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const prevScale = scale;
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= zoomFactor;

  // keep mouse position stable
  translateX = mouseX - (mouseX - translateX) * (scale / prevScale);
  translateY = mouseY - (mouseY - translateY) * (scale / prevScale);

  applyTransform();
});

// --- mouse drag ---
let isDragging = false, lastX, lastY;

container.addEventListener("mousedown", e => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

container.addEventListener("mousemove", e => {
  if (!isDragging) return;
  translateX += e.clientX - lastX;
  translateY += e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  applyTransform();
});

container.addEventListener("mouseup", () => isDragging = false);
container.addEventListener("mouseleave", () => isDragging = false);

// --- touch support ---
let touchStartDist = 0;
let initialScale = 1;

container.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    // one finger → drag
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // two fingers → pinch zoom
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    touchStartDist = Math.hypot(dx, dy);
    initialScale = scale;
  }
});

container.addEventListener("touchmove", e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    // drag
    translateX += e.touches[0].clientX - lastX;
    translateY += e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    // pinch zoom
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    const newDist = Math.hypot(dx, dy);
    scale = initialScale * (newDist / touchStartDist);
  }
  applyTransform();
}, { passive: false });

// --- initial fit ---
function fitMapToContainer() {
  scale = getMinScale();
  translateX = 0;
  translateY = 0;
  applyTransform();
}

window.addEventListener("load", fitMapToContainer);
window.addEventListener("resize", fitMapToContainer);
