import { useState } from "react";
import { Loader2, Search, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidYouTubeUrl } from "@/utils/formatters";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4">
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              className="pl-12 pr-4 h-14 text-base"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Get Video</span>
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-destructive text-sm mt-2 text-center animate-fade-in">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
