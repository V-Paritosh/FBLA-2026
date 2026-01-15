"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { UploadArea } from "@/components/upload-area";
import { NotesEditor } from "@/components/notes-editor";
import {
  CheckCircle2,
  Circle,
  FileText,
  Trash2,
  ChevronDown,
  Trophy,
  LayoutDashboard,
  ArrowLeft,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Module {
  _id?: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: Date;
  // ADD THIS:
  uploads?: {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // State for expand/collapse
  const [expandedModuleIndex, setExpandedModuleIndex] = useState<number | null>(
    null
  );

  // State for Editing Title
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(
    null
  );
  const [editModuleTitle, setEditModuleTitle] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const toggleModuleCompletion = async (moduleIndex: number) => {
    if (!project) return;
    const updatedModules = [...project.modules];
    updatedModules[moduleIndex].completed =
      !updatedModules[moduleIndex].completed;
    setProject({ ...project, modules: updatedModules });

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: updatedModules }),
      });
    } catch (error) {
      console.error("Failed to update module:", error);
      updatedModules[moduleIndex].completed =
        !updatedModules[moduleIndex].completed;
      setProject({ ...project, modules: updatedModules });
    }
  };

  const deleteModule = async (moduleIndex: number) => {
    if (!project) return;
    if (!confirm("Are you sure you want to remove this module?")) return;

    const updatedModules = project.modules.filter((_, i) => i !== moduleIndex);
    const previousProject = { ...project };
    setProject({ ...project, modules: updatedModules });

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: updatedModules }),
      });

      if (!response.ok) throw new Error("Failed to delete module");
    } catch (error) {
      console.error("Failed to delete module:", error);
      setProject(previousProject);
      alert("Something went wrong. Could not delete module.");
    }
  };

  // --- NEW: Edit Title Logic ---
  const startEditing = (
    e: React.MouseEvent,
    index: number,
    currentTitle: string
  ) => {
    e.stopPropagation(); // Prevent accordion from toggling
    setEditingModuleIndex(index);
    setEditModuleTitle(currentTitle);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingModuleIndex(null);
    setEditModuleTitle("");
  };

  const saveModuleTitle = async (index: number) => {
    if (!project || !editModuleTitle.trim()) return;

    const updatedModules = [...project.modules];
    updatedModules[index].title = editModuleTitle;

    // Optimistic Update
    const previousProject = { ...project };
    setProject({ ...project, modules: updatedModules });

    // Close edit mode
    setEditingModuleIndex(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: updatedModules }),
      });

      if (!response.ok) throw new Error("Failed to update title");
    } catch (error) {
      console.error("Failed to update title:", error);
      setProject(previousProject); // Revert
      alert("Could not update module title");
    }
  };
  // -----------------------------

  const deleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    )
      return;
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (response.ok) router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-muted/20">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const completedCount =
    project.modules?.filter((m) => m.completed).length || 0;
  const totalCount = project.modules?.length || 0;
  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex h-screen bg-muted/20">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Project Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </button>
                </div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  {project.title}
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Modules (Main Content) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    Curriculum
                  </h2>
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {totalCount} Modules
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {(project.modules || []).map((module, index) => (
                      <motion.div
                        key={module._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`group border rounded-xl bg-card transition-all duration-200 ${
                          expandedModuleIndex === index
                            ? "ring-2 ring-primary/20 shadow-md"
                            : "hover:shadow-sm hover:border-primary/30"
                        }`}
                      >
                        <div
                          onClick={() =>
                            // Don't toggle accordion if we are in edit mode for this module
                            editingModuleIndex !== index &&
                            setExpandedModuleIndex(
                              expandedModuleIndex === index ? null : index
                            )
                          }
                          className="flex items-center p-4 cursor-pointer"
                        >
                          {/* Completion Circle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModuleCompletion(index);
                            }}
                            className="mr-4 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {module.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-500/10" />
                            ) : (
                              <Circle className="w-6 h-6" />
                            )}
                          </button>

                          {/* Title Area (Editable) */}
                          <div className="flex-1 pr-4">
                            {editingModuleIndex === index ? (
                              // EDIT MODE INPUT
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editModuleTitle}
                                  onChange={(e) =>
                                    setEditModuleTitle(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      saveModuleTitle(index);
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  autoFocus
                                  className="w-full px-3 py-1.5 rounded-md border border-primary bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                  onClick={() => saveModuleTitle(index)}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              // VIEW MODE TITLE
                              <h3
                                className={`font-medium text-base ${
                                  module.completed
                                    ? "text-muted-foreground line-through decoration-border"
                                    : "text-foreground"
                                }`}
                              >
                                {module.title}
                              </h3>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="ml-2 flex items-center gap-1">
                            {/* Edit Button - Only show if not editing */}
                            {editingModuleIndex !== index && (
                              <button
                                onClick={(e) =>
                                  startEditing(e, index, module.title)
                                }
                                title="Rename Module"
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteModule(index);
                              }}
                              title="Delete Module"
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Chevron */}
                            <ChevronDown
                              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                                expandedModuleIndex === index
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedModuleIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border"
                            >
                              <div className="p-4 bg-muted/30">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                  Module Notes
                                </label>
                                <NotesEditor
                                  projectId={projectId}
                                  moduleIndex={index}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {project.modules.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground">No modules yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="space-y-6">
                {/* Progress Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Progress
                    </h3>
                    <span className="text-2xl font-bold text-foreground">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2.5 mb-2 overflow-hidden">
                    <motion.div
                      className="bg-primary h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {completedCount} of {totalCount} modules completed
                  </p>
                </div>

                {/* Resources */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-4">
                    Project Files
                  </h3>
                  {/* Pass the uploads from the project object */}
                  <UploadArea
                    projectId={projectId}
                    initialFiles={project.uploads}
                  />
                </div>

                {/* Suggested Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Recommended
                  </h3>
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-lg flex gap-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Review Notes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check your notes from the last session.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-border">
                  <button
                    onClick={deleteProject}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
