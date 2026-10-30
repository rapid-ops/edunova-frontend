const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

// PDFs stored on Cloudinary cannot be opened directly, so they go through the backend.
export function fileHref(url?: string | null): string {
  if (!url) return '';
  return /^https:\/\/res\.cloudinary\.com\/.+\.pdf$/i.test(url) ? `${API}/files/open?u=${encodeURIComponent(url)}` : url;
}
