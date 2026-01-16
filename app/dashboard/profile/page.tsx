"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Settings, Save, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  joinedDate: string;
  xp: number;
  streak: number;
  completedModules: number;
  interests?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  learningGoals?: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          {/* Reduced padding on mobile (p-4), larger on desktop (sm:p-8) */}
          <div className="p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="overflow-hidden w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground truncate">
                      {profile?.email}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-6">
                {/* Account Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Account Settings
                  </h2>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Personal Details
                    </label>

                    {/* MOBILE FIX: flex-col for mobile, sm:flex-row for desktop */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        value={editData.firstName || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full sm:flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editData.lastName || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        className="w-full sm:flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Last Name"
                      />

                      {/* Save Button - Full width on mobile, auto on desktop */}
                      <motion.button
                        onClick={handleSaveChanges}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={
                          saving ||
                          (!editData.firstName && !editData.lastName) ||
                          (editData.firstName === profile?.firstName &&
                            editData.lastName === profile?.lastName)
                        }
                        className="w-full sm:w-auto flex justify-center items-center p-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-500 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all"
                        title="Save Name"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          // Added text for mobile since icon alone might be confusing in a full-width button
                          <span className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            <span className="sm:hidden">Save Changes</span>
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-red-900/10 border border-red-500/50 rounded-lg p-4 sm:p-6 space-y-4"
              >
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deleting your account is permanent. All your data, XP, and
                  progress will be wiped out immediately.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full bg-red-600 text-white hover:bg-red-700 px-4 py-3 rounded-lg transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
