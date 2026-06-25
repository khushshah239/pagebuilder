// Presentational prop contracts for AuthorPage organisms; all values pre-resolved.

// ─── AuthorProfileHeader ─────────────────────────────────────────────────────
export interface AuthorProfileHeaderProps {
  identifier: string;
  author_name?: string;
  avatar?: string;
  bio?: string;
}
