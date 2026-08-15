"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Accessible "Tools" dropdown for the desktop header. Opens on click, closes on
 * outside-click / Escape / navigation, and is keyboard reachable (Enter/Space
 * toggle; Tab moves focus into the panel).
 */
export function ToolsNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          open || pathname.startsWith("/timer") || pathname.startsWith("/stopwatch") || pathname.startsWith("/calendar") || pathname.startsWith("/tools")
            ? "text-ink"
            : "text-muted hover:text-ink"
        )}
      >
        Tools
        <ChevronDownIcon className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-30 cursor-default"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-soft"
          >
            {siteConfig.toolsNav.map((tool) => (
              <Link
                key={tool.href}
                role="menuitem"
                href={tool.href}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span className="block text-sm font-medium text-ink">{tool.label}</span>
                <span className="block text-xs text-muted">{tool.desc}</span>
              </Link>
            ))}
            <Link
              role="menuitem"
              href="/tools"
              className="mt-1 block border-t border-line px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-surface-2"
            >
              View all tools
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
