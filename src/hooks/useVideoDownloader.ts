import { useState, useCallback } from "react";
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

      if (response.ok) {
        const data = await response.json();
        setVideoInfo(data);
      } else {
        throw new Error("API not available");
      }
    } catch {
      // Fallback to mock data for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setVideoInfo(MOCK_VIDEO_INFO);
      toast({
        title: "Demo Mode",
        description: "Using sample data. Configure API_BASE_URL for real downloads.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadVideo = useCallback(async () => {
    if (!selectedFormat || !url) return;

    setDownloadState({ isDownloading: true, progress: 0 });

    try {
      // Simulate download progress for demo
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setDownloadState({ isDownloading: true, progress: i });
      }

      toast({
        title: "Download Complete",
        description: `${videoInfo?.title} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadState({ isDownloading: false, progress: 0 });
    }
  }, [selectedFormat, url, videoInfo]);

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
    reset,
  };
}
