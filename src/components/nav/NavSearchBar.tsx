"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function NavSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <button
        className="pb-nav-search-btn"
        onClick={() => setOpen(true)}
        aria-label="Open search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open && (
        <div className="pb-search-overlay" onClick={() => setOpen(false)}>
          <div className="pb-search-overlay-box" onClick={(e) => e.stopPropagation()}>
            <form className="pb-search-overlay-form" onSubmit={handleSubmit}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pb-search-overlay-icon" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="pb-search-overlay-input"
                type="search"
                placeholder="Search articles, authors, topics…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search"
              />
              <button type="submit" className="pb-search-overlay-submit">
                Search
              </button>
            </form>
            <button className="pb-search-overlay-close" onClick={() => setOpen(false)} aria-label="Close search">
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
