"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { search, type SearchResult } from "@/lib/search";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { useNow } from "@/hooks/useClock";
import { formatInZone, getOffsetLabel } from "@/lib/time";
import { cn } from "@/lib/cn";

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
}

const GROUP_ORDER: SearchResult["group"][] = ["Cities", "Countries", "Time zones"];

export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => search(query, 9), [query]);

  // Reset state whenever the dialog opens/closes.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  // Keep active index in range as results change.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const choose = (result?: SearchResult) => {
    const target = result ?? results[active];
    if (!target) return;
    onClose();
    router.push(target.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[16vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search locations"
    >
      <button
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px] animate-fade-in"
        aria-label="Close search"
        onClick={onClose}
        tabIndex={-1}
      />
      <div className="animate-pop-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <label htmlFor="chrona-search" className="sr-only">
            Search for a city, country or time zone
          </label>
          <input
            id="chrona-search"
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search a city, country or time zone…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
            role="combobox"
            aria-expanded="true"
            aria-controls="chrona-search-results"
            aria-autocomplete="list"
            aria-activedescendant={results[active] ? `result-${active}` : undefined}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="text-faint hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="hidden rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-ink sm:block"
          >
            Esc
          </button>
        </div>

        {/* Results (mounts only while open → single live timer while searching) */}
        <SearchResults
          query={query}
          results={results}
          active={active}
          onHover={setActive}
          onChoose={choose}
        />

        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[11px] text-faint">
          <span>Live current time shown for each place</span>
          <span className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function SearchResults({
  query,
  results,
  active,
  onHover,
  onChoose,
}: {
  query: string;
  results: SearchResult[];
  active: number;
  onHover: (i: number) => void;
  onChoose: (r: SearchResult) => void;
}) {
  const now = useNow();
  const date = now ? new Date(now) : null;

  return (
    <ul id="chrona-search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
      {results.length === 0 ? (
        <li className="px-3 py-10 text-center text-sm text-muted">
          {query.trim() === "" ? (
            "Start typing to search the world."
          ) : (
            <>
              No results for <span className="text-ink">“{query}”</span>
            </>
          )}
        </li>
      ) : (
        GROUP_ORDER.map((group) => {
          const groupResults = results.filter((r) => r.group === group);
          if (groupResults.length === 0) return null;
          return (
            <li key={group} role="presentation">
              <div className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-faint">
                {group}
              </div>
              <ul>
                {groupResults.map((result) => {
                  const idx = results.indexOf(result);
                  const isActive = idx === active;
                  return (
                    <li key={result.id} role="presentation">
                      <button
                        id={`result-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => onHover(idx)}
                        onClick={() => onChoose(result)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
                          isActive ? "bg-surface-2" : ""
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink">{result.label}</span>
                          <span className="block truncate text-xs text-muted">
                            <span className="font-semibold uppercase tracking-wide text-faint">
                              {result.entity}
                            </span>
                            {result.meta ? <> · {result.meta}</> : null}
                          </span>
                        </span>
                        {result.timeZone && date ? (
                          <span className="shrink-0 text-right">
                            <span
                              className="tabular block text-sm font-semibold text-ink"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {formatInZone(date, result.timeZone, {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </span>
                            <span className="block text-[10px] text-faint">
                              {getOffsetLabel(result.timeZone, date)}
                            </span>
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })
      )}
    </ul>
  );
}
