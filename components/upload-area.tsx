"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X } from "lucide-react"

interface UploadAreaProps {
  projectId: string
}

export function UploadArea({ projectId }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploads, setUploads] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((f) => {
      // Only allow files < 10MB
      return f.size < 10 * 1024 * 1024
    })

    setUploads((prev) => [...prev, ...validFiles])

    // Upload files
    validFiles.forEach((file) => {
      uploadFile(file)
    })
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("projectId", projectId)

    try {
      await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Drag Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
        />

        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">Drag files here or click to upload</h3>
        <p className="text-sm text-muted-foreground">PDFs, images, documents up to 10MB</p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Select Files
        </button>
      </div>

      {/* Uploads List */}
      {uploads.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Recent uploads</h4>
          {uploads.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{file.name}</span>
              </div>
              <button
                onClick={() => removeUpload(index)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
