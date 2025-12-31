import { Clock, User } from "lucide-react";
import { VideoInfo } from "@/types/video";
import { formatDuration } from "@/utils/formatters";

interface VideoPreviewProps {
  video: VideoInfo;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
        <div className="relative aspect-video">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-medium">
            {formatDuration(video.duration)}
          </div>
        </div>
        <div className="p-4 md:p-5">
          <h2 className="text-lg md:text-xl font-semibold text-foreground line-clamp-2 leading-tight">
            {video.title}
          </h2>
          <div className="flex items-center gap-4 mt-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{video.channel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatDuration(video.duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
