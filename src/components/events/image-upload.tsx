"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import type { UploadResponse } from "@/lib/types";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/cover-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string; detail?: string; message?: string }
          | null;
        setError(
          errorBody?.error ||
            errorBody?.detail ||
            errorBody?.message ||
            "Erreur lors du téléchargement"
        );
        return;
      }

      const result = (await response.json()) as UploadResponse;
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  }, [handleUpload]);

  return (
    <div className="space-y-2 rounded-md border border-dashed p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Télécharger une image</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP ou GIF, max 5MB</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span>{isUploading ? "Téléchargement..." : "Choisir un fichier"}</span>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {value && (
        <div className="flex items-start gap-3">
          <div className="relative h-24 w-40 overflow-hidden rounded-md border">
            <Image src={value} alt="Couverture de l'événement" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
          >
            <X className="h-3 w-3" />
            Retirer
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</div>
      )}
    </div>
  );
}
