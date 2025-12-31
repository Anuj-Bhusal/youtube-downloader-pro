import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { VideoPreview } from "@/components/VideoPreview";
import { FormatSelector } from "@/components/FormatSelector";
import { DownloadButton } from "@/components/DownloadButton";
import { VideoPreviewSkeleton, FormatSelectorSkeleton } from "@/components/LoadingSkeleton";
import { useVideoDownloader } from "@/hooks/useVideoDownloader";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const {
    videoInfo,
    selectedFormat,
    isLoading,
    downloadState,
    fetchVideoInfo,
    setSelectedFormat,
    downloadVideo,
    reset,
  } = useVideoDownloader();

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col items-center py-8 space-y-6">
          {/* URL Input */}
          <section className="w-full">
            <UrlInput onSubmit={fetchVideoInfo} isLoading={isLoading} />
          </section>

          {/* Loading States */}
          {isLoading && (
            <div className="w-full space-y-6">
              <VideoPreviewSkeleton />
              <FormatSelectorSkeleton />
            </div>
          )}

          {/* Video Preview */}
          {videoInfo && !isLoading && (
            <>
              <div className="w-full max-w-2xl mx-auto px-4">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              <section className="w-full">
                <VideoPreview video={videoInfo} />
              </section>

              {/* Format Selector */}
              <section className="w-full">
                <FormatSelector
                  formats={videoInfo.formats}
                  selectedFormat={selectedFormat}
                  onSelectFormat={setSelectedFormat}
                />
              </section>

              {/* Download Button */}
              <section className="w-full pb-8">
                <DownloadButton
                  selectedFormat={selectedFormat}
                  downloadState={downloadState}
                  onDownload={downloadVideo}
                />
              </section>
            </>
          )}

          {/* Empty State */}
          {!videoInfo && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ready to Download
              </h2>
              <p className="text-muted-foreground max-w-sm">
                Paste a YouTube video URL above to get started. We support youtube.com
                and youtu.be links.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          <p>For personal use only. Respect content creators' rights.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
