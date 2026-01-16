"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { AddResourceModal } from "@/components/add-resource-modal";
import {
  BookOpen,
  Code2,
  Database,
  Shield,
  Brain,
  Zap,
  Trash2,
  Edit,
  Plus,
  Filter,
  BarChart,
  SearchX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- STYLE CONSTANTS ---
const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Intermediate:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Advanced:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const CATEGORY_STYLES: Record<string, string> = {
  Programming:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Web Dev":
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Cybersecurity:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Databases:
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  ML: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
  Algorithms:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

const ICONS: Record<string, any> = {
  Programming: Code2,
  "Web Dev": BookOpen,
  Cybersecurity: Shield,
  Databases: Database,
  ML: Brain,
  Algorithms: Zap,
};

const CATEGORIES = [
  "Programming",
  "Web Dev",
  "Cybersecurity",
  "Databases",
  "ML",
  "Algorithms",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// --- Notification Interface ---
interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "lesson" | "video" | "quiz" | "cheatsheet"
  >("lesson");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Notification Handler
  const addNotification = (
    message: string,
    type: "success" | "info" | "error"
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      3000
    );
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources);
        setCurrentUserId(data.currentUserId);
      }
    } catch (error) {
      console.error(error);
      addNotification("Failed to load resources", "error");
    }
  };

  const handleInteraction = async (resource: any) => {
    window.open(resource.url, "_blank");
    fetch("/api/resources/interact", {
      method: "POST",
      body: JSON.stringify({ resourceId: resource._id, type: resource.type }),
    });
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Are you sure? This will remove 25 XP from your profile."))
      return;
    try {
      const res = await fetch(`/api/resources?id=${resourceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r._id !== resourceId));
        addNotification("Resource deleted. 25 XP deducted.", "info");
      } else {
        addNotification("Failed to delete resource.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (resource: any) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const filteredResources = resources.filter((r) => {
    const matchesTab = r.type === activeTab;
    const matchesCategory =
      selectedCategory === "All" || r.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || r.difficulty === selectedLevel;

    return matchesTab && matchesCategory && matchesLevel;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />

        {/* --- Notifications (Now at Bottom Right) --- */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`
                  pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 min-w-[250px]
                  ${
                    n.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : ""
                  }
                  ${
                    n.type === "error"
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      : ""
                  }
                  ${
                    n.type === "info"
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      : ""
                  }
                `}
              >
                <span>{n.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <main className="flex-1 overflow-auto relative">
          <div className="p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Learning Hub
                  </h1>
                  <p className="text-muted-foreground">
                    Community curated resources.
                  </p>
                </motion.div>
                <button
                  onClick={() => {
                    setEditingResource(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Resource
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                  {["lesson", "video", "quiz", "cheatsheet"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        activeTab === tab
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {tab}s
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-48">
                    <Filter className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex-1 lg:w-48">
                    <BarChart className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none rotate-90" />
                    <select
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      <option value="All">All Levels</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Resources Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => {
                  const Icon = ICONS[resource.category] || BookOpen;
                  const isOwner =
                    currentUserId && resource.createdBy === currentUserId;

                  const difficultyClass =
                    DIFFICULTY_STYLES[resource.difficulty] ||
                    "bg-muted text-muted-foreground border-border";
                  const categoryClass =
                    CATEGORY_STYLES[resource.category] ||
                    "bg-secondary text-secondary-foreground border-border";
                  const authorClass = isOwner
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";

                  return (
                    <motion.div
                      key={resource._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all hover:border-primary/20 group flex flex-col justify-between relative h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryClass.replace(
                            "border",
                            ""
                          )}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {isOwner && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(resource);
                              }}
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(resource._id);
                              }}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-3 text-lg leading-tight line-clamp-2">
                          {resource.title}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-6">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-medium border ${categoryClass}`}
                          >
                            {resource.category}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-medium border ${difficultyClass}`}
                          >
                            {resource.difficulty}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 ${authorClass}`}
                          >
                            <span className="opacity-70 font-normal">by</span>
                            <span className="font-bold">
                              {isOwner ? "You" : resource.authorName}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInteraction(resource)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md py-2.5 rounded-lg transition-all font-semibold"
                      >
                        Open Resource
                      </button>
                    </motion.div>
                  );
                })}

                {/* --- Empty State with Add Button --- */}
                {filteredResources.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4 bg-muted/5 border-2 border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                      <SearchX className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">No resources found</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        We couldn't find any resources matching your filters.
                        Why not add one yourself?
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingResource(null);
                        setIsModalOpen(true);
                      }}
                      className="mt-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Resource
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddResourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResource(null);
        }}
        initialData={editingResource}
        onShowNotification={addNotification}
        onResourceAdded={(newRes) => setResources([newRes, ...resources])}
        onResourceUpdated={(updatedRes) => {
          setResources((prev) =>
            prev.map((r) => (r._id === updatedRes._id ? updatedRes : r))
          );
        }}
      />
    </div>
  );
}
