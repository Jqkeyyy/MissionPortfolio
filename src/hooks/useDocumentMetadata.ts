import { useEffect } from 'react';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '@/config/site';

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
};

export interface DocumentMetadata {
  title: string;
  description: string;
  path: string;
  structuredData?: Record<string, unknown>;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  robots?: string;
}

export const useDocumentMetadata = ({ title, description, path, structuredData, image, robots }: DocumentMetadata) => {
  useEffect(() => {
    const previous = {
      title: document.title,
      description: document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '',
      ogTitle: document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? '',
      ogDescription: document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ?? '',
      ogUrl: document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content ?? '',
      twitterTitle: document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content ?? '',
      twitterDescription: document.head.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content ?? '',
      ogImage: document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? '',
      ogImageAlt: document.head.querySelector<HTMLMetaElement>('meta[property="og:image:alt"]')?.content ?? '',
      ogImageType: document.head.querySelector<HTMLMetaElement>('meta[property="og:image:type"]')?.content ?? '',
      ogImageWidth: document.head.querySelector<HTMLMetaElement>('meta[property="og:image:width"]')?.content ?? '',
      ogImageHeight: document.head.querySelector<HTMLMetaElement>('meta[property="og:image:height"]')?.content ?? '',
      twitterImage: document.head.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content ?? '',
      twitterImageAlt: document.head.querySelector<HTMLMetaElement>('meta[name="twitter:image:alt"]')?.content ?? '',
      robots: document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content,
      canonical: document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '',
    };
    const canonicalUrl = new URL(path, SITE_URL).toString();
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    const socialImage = image ? new URL(image.src, SITE_URL).toString() : DEFAULT_SOCIAL_IMAGE;
    setMeta('meta[property="og:image"]', 'property', 'og:image', socialImage);
    const socialImageAlt = image?.alt ?? 'Mission Portfolio by Jake Sass, illustrated as a solar system with a futuristic habitat.';
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', socialImageAlt);
    setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', image?.src.endsWith('.webp') ? 'image/webp' : 'image/png');
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', String(image?.width ?? 1200));
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', String(image?.height ?? 630));
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage);
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', socialImageAlt);
    if (robots) setMeta('meta[name="robots"]', 'name', 'robots', robots);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.getElementById('route-structured-data')?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'route-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData).replace(/</g, '\\u003c');
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById('route-structured-data')?.remove();
      document.title = previous.title;
      setMeta('meta[name="description"]', 'name', 'description', previous.description);
      setMeta('meta[property="og:title"]', 'property', 'og:title', previous.ogTitle);
      setMeta('meta[property="og:description"]', 'property', 'og:description', previous.ogDescription);
      setMeta('meta[property="og:url"]', 'property', 'og:url', previous.ogUrl);
      setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', previous.twitterTitle);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', previous.twitterDescription);
      setMeta('meta[property="og:image"]', 'property', 'og:image', previous.ogImage);
      setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', previous.ogImageAlt);
      setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', previous.ogImageType);
      setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', previous.ogImageWidth);
      setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', previous.ogImageHeight);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', previous.twitterImage);
      setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', previous.twitterImageAlt);
      const currentRobots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (previous.robots !== undefined) setMeta('meta[name="robots"]', 'name', 'robots', previous.robots);
      else currentRobots?.remove();
      const currentCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (currentCanonical) currentCanonical.href = previous.canonical;
    };
  }, [description, image, path, robots, structuredData, title]);
};
