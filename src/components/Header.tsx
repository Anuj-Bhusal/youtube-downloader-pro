import { Download } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-6 px-4">
      <div className="flex items-center justify-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-foreground">YouTube</span>
          <span className="text-primary ml-2">Downloader</span>
        </h1>
      </div>
      <p className="text-center text-muted-foreground mt-2 text-sm">
        Download videos and audio in any quality
      </p>
    </header>
  );
}
