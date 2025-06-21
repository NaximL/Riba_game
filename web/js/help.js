export function isDesktop() {
  return !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
export let dpr = window.devicePixelRatio || 1;
export let logicalWidth = window.innerWidth;
export let logicalHeight = window.innerHeight;

export function res(canvas, ctx) {
  logicalWidth = window.innerWidth;
  logicalHeight = window.innerHeight;

  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  ctx.scale(dpr, dpr);
}

export function col_cube(shurk, trash) {
  return !(
    shurk.x + 160 < trash.x ||
    shurk.x > trash.x + 50 ||
    shurk.y + 80< trash.y ||
    shurk.y > trash.y + 50
  );
}

export function col(obj1, obj2, radius = 100) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radius;
}

export function getId() {
  
  if (localStorage.deviceId) return localStorage.deviceId;

  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
    navigator.platform
  ].join('|');

  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const chr = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }

  const id = 'dev-' + Math.abs(hash).toString(16);
  localStorage.deviceId = id;
  return id;
}