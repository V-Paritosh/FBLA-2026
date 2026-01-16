"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function StreakNotification() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "info">("info");

  // Ref to track if we have already shown the notification for this render cycle
  const hasShownRef = useRef(false);

  useEffect(() => {
    const msg = searchParams.get("streak_message");
    const typeParam = searchParams.get("streak_type");

    // Only proceed if there is a message AND we haven't processed it yet
    if (msg && !hasShownRef.current) {
      setMessage(msg);
      setType((typeParam as "success" | "info") || "info");
      setIsVisible(true);

      // Mark as shown so we don't re-trigger on re-renders
      hasShownRef.current = true;

      // 1. Clean the URL visually without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // 2. Set the timer to auto-hide
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`
              pointer-events-auto px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-3 min-w-[300px] justify-between
              ${
                type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
              }
            `}
          >
            <span>{message}</span>
            <button
              onClick={() => setIsVisible(false)}
              className="hover:opacity-70 transition-opacity p-1"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
