"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { VideoSource } from "@/lib/video";
import { cn } from "@/lib/utils";

interface VideoPlayModalProps {
  video: VideoSource;
  open: boolean;
  onClose: () => void;
}

export function VideoPlayModal({ video, open, onClose }: VideoPlayModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open || !video) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl",
          video.type === "youtube" ? "max-w-5xl aspect-video" : "max-w-4xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {video.type === "youtube" ? (
          <iframe
            src={video.embedUrl}
            title="Vidéo"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={video.src} controls autoPlay className="max-h-[80vh] w-full">
            <track kind="captions" />
          </video>
        )}
      </div>
    </div>
  );
}
