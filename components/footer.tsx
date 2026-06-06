import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-100 dark:border-neutral-800 bg-white/0 dark:bg-neutral-950/0">
      <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          © {year} SmartTravel. All rights reserved.
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-4 text-sm"
        >
          <a
            href="/about"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300"
          >
            About
          </a>
          <a
            href="/privacy"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300"
          >
            Terms
          </a>
          <a
            href="/contact"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
