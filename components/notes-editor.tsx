"use client"

import type React from "react"

import { useState, useRef } from "react"
import { debounce } from "lodash"

interface NotesEditorProps {
  projectId: string
  moduleIndex: number
}

export function NotesEditor({ projectId, moduleIndex }: NotesEditorProps) {
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const debouncedSave = useRef(
    debounce(async (projectId: string, moduleIndex: number, content: string) => {
      setIsSaving(true)
      try {
        await fetch(`/api/projects/${projectId}/notes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleIndex, notes: content }),
        })
      } catch (error) {
        console.error("Failed to save notes:", error)
      } finally {
        setIsSaving(false)
      }
    }, 300),
  ).current

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setNotes(content)
    debouncedSave(projectId, moduleIndex, content)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Module Notes</label>
        {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
      </div>
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Add your notes here... (auto-saves)"
        rows={6}
        className="w-full px-4 py-2 rounded-lg border border-input bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    </div>
  )
}
