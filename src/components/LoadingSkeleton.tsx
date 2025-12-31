export function VideoPreviewSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="bg-card rounded-2xl overflow-hidden border border-border">
        <div className="aspect-video animate-shimmer" />
        <div className="p-4 md:p-5 space-y-3">
          <div className="h-6 bg-secondary rounded-lg animate-shimmer w-3/4" />
          <div className="flex gap-4">
            <div className="h-4 bg-secondary rounded animate-shimmer w-24" />
            <div className="h-4 bg-secondary rounded animate-shimmer w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormatSelectorSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          <div className="flex-1 py-4 flex justify-center">
            <div className="h-5 bg-secondary rounded animate-shimmer w-16" />
          </div>
          <div className="flex-1 py-4 flex justify-center">
            <div className="h-5 bg-secondary rounded animate-shimmer w-20" />
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-secondary rounded-xl animate-shimmer"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
