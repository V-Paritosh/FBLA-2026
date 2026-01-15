"use client";

import type React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import {
  Calendar as CalendarIcon,
  Users,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  User,
  MapPin,
  Video,
  ExternalLink,
  Edit2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Interface ---
interface Session {
  _id: string;
  subject: string;
  description: string;
  host_user_id: string;
  hostName?: string;
  date: string;
  location?: string;
  meeting_link?: string;
  attendee_ids: string[];
}

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [notifications, setNotifications] = useState<
    { id: string; message: string; type: "success" | "info" | "error" }[]
  >([]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // --- Fetch Data ---
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sessions");
      const data = await response.json();

      if (data.sessions) {
        setSessions(data.sessions);
        setCurrentUserId(data.currentUserId);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // --- Actions ---
  const handleJoinToggle = async (session: Session) => {
    if (!currentUserId) return;

    // Prevent joining if session is in the past
    if (new Date(session.date) < new Date()) {
      addNotification("This session has already ended.", "error");
      return;
    }

    const isJoined = session.attendee_ids.includes(currentUserId);
    const action = isJoined ? "leave" : "join";

    // Optimistic Update
    setSessions((prev) =>
      prev.map((s) => {
        if (s._id === session._id) {
          return {
            ...s,
            attendee_ids: isJoined
              ? s.attendee_ids.filter((id) => id !== currentUserId)
              : [...s.attendee_ids, currentUserId],
          };
        }
        return s;
      })
    );

    try {
      const response = await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session._id, action }),
      });

      if (response.ok) {
        addNotification(
          isJoined ? "Left session" : "Joined session!",
          isJoined ? "info" : "success"
        );
      } else {
        fetchSessions();
        addNotification("Failed to update attendance", "error");
      }
    } catch (error) {
      fetchSessions();
      addNotification("Network error", "error");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;

    try {
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        addNotification("Session cancelled", "success");
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      } else {
        addNotification("Failed to delete", "error");
      }
    } catch (error) {
      addNotification("Error deleting", "error");
    }
  };

  const openNewSessionModal = () => {
    setEditingSession(null);
    setShowModal(true);
  };

  const openEditSessionModal = (session: Session) => {
    setEditingSession(session);
    setShowModal(true);
  };

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

  // --- Filtering ---
  const filteredSessions = useMemo(() => {
    let result = sessions;

    // Filter logic:
    // If a specific date is selected on calendar -> Show ALL sessions for that day (even past ones)
    // If NO date selected -> Show sessions from today onwards (hiding yesterday completely)

    if (selectedDate) {
      result = result.filter((s) => isSameDay(new Date(s.date), selectedDate));
    } else {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      result = result.filter((s) => new Date(s.date) >= todayStart);
    }

    // Sort strictly by time (Earliest first)
    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [sessions, selectedDate]);

  // --- Calendar Helpers ---
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  const daysInMonth = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const firstDay = getFirstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const sessionDates = useMemo(() => {
    const dates = new Set<string>();
    sessions.forEach((s) => {
      const d = new Date(s.date);
      dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return dates;
  }, [sessions]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="h-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Study Schedule
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your upcoming tutoring sessions
                  </p>
                </div>
                <motion.button
                  onClick={openNewSessionModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Host Session
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* CALENDAR */}
                <div className="lg:col-span-4 sticky top-0">
                  <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold text-lg">
                        {currentDate.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <div className="flex gap-1">
                        <button
                          onClick={prevMonth}
                          className="p-2 hover:bg-muted rounded-full"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextMonth}
                          className="p-2 hover:bg-muted rounded-full"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 mb-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        );
                        const isSelected =
                          selectedDate && isSameDay(dateObj, selectedDate);
                        const isToday = isSameDay(dateObj, new Date());
                        const hasSession = sessionDates.has(
                          `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`
                        );
                        return (
                          <motion.button
                            key={day}
                            onClick={() =>
                              setSelectedDate(isSelected ? null : dateObj)
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                              ${
                                isSelected
                                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                                  : "hover:bg-muted text-foreground"
                              }
                              ${
                                isToday && !isSelected
                                  ? "border-2 border-primary text-primary font-bold"
                                  : ""
                              }
                            `}
                          >
                            {day}
                            {hasSession && !isSelected && (
                              <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SESSIONS LIST */}
                <div className="lg:col-span-8 space-y-6">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredSessions.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {filteredSessions.map((session, index) => {
                          const isJoined = currentUserId
                            ? session.attendee_ids.includes(currentUserId)
                            : false;
                          const isOwner =
                            currentUserId === session.host_user_id;

                          // --- Logic for Past Sessions ---
                          const sessionDate = new Date(session.date);
                          const now = new Date();
                          const isPast = sessionDate < now;
                          // -------------------------------

                          return (
                            <motion.div
                              key={session._id}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                              }}
                              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300
                ${
                  isPast
                    ? "opacity-60 grayscale bg-muted/20 border-border"
                    : isJoined
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card hover:bg-card/80 border-border hover:border-primary/30 shadow-sm hover:shadow-md"
                }
              `}
                            >
                              <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                                {/* Time Column */}
                                <div className="flex sm:flex-col items-center sm:items-start text-muted-foreground sm:w-24 sm:border-r border-border/50 sm:pr-4 gap-2 sm:gap-0">
                                  <span className="text-2xl font-bold text-foreground">
                                    {sessionDate.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </span>
                                  <span className="text-xs uppercase tracking-wider font-medium">
                                    {sessionDate
                                      .toLocaleTimeString([], { hour12: true })
                                      .slice(-2)}
                                  </span>

                                  {/* Show "ENDED" Badge if past */}
                                  {isPast && (
                                    <span className="sm:mt-2 px-2 py-0.5 bg-muted text-muted-foreground text-[10px] uppercase font-bold rounded">
                                      Ended
                                    </span>
                                  )}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            isOwner
                                              ? "bg-primary/10 text-primary"
                                              : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          <User className="w-3 h-3" />
                                          {isOwner
                                            ? "Hosted by You"
                                            : `Hosted by ${
                                                session.hostName || "Unknown"
                                              }`}
                                        </span>
                                      </div>

                                      <h3
                                        className={`font-bold text-lg truncate ${
                                          isJoined && !isPast
                                            ? "text-primary"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {session.subject}
                                      </h3>
                                      <p className="text-muted-foreground text-sm line-clamp-2">
                                        {session.description}
                                      </p>
                                    </div>
                                    {isJoined && (
                                      <span className="shrink-0 bg-green-500/10 text-green-600 p-1.5 rounded-full">
                                        <Check className="w-5 h-5" />
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                      <CalendarIcon className="w-4 h-4" />
                                      {sessionDate.toLocaleDateString()}
                                    </div>
                                    {session.location && (
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {session.location}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                      <Users className="w-4 h-4" />
                                      {session.attendee_ids.length} Joined
                                    </div>
                                  </div>

                                  {(isJoined || isOwner) &&
                                    session.meeting_link &&
                                    !isPast && (
                                      <div className="mt-3">
                                        <a
                                          href={
                                            session.meeting_link.startsWith(
                                              "http"
                                            )
                                              ? session.meeting_link
                                              : `https://${session.meeting_link}`
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 hover:underline font-medium transition-colors"
                                        >
                                          <Video className="w-4 h-4" /> Join
                                          Meeting{" "}
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center sm:self-center gap-2">
                                  {isOwner ? (
                                    <>
                                      <motion.button
                                        onClick={() =>
                                          openEditSessionModal(session)
                                        }
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-3 py-2.5 rounded-xl font-semibold text-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                      >
                                        <Edit2 className="w-5 h-5" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          handleDeleteSession(session._id)
                                        }
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-3 py-2.5 rounded-xl font-semibold text-sm border border-red-200 text-red-500 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </motion.button>
                                    </>
                                  ) : (
                                    <motion.button
                                      onClick={() => handleJoinToggle(session)}
                                      disabled={isPast}
                                      whileHover={
                                        !isPast ? { scale: 1.05 } : {}
                                      }
                                      whileTap={!isPast ? { scale: 0.95 } : {}}
                                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors w-full sm:w-auto 
                        ${
                          isPast
                            ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                            : isJoined
                            ? "bg-background border border-input hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                        }`}
                                    >
                                      {isPast
                                        ? "Ended"
                                        : isJoined
                                        ? "Leave"
                                        : "Join"}
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // --- THIS IS THE RESTORED SECTION ---
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card/30"
                    >
                      <div className="bg-muted rounded-full p-4 mb-4">
                        <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        No sessions found
                      </h3>
                      <p className="text-muted-foreground max-w-xs mb-4">
                        There are no sessions scheduled for this date. Try
                        selecting another date or host your own!
                      </p>
                      <button
                        onClick={openNewSessionModal}
                        className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                      >
                        Schedule a Session
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications & Modal Render logic remains same, ensure SessionModal is included below */}
      <AnimatePresence>
        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
              notif.type === "error"
                ? "bg-red-50 border-red-200 text-red-600"
                : notif.type === "success"
                ? "bg-background border-green-500/20 text-green-600"
                : "bg-background border-blue-500/20 text-blue-600"
            }`}
            style={{ marginBottom: `${idx * 70}px` }}
          >
            <span className="font-medium">{notif.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <SessionModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchSessions}
            initialData={editingSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionModal({
  onClose,
  onSuccess,
  initialData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  initialData: Session | null;
}) {
  const isEditing = !!initialData;
  const parseDate = (d: string) => new Date(d).toISOString().split("T")[0];
  const parseTime = (d: string) => new Date(d).toTimeString().slice(0, 5);

  const [subject, setSubject] = useState(initialData?.subject || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [date, setDate] = useState(
    initialData ? parseDate(initialData.date) : ""
  );
  const [time, setTime] = useState(
    initialData ? parseTime(initialData.date) : ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [meetingLink, setMeetingLink] = useState(
    initialData?.meeting_link || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = "/api/sessions";
      const method = isEditing ? "PUT" : "POST";
      const body = {
        id: initialData?._id,
        subject,
        description,
        date: `${date}T${time}`,
        location,
        meeting_link: meetingLink,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to save session");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl border border-border shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Session" : "Host New Session"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Calculus 101"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Library Room 4"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Meeting Link</label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-muted/30 focus:bg-background outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Zoom / Google Meet URL"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Create Session"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
