export interface EmbedImage {
  thumb: string;
  fullsize: string;
  alt: string;
  aspectRatio?: {
    width: number;
    height: number;
  };
}

export interface EmbedExternal {
  uri: string;
  title: string;
  description: string;
  thumb?: string;
}

export interface EmbedRecord {
  $type: string;
  record: any;
}

export interface EmbedVideo {
  cid: string;
  playlist: string;
  thumbnail?: string;
  alt?: string;
  aspectRatio?: {
    width: number;
    height: number;
  };
}

export type EmbedType = 'images' | 'external' | 'record' | 'video' | 'recordWithMedia';

export interface PostEmbed {
  $type: string;
  images?: EmbedImage[];
  external?: EmbedExternal;
  record?: EmbedRecord;
  video?: EmbedVideo;
  media?: {
    images?: EmbedImage[];
    video?: EmbedVideo;
  };
}

export interface EmbedDimensions {
  width: number;
  height: number;
  maxWidth?: number;
  maxHeight?: number;
}