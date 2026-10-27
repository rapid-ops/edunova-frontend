export class PhotoError extends Error {}

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const load = async (file: File): Promise<{ src: CanvasImageSource; w: number; h: number; done: () => void }> => {
  if (typeof createImageBitmap === 'function') {
    try {
      const b = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { src: b, w: b.width, h: b.height, done: () => b.close() };
    } catch { /* fall back to an image element */ }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((ok, bad) => {
    img.onload = () => ok();
    img.onerror = () => bad(new PhotoError('We could not open that photo. Try a different one.'));
    img.src = url;
  });
  return { src: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
};

// Shrinks to at most 512px and re-encodes, which also removes location data (EXIF).
export async function preparePhoto(file: File, max = 512): Promise<File> {
  if (!TYPES.includes(file.type)) throw new PhotoError('Please choose a JPG, PNG or WebP photo.');
  if (file.size > 20 * 1024 * 1024) throw new PhotoError('This photo is too big. Choose one under 20 MB.');
  const img = await load(file);
  try {
    const k = Math.min(1, max / Math.max(img.w, img.h));
    const w = Math.max(1, Math.round(img.w * k));
    const h = Math.max(1, Math.round(img.h * k));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) throw new PhotoError('Your phone could not prepare this photo. Try a different one.');
    const png = file.type === 'image/png';
    if (!png) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img.src, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, png ? 'image/png' : 'image/jpeg', 0.88));
    if (!blob) throw new PhotoError('Your phone could not prepare this photo. Try a different one.');
    if (blob.size > 2 * 1024 * 1024) throw new PhotoError('This photo is too big. Choose one under 2 MB.');
    return new File([blob], png ? 'photo.png' : 'photo.jpg', { type: blob.type });
  } finally { img.done(); }
}
