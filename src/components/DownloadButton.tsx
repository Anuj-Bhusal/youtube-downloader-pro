import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoFormat, DownloadState } from "@/types/video";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  selectedFormat: VideoFormat | null;
  downloadState: DownloadState;
  onDownload: () => void;
  onCancel: () => void;
}

export function DownloadButton({
  selectedFormat,
  downloadState,
  onDownload,
  onCancel,
}: DownloadButtonProps) {
  const isDisabled = !selectedFormat || downloadState.isDownloading;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="relative flex gap-2">
        <Button
          onClick={onDownload}
          disabled={isDisabled}
          variant="success"
          size="xl"
          className={cn(
            "flex-1 relative overflow-hidden",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {downloadState.isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Downloading... {downloadState.progress}%</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>
                {selectedFormat
                  ? `Download ${selectedFormat.quality}`
                  : "Select a format to download"}
              </span>
            </>
          )}

          {/* Progress bar overlay */}
          {downloadState.isDownloading && (
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
