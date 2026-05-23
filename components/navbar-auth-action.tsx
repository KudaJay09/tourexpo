"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NavbarButton } from "@/components/ui/resizable-navbar";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

function getUserInitials(displayName?: string | null) {
  const trimmedName = displayName?.trim();

  if (!trimmedName) {
    return "U";
  }

  const initials = trimmedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "U";
}

type NavbarAuthActionProps = {
  fullWidth?: boolean;
  onActionClick?: () => void;
};

export function NavbarAuthAction({
  fullWidth = false,
  onActionClick,
}: NavbarAuthActionProps) {
  const { user } = useAuth();
  const displayName = user?.displayName?.trim() || user?.email || "Guest";
  const initials = getUserInitials(user?.displayName || user?.email);

  const [showLabel, setShowLabel] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (fullWidth) {
      setShowLabel(true);
      return;
    }

    setShowLabel(true);
    const id = window.setTimeout(() => setShowLabel(false), 3000);
    return () => clearTimeout(id);
  }, [user, fullWidth]);

  if (!user) {
    return (
      <NavbarButton
        variant="primary"
        href="/auth/sign-in"
        onClick={onActionClick}
        className={cn(fullWidth && "w-full")}
      >
        Login
      </NavbarButton>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onActionClick}
      layout
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        duration: 1,
      }}
      className={cn(
        "flex items-center gap-3 rounded-full border border-neutral-200 bg-white/90 px-1 py-1 text-left shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05)] dark:border-neutral-800 dark:bg-neutral-950/90",
        fullWidth && "w-full",
      )}
      aria-label={displayName}
    >
      <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-cyan-600 text-sm font-semibold text-white">
        {initials}
      </div>

      <AnimatePresence>
        {showLabel && (
          <motion.div
            key="auth-label"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col leading-tight text-left"
            layout
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
              Welcome
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {displayName}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
