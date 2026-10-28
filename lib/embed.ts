// Turns a YouTube or Vimeo link into an embed URL. Returns null for anything else.
export function embedUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    if (u.hostname === 'youtu.be' && u.pathname.length > 1) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}
