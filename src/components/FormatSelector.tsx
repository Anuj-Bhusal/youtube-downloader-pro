import { useState } from "react";
import { Video, Music, Check } from "lucide-react";
import { VideoFormat } from "@/types/video";
import { formatFileSize } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface FormatSelectorProps {
  formats: VideoFormat[];
  selectedFormat: VideoFormat | null;
  onSelectFormat: (format: VideoFormat) => void;
}

type TabType = "video" | "audio";

export function FormatSelector({
  formats,
  selectedFormat,
  onSelectFormat,
}: FormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("video");

  const videoFormats = formats.filter((f) => f.type === "video");
  const audioFormats = formats.filter((f) => f.type === "audio");

  const currentFormats = activeTab === "video" ? videoFormats : audioFormats;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("video")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-all duration-200",
              activeTab === "video"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-all duration-200",
              activeTab === "audio"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Music className="w-4 h-4" />
            <span>Audio Only</span>
          </button>
        </div>

        {/* Format List */}
        <div className="p-3 md:p-4 grid gap-2">
          {currentFormats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {activeTab} formats available
            </div>
          ) : (
            currentFormats.map((format) => (
              <FormatCard
                key={format.format_id}
                format={format}
                isSelected={selectedFormat?.format_id === format.format_id}
                onSelect={() => onSelectFormat(format)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface FormatCardProps {
  format: VideoFormat;
  isSelected: boolean;
  onSelect: () => void;
}

function FormatCard({ format, isSelected, onSelect }: FormatCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
        isSelected
          ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
          : "bg-secondary/50 border-border hover:bg-secondary hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground"
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">{format.quality}</p>
          <p className="text-xs text-muted-foreground uppercase">
            {format.ext}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">
          {formatFileSize(format.filesize)}
        </p>
      </div>
    </button>
  );
}
