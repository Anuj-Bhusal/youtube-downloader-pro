import { useState, useCallback, useRef } from "react";
import { VideoInfo, VideoFormat, DownloadState } from "@/types/video";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "@/hooks/use-toast";

// Mock data for demo purposes
const MOCK_VIDEO_INFO: VideoInfo = {
  title: "Amazing Nature Documentary - 4K Ultra HD",
  duration: 754,
  channel: "Nature Channel",
  thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  formats: [
    { format_id: "4k", quality: "4K (2160p)", ext: "mp4", filesize: 2147483648, type: "video" },
    { format_id: "1440p", quality: "1440p", ext: "mp4", filesize: 1073741824, type: "video" },
    { format_id: "1080p", quality: "1080p", ext: "mp4", filesize: 536870912, type: "video" },
    { format_id: "720p", quality: "720p", ext: "mp4", filesize: 268435456, type: "video" },
    { format_id: "480p", quality: "480p", ext: "mp4", filesize: 134217728, type: "video" },
    { format_id: "360p", quality: "360p", ext: "mp4", filesize: 67108864, type: "video" },
    { format_id: "320k", quality: "320kbps", ext: "mp3", filesize: 12582912, type: "audio" },
    { format_id: "256k", quality: "256kbps", ext: "mp3", filesize: 10066329, type: "audio" },
    { format_id: "128k", quality: "128kbps", ext: "mp3", filesize: 5033164, type: "audio" },
  ],
};

export function useVideoDownloader() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchVideoInfo = useCallback(async (videoUrl: string) => {
    setIsLoading(true);
    setVideoInfo(null);
    setSelectedFormat(null);
    setUrl(videoUrl);

    try {
      // Attempt real API call
      const response = await fetch(API_ENDPOINTS.INFO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setVideoInfo(data);
    } catch (error) {
      // Show actual error to user
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch video info";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadVideo = useCallback(async () => {
    if (!selectedFormat || !url) return;

    // Create new AbortController for this download
    abortControllerRef.current = new AbortController();
    setDownloadState({ isDownloading: true, progress: 0 });

    try {
      // Show preparing toast
      toast({
        title: "Preparing Download",
        description: "Server is fetching video from YouTube...",
        duration: 5000,
      });

      // Add timeout warning
      const timeoutId = setTimeout(() => {
        toast({
          title: "Still Processing",
          description: "Large files may take 30-60 seconds. Please wait...",
          duration: 10000,
        });
      }, 8000);

      const response = await fetch(API_ENDPOINTS.DOWNLOAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          format_id: selectedFormat.format_id,
        }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `video.${selectedFormat.ext}`;

      // Get total size from Content-Length header
      const contentLength = response.headers.get("Content-Length");
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      toast({
        title: "Downloading",
        description: "Download in progress...",
        duration: 3000,
      });

      // Track progress using ReadableStream
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let receivedSize = 0;
      let lastProgress = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          receivedSize += value.length;
          
          // Update progress percentage only when it changes
          if (totalSize > 0) {
            const progress = Math.min(Math.floor((receivedSize / totalSize) * 100), 99);
            
            // Only update if progress actually changed to avoid skipping numbers
            if (progress !== lastProgress) {
              setDownloadState({ isDownloading: true, progress });
              lastProgress = progress;
            }
          }
        }
      }

      // Create blob from chunks
      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);

      setDownloadState({ isDownloading: false, progress: 100 });

      toast({
        title: "Download Complete",
        description: `${filename} - Check your downloads folder.`,
        duration: 3000,
      });
    } catch (error) {
      // Check if it was a user cancellation
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "Download Cancelled",
          description: "Download was cancelled by user.",
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Download failed";
        toast({
          title: "Download Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      abortControllerRef.current = null;
      setDownloadState({ isDownloading: false, progress: 0 });
    }
  }, [selectedFormat, url, videoInfo]);

  const cancelDownload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setUrl("");
    setVideoInfo(null);
    setSelectedFormat(null);
    setDownloadState({ isDownloading: false, progress: 0 });
  }, []);

  return {
    url,
    videoInfo,
    selectedFormat,
    isLoading,
    downloadState,
    fetchVideoInfo,
    setSelectedFormat,
    downloadVideo,
    cancelDownload,
    reset,
  };
}
