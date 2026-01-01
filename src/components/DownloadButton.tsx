import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoFormat, DownloadState } from "@/types/video";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  selectedFormat: VideoFormat | null;
  downloadState: DownloadState;
  onDownload: () => void;
  onCancel: () => void;
  formatBytes?: (bytes: number) => string;
  formatSpeed?: (speed: number) => string;
  formatEta?: (seconds: number) => string;
}

export function DownloadButton({
  selectedFormat,
  downloadState,
  onDownload,
  onCancel,
  formatBytes = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`,
  formatSpeed = (s) => `${(s / 1024 / 1024).toFixed(1)} MB/s`,
  formatEta = (e) => e > 0 ? `${Math.round(e)}s` : '',
}: DownloadButtonProps) {
  const isDisabled = !selectedFormat || downloadState.isDownloading;

  const getStatusText = () => {
    switch (downloadState.phase) {
      case 'starting':
        return 'Starting...';
      case 'downloading':
        if (downloadState.totalBytes > 0) {
          const streamLabel = downloadState.message || 'Downloading...';
          return `${downloadState.progress}% • ${formatBytes(downloadState.downloadedBytes)} / ${formatBytes(downloadState.totalBytes)}`;
        }
        return downloadState.message || `Downloading... ${downloadState.progress}%`;
      case 'processing':
        return downloadState.isAudio ? 'Converting to MP3...' : 'Merging video & audio...';
      case 'transferring':
        return 'Saving to device...';
      case 'ready':
        return 'Complete!';
      case 'error':
        return 'Failed';
      default:
        return 'Loading...';
    }
  };

  const getSpeedText = () => {
    if (downloadState.phase === 'downloading' && downloadState.speed > 0) {
      const eta = downloadState.eta > 0 ? ` • ${formatEta(downloadState.eta)} left` : '';
      return `${formatSpeed(downloadState.speed)}${eta}`;
    }
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="relative flex gap-2">
        <Button
          onClick={onDownload}
          disabled={isDisabled}
          variant="success"
          size="xl"
          className={cn(
            "flex-1 relative overflow-hidden flex-col h-auto py-3",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {downloadState.isDownloading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">{getStatusText()}</span>
              </div>
              {getSpeedText() && (
                <span className="text-xs opacity-80">{getSpeedText()}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>
                {selectedFormat
                  ? `Download ${selectedFormat.quality}`
                  : "Select a format to download"}
              </span>
            </div>
          )}

          {/* Progress bar overlay - show during download and processing */}
          {downloadState.isDownloading && downloadState.progress > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-success-foreground/10 transition-all duration-300"
              style={{ width: `${downloadState.progress}%` }}
            />
          )}
        </Button>

        {downloadState.isDownloading && (
          <Button
            onClick={onCancel}
            variant="destructive"
            size="xl"
            className="px-6"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {selectedFormat && !downloadState.isDownloading && (
        <p className="text-center text-sm text-muted-foreground mt-3">
          {selectedFormat.type === "video" ? "Video" : "Audio"} •{" "}
          {selectedFormat.quality} • {selectedFormat.ext.toUpperCase()}
        </p>
      )}
    </div>
  );
}
