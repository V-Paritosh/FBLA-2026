"use client";

import { useState } from "react";
import { X, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "Programming", label: "Programming" },
  { id: "Web Dev", label: "Web Development" },
  { id: "Cybersecurity", label: "Cybersecurity" },
  { id: "Databases", label: "Databases" },
  { id: "ML", label: "Machine Learning" },
  { id: "Algorithms", label: "Algorithms" },
];

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResourceAdded: (resource: any) => void;
}

export function AddResourceModal({
  isOpen,
  onClose,
  onResourceAdded,
}: AddResourceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "lesson",
    category: "Programming",
    difficulty: "Beginner",
    link: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUrl = formData.link;

      // 1. Handle File Upload (Targeting the new route)
      if (formData.type === "cheatsheet" && file) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        // POINTING TO YOUR NEW ROUTE HERE:
        const uploadRes = await fetch("/api/uploads/resources", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "File upload failed");
        }

        const data = await uploadRes.json();
        finalUrl = data.url; // Capture the Supabase URL
      }

      // 2. Save Resource Metadata (To MongoDB via your resources API)
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          category: formData.category,
          difficulty: formData.difficulty,
          url: finalUrl, // This is either the User's link OR the Supabase URL
        }),
      });

      if (!res.ok) throw new Error("Failed to create resource");

      const newResource = await res.json();
      onResourceAdded(newResource);
      onClose();

      // Reset form...
      setFormData({
        title: "",
        type: "lesson",
        category: "Programming",
        difficulty: "Beginner",
        link: "",
      });
      setFile(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border w-full max-w-lg rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Resource (+25 XP)</h2>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input
                  required
                  className="w-full p-2 rounded-md bg-input border border-border"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select
                    className="w-full p-2 rounded-md bg-input border border-border"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="lesson">Lesson (Roadmap)</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                    <option value="cheatsheet">Cheatsheet (PDF)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Category
                  </label>
                  <select
                    className="w-full p-2 rounded-md bg-input border border-border"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Difficulty
                </label>
                <select
                  className="w-full p-2 rounded-md bg-input border border-border"
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              {formData.type === "cheatsheet" ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Upload PDF
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors relative">
                    <input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "Click to upload PDF"}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    External Link
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      className="w-full pl-9 p-2 rounded-md bg-input border border-border"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Adding..." : "Submit Resource"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
