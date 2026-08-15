"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandMenu } from "@/components/CommandMenu";
import { MenuIcon, CloseIcon, SearchIcon } from "@/components/icons";
import { ToolsNav } from "@/components/ToolsNav";
import { cn } from "@/lib/cn";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Global ⌘K / Ctrl+K, plus a custom event from in-page search buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onCustom = () => setSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("chrona:open-search", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("chrona:open-search", onCustom);
    };
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {siteConfig.primaryNav.map((item, i) => {
            const isHash = item.href.includes("#");
            const active = pathname === item.href.split("#")[0] && item.href !== "/";
            const showToolsBefore = i === siteConfig.primaryNav.length - 1;
            return (
              <Fragment key={item.href}>
                {showToolsBefore && <ToolsNav />}
                {isHash || item.href === "/" ? (
                  <a
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "text-ink" : "text-muted hover:text-ink"
                    )}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname.startsWith(item.href) ? "text-ink" : "text-muted hover:text-ink"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </Fragment>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
            aria-label="Search locations"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-line bg-surface px-1.5 text-[10px] font-medium text-faint sm:inline">
              ⌘K
            </kbd>
          </button>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-line bg-canvas md:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {siteConfig.primaryNav.map((item, i) => (
              <Fragment key={item.href}>
                {i === siteConfig.primaryNav.length - 1 && (
                  <>
                    <p className="mt-1 px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-faint">
                      Tools
                    </p>
                    {siteConfig.toolsNav.map((tool) => (
                      <a
                        key={tool.href}
                        href={tool.href}
                        className="rounded-md px-2 py-3 text-sm font-medium text-ink"
                      >
                        {tool.label}
                      </a>
                    ))}
                    <Link
                      href="/tools"
                      className="rounded-md px-2 py-3 text-sm text-accent hover:underline"
                    >
                      View all tools
                    </Link>
                  </>
                )}
                <a
                  href={item.href}
                  className="rounded-md px-2 py-3 text-sm font-medium text-ink"
                >
                  {item.label}
                </a>
              </Fragment>
            ))}
            <div className="mt-3 border-t border-line pt-3">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}

      <CommandMenu open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
