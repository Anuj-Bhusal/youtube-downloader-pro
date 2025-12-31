import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoFormat, DownloadState } from "@/types/video";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  selectedFormat: VideoFormat | null;
  downloadState: DownloadState;
  onDownload: () => void;
}

export function DownloadButton({
  selectedFormat,
  downloadState,
  onDownload,
}: DownloadButtonProps) {
  const isDisabled = !selectedFormat || downloadState.isDownloading;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="relative">
        <Button
          onClick={onDownload}
          disabled={isDisabled}
          variant="success"
          size="xl"
          className={cn(
            "w-full relative overflow-hidden",
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
