"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoDownloadToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AutoDownloadToggle({ enabled, onToggle }: AutoDownloadToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors",
        enabled
          ? "bg-blue-950 border-blue-800 text-blue-300"
          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
      )}
    >
      <Download className={cn("w-3.5 h-3.5", enabled && "text-blue-400")} />
      Auto-download
      <span
        className={cn(
          "ml-0.5 w-6 h-3.5 rounded-full transition-colors relative",
          enabled ? "bg-blue-600" : "bg-zinc-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all",
            enabled ? "left-[calc(100%-0.625rem-0.125rem)]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}