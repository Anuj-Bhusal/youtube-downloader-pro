export interface VideoFormat {
  format_id: string;
  quality: string;
  ext: string;
  filesize?: number | null;
  type: 'video' | 'audio';
}

export interface VideoInfo {
  title: string;
  duration: number;
  channel: string;
  thumbnail: string;
  formats: VideoFormat[];
}

export interface DownloadState {
  isDownloading: boolean;
  progress: number;
  phase: 'idle' | 'starting' | 'downloading' | 'processing' | 'transferring' | 'ready' | 'error';
  downloadedBytes: number;
  totalBytes: number;
  speed: number;
  eta: number;
  message: string;
  error: string | null;
}
