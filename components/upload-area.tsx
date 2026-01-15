"use client";

import { useState, useEffect } from "react";
import { Upload, File, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadedFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

interface UploadAreaProps {
  projectId: string;
  initialFiles?: UploadedFile[];
}

export function UploadArea({ projectId, initialFiles = [] }: UploadAreaProps) {
  const router = useRouter();

  // Local state for the file list
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. AUTO-REFRESH: Sync local state when server data changes (e.g., after upload)
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    // 1. LIMIT CHECK: Define limit (50MB in bytes)
    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Filter files and warn user
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        alert(
          `File "${file.name}" is too large. Max size is ${MAX_SIZE_MB}MB.`
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    const successfulUploads: UploadedFile[] = [];

    // Use 'validFiles' instead of 'newFiles'
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      try {
        const response = await fetch("/api/uploads/projects", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const newFile: UploadedFile = await response.json();
          successfulUploads.push(newFile);
        } else {
          // Handle server-side size errors that might slip through
          const errorData = await response.json().catch(() => ({}));
          alert(
            `Upload failed for ${file.name}: ${
              errorData.error || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error("Upload error", error);
      }
    }

    setUploading(false);

    if (successfulUploads.length > 0) {
      setFiles((prev) => [...prev, ...successfulUploads]);
    }

    router.refresh();
  };

  const removeFile = async (uploadId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    // Optimistic UI: Remove immediately from view
    const previousFiles = [...files];
    setFiles((prev) => prev.filter((f) => f._id !== uploadId));
    setDeletingId(uploadId);

    try {
      const response = await fetch(`/api/uploads/${uploadId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.refresh(); // Sync with server
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Could not delete file.");
      setFiles(previousFiles); // Revert on error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 3. CLICKABLE AREA: Changed 'div' to 'label' and added 'cursor-pointer' */}
      <label
        htmlFor="file-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input
          type="file"
          className="hidden"
          id="file-upload"
          multiple
          onChange={(e) =>
            e.target.files && handleFiles(Array.from(e.target.files))
          }
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium">
              Drag files here or click to upload
            </p>
            <span className="mt-2 text-xs text-primary group-hover:underline">
              Browse computer
            </span>
          </>
        )}
      </label>

      {/* File List */}
      <div className="space-y-2">
        {files.length === 0 && !uploading && (
          <p className="text-xs text-muted-foreground text-center">
            No files yet.
          </p>
        )}

        {files.map((file) => (
          <div
            key={file._id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-background p-2 rounded-md border border-border">
                <File className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {file.fileName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {(file.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View File"
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent label click bubbling if inside
                  removeFile(file._id);
                }}
                disabled={deletingId === file._id}
                title="Delete File"
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              >
                {deletingId === file._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
