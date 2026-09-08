const DEFAULT_SITE_URL = 'https://mission-portfolio-amber.vercel.app';

const resolveSiteUrl = (candidate: string | undefined): string => {
  if (!candidate) return DEFAULT_SITE_URL;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return DEFAULT_SITE_URL;
    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
};

export const SITE_URL = resolveSiteUrl(import.meta.env.VITE_SITE_URL as string | undefined);
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/brand/og-mission-portfolio.png`;
