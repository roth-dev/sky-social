import { PostEmbed, EmbedType } from '@/types/embed';

export function getEmbedType(embed: PostEmbed): EmbedType | null {
  if (!embed || !embed.$type) {
    return null;
  }

  switch (embed.$type) {
    case 'app.bsky.embed.images#view':
      return 'images';
    case 'app.bsky.embed.external#view':
      return 'external';
    case 'app.bsky.embed.record#view':
      return 'record';
    case 'app.bsky.embed.video#view':
      return 'video';
    case 'app.bsky.embed.recordWithMedia#view':
      return 'recordWithMedia';
    default:
      return null;
  }
}

export function hasImages(embed: PostEmbed): boolean {
  return !!(embed.images && embed.images.length > 0) ||
         !!(embed.media?.images && embed.media.images.length > 0);
}

export function hasVideo(embed: PostEmbed): boolean {
  if (!embed) return false;
  
  // Check for direct video embed
  if (embed.video) return true;
  
  // Check for video in media
  if (embed.media?.video) return true;
  
  // Check for video embed type
  if (embed.$type === 'app.bsky.embed.video#view') return true;
  
  // Check for recordWithMedia that contains video
  if (embed.$type === 'app.bsky.embed.recordWithMedia#view' && embed.media?.video) return true;
  
  return false;
}

export function hasExternalLink(embed: PostEmbed): boolean {
  return !!embed.external;
}

export function hasRecord(embed: PostEmbed): boolean {
  return !!embed.record;
}

export function getEmbedImages(embed: PostEmbed) {
  return embed.images || embed.media?.images || [];
}

export function getEmbedVideo(embed: PostEmbed) {
  return embed.video || embed.media?.video;
}

export function isVideoPost(post: any): boolean {
  if (!post || !post.embed) return false;
  
  // Check various video embed patterns
  return hasVideo(post.embed);
}

export function getVideoFromPost(post: any) {
  if (!post || !post.embed) return null;
  
  return getEmbedVideo(post.embed);
}

export function calculateImageAspectRatio(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = width / height;
  
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width, height };
}

export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function isValidVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  try {
    // Remove any potential malicious characters
    const cleanUrl = url.trim();
    
    // Ensure the URL has a protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return `https://${cleanUrl}`;
    }
    
    return cleanUrl;
  } catch {
    return url;
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    
    // Remove www. prefix
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch {
    // Fallback for invalid URLs
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}