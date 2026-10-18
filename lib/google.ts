const GID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '842943328007-1vm692lbekoqsu6nli8jsiquc560dj0p.apps.googleusercontent.com';

export function startGoogleLogin() {
  const origin = window.location.hostname === 'localhost' ? window.location.origin : 'https://edunova-frontend-gkaj.vercel.app';
  const q = new URLSearchParams({
    client_id: GID, redirect_uri: origin + '/auth/oauth-callback', response_type: 'id_token',
    scope: 'openid email profile', nonce: Math.random().toString(36).slice(2), prompt: 'select_account',
  });
  window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + q.toString();
}
