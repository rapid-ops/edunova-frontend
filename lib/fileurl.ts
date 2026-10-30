const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';
const PDF = /^https:\/\/res\.cloudinary\.com\/.+\.pdf$/i;

// PDFs stored on Cloudinary open in the in-app viewer; other files open directly.
export function fileHref(url?: string | null): string {
  if (!url) return '';
  return PDF.test(url) ? `/view/pdf?u=${encodeURIComponent(url)}` : url;
}

// Where the viewer fetches the PDF bytes from (through the backend).
export function fileSource(url?: string | null): string {
  return url && PDF.test(url) ? `${API}/files/open?u=${encodeURIComponent(url)}` : '';
}
