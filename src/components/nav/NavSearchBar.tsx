"use client";

import { useState } from "react";

export function NavSearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="pb-nav-search">
      <div className="pb-nav-search-inner">
        <span className="pb-nav-search-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className="pb-nav-search-input"
          type="search"
          placeholder="Search articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
      </div>
    </div>
  );
}
