export const SITE_NAME = 'MouseDays';
export const SITE_URL = ('https://mousedays.net').replace(/\/$/, '');
export const DEFAULT_SOCIAL_IMAGE = '/blog/planning-notes.svg';

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
