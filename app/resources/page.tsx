"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { AddResourceModal } from "@/components/add-resource-modal";
import {
  BookOpen,
  Play,
  FileText,
  Trophy,
  Search,
  Plus,
  Shield,
  Database,
  Brain,
  Zap,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner"; // Assuming you have a toast library, if not, use alert or remove

// Map for icons
const ICONS: Record<string, any> = {
  Programming: Code2,
  "Web Dev": BookOpen,
  Cybersecurity: Shield,
  Databases: Database,
  ML: Brain,
  Algorithms: Zap,
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "lesson" | "video" | "quiz" | "cheatsheet"
  >("lesson");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch resources on load
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle User Interaction (Click -> Award XP -> Open)
  const handleInteraction = async (resource: any) => {
    try {
      // 1. Optimistically open the link immediately for better UX
      if (resource.type === "cheatsheet") {
        // Trigger download/open
        window.open(resource.url, "_blank");
      } else {
        window.open(resource.url, "_blank");
      }

      // 2. Track Interaction in background
      const res = await fetch("/api/resources/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: resource._id, type: resource.type }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`+${data.xpAwarded} XP Awarded!`);
        // Optional: Update local user context XP here
      }
    } catch (error) {
      console.error("Interaction failed", error);
    }
  };

  const filteredResources = resources.filter(
    (r) =>
      r.type === activeTab &&
      r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

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
                    Community curated resources. Learn & Earn.
                  </p>
                </motion.div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-input text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-border overflow-x-auto">
                {["lesson", "video", "quiz", "cheatsheet"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 px-4 border-b-2 transition-colors capitalize font-medium whitespace-nowrap ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}s
                  </button>
                ))}
              </div>

              {/* Content Grid */}
              {loading ? (
                <div className="text-center py-20 text-muted-foreground">
                  Loading resources...
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-lg border border-dashed">
                  No resources found. Be the first to add one!
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource, index) => {
                    const Icon = ICONS[resource.category] || BookOpen;

                    return (
                      <motion.div
                        key={resource._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded">
                              {resource.difficulty}
                            </span>
                          </div>

                          <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {resource.category}
                          </p>
                        </div>

                        <button
                          onClick={() => handleInteraction(resource)}
                          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          {activeTab === "lesson" && "Start Lesson"}
                          {activeTab === "video" && (
                            <>
                              <Play className="w-4 h-4" /> Watch Video
                            </>
                          )}
                          {activeTab === "quiz" && (
                            <>
                              <Trophy className="w-4 h-4" /> Start Quiz
                            </>
                          )}
                          {activeTab === "cheatsheet" && (
                            <>
                              <FileText className="w-4 h-4" /> Download PDF
                            </>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AddResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResourceAdded={(newRes) => setResources([newRes, ...resources])}
      />
    </div>
  );
}
