import { useState, useCallback, useRef } from "react";
import { VideoInfo, VideoFormat, DownloadState } from "@/types/video";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "@/hooks/use-toast";

const initialDownloadState: DownloadState = {
  isDownloading: false,
  progress: 0,
  phase: 'idle',
  downloadedBytes: 0,
  totalBytes: 0,
  speed: 0,
  eta: 0,
  message: '',
  error: null,
  isAudio: false,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatSpeed(bytesPerSecond: number): string {
  if (!bytesPerSecond || bytesPerSecond === 0) return '0 MB/s';
  return formatBytes(bytesPerSecond) + '/s';
}

function formatEta(seconds: number): string {
  if (!seconds || seconds === 0) return '';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
}

export function useVideoDownloader() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>(initialDownloadState);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const jobIdRef = useRef<string | null>(null);

  const fetchVideoInfo = useCallback(async (videoUrl: string) => {
    setIsLoading(true);
    setVideoInfo(null);
    setSelectedFormat(null);
    setUrl(videoUrl);

    try {
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

    // Reset and start
    setDownloadState({
      ...initialDownloadState,
      isDownloading: true,
      phase: 'starting',
      message: 'Starting download...',
    });

    toast({
      title: "Starting Download",
      description: "Connecting to server...",
      duration: 3000,
    });

    try {
      // Step 1: Start the download job
      const startResponse = await fetch(API_ENDPOINTS.DOWNLOAD_START, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          format_id: selectedFormat.format_id,
        }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start download');
      }

      const { job_id } = await startResponse.json();
      jobIdRef.current = job_id;

      // Step 2: Connect to SSE for progress updates
      const eventSource = new EventSource(API_ENDPOINTS.DOWNLOAD_PROGRESS(job_id));
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle error from server
          if (data.phase === 'error' || data.error) {
            eventSource.close();
            eventSourceRef.current = null;
            const errorMsg = data.error || 'Download failed';
            toast({
              title: "Download Failed",
              description: errorMsg,
              variant: "destructive",
            });
            setDownloadState({ ...initialDownloadState });
            return;
          }

          // Update download state with real progress
          setDownloadState({
            isDownloading: true,
            progress: data.progress || 0,
            phase: data.phase || 'downloading',
            downloadedBytes: data.downloaded_bytes || 0,
            totalBytes: data.total_bytes || 0,
            speed: data.speed || 0,
            eta: data.eta || 0,
            message: data.message || '',
            error: data.error || null,
            isAudio: data.is_audio || false,
          });

          // Handle completion
          if (data.phase === 'ready') {
            eventSource.close();
            eventSourceRef.current = null;
            
            // Download the file
            downloadFile(job_id, data.filename);
          }
        } catch (parseError) {
          console.error('SSE parse error:', parseError);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        
        // Only show error if we're still downloading
        setDownloadState(prev => {
          if (prev.isDownloading && prev.phase !== 'ready') {
            toast({
              title: "Connection Lost",
              description: "Lost connection to server. Please try again.",
              variant: "destructive",
            });
            return { ...initialDownloadState };
          }
          return prev;
        });
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Download failed";
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setDownloadState({ ...initialDownloadState });
    }
  }, [selectedFormat, url]);

  const downloadFile = async (jobId: string, filename: string) => {
    try {
      setDownloadState(prev => ({
        ...prev,
        phase: 'transferring',
        message: 'Downloading to your device...',
      }));

      toast({
        title: "Download Ready",
        description: "Transferring file to your device...",
        duration: 3000,
      });

      // Fetch the file
      const response = await fetch(API_ENDPOINTS.DOWNLOAD_FILE(jobId));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename || 'video.mp4';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: "Download Complete!",
        description: `${filename} - Check your downloads folder.`,
        duration: 5000,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error('Download error:', error);
      toast({
        title: "Transfer Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDownloadState({ ...initialDownloadState });
      jobIdRef.current = null;
    }
  };

  const cancelDownload = useCallback(() => {
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    jobIdRef.current = null;
    setDownloadState({ ...initialDownloadState });
    
    toast({
      title: "Download Cancelled",
      description: "Download was cancelled.",
    });
  }, []);

  const reset = useCallback(() => {
    cancelDownload();
    setUrl("");
    setVideoInfo(null);
    setSelectedFormat(null);
  }, [cancelDownload]);

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
    // Helper formatters
    formatBytes,
    formatSpeed,
    formatEta,
  };
}
