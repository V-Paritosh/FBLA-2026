"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Plus, X, Sparkles, Layers, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState<{ title: string; notes: string }[]>(
    []
  );
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const addModule = () => {
    if (newModuleTitle.trim()) {
      setModules([...modules, { title: newModuleTitle, notes: "" }]);
      setNewModuleTitle("");
    }
  };

  // Logic to remove a module from the local state list
  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          modules: modules.map((m) => ({
            title: m.title,
            completed: false,
            notes: "",
          })),
        }),
      });

      if (response.ok) {
        const { projectId } = await response.json();
        router.push(`/project/${projectId}`);
      } else {
        setError("Failed to create project");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-muted/20">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
              >
                {/* Header Banner */}
                <div className="bg-primary/5 p-8 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Create New Project
                    </h1>
                  </div>
                  <p className="text-muted-foreground ml-11">
                    Define your learning path. Break it down into manageable
                    modules.
                  </p>
                </div>

                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Info */}
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-semibold text-foreground mb-2"
                        >
                          Project Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Master React & Next.js"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-semibold text-foreground mb-2"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What is the main goal of this project?"
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-border w-full" />

                    {/* Modules Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          Curriculum Modules
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {modules.length} modules added
                        </span>
                      </div>

                      {/* Add Module Input Group */}
                      <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addModule())
                            }
                            placeholder="Type a module name and press Enter..."
                            className="w-full pl-4 pr-12 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <div className="absolute right-2 top-2">
                            <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-muted-foreground bg-muted rounded border border-border">
                              Enter
                            </kbd>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addModule}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 rounded-lg font-medium transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modules List */}
                      <div className="space-y-2 min-h-[100px]">
                        <AnimatePresence mode="popLayout">
                          {modules.map((module, index) => (
                            <motion.div
                              key={`${module.title}-${index}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              layout
                              className="group flex items-center justify-between p-3 pl-4 bg-muted/30 border border-transparent hover:border-border rounded-lg transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-background text-xs font-medium text-muted-foreground border border-border">
                                  {index + 1}
                                </span>
                                <span className="text-foreground font-medium">
                                  {module.title}
                                </span>
                              </div>

                              {/* REMOVE BUTTON */}
                              <button
                                type="button"
                                onClick={() => removeModule(index)}
                                aria-label="Remove module"
                                className="text-muted-foreground opacity-60 hover:opacity-100 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {modules.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-lg">
                            <Layers className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No modules added yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        {error}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-1/3 px-6 py-3 border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium shadow-sm transition-all flex justify-center items-center gap-2"
                      >
                        {loading ? (
                          <>Creating Project...</>
                        ) : (
                          <>
                            Create Project <Sparkles className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
