import { useRef, useState } from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { theme } from "../theme";

// ── Filter tag definitions grouped by category ───────────────────────────────
const FILTER_GROUPS = [
  {
    label: "Period",
    tags: [
      { label: "Ancient", tag: "ancient" },
      { label: "Medieval", tag: "medieval" },
      { label: "Early Modern", tag: "early_modern" },
      { label: "19th Century", tag: "19th_century" },
      { label: "Early 20th", tag: "early_20th" },
      { label: "Modern", tag: "modern" },
    ],
  },
  {
    label: "Classification",
    tags: [
      { label: "Painting", tag: "painting" },
      { label: "Sculpture", tag: "sculpture" },
      { label: "Drawing", tag: "drawing" },
      { label: "Print", tag: "print" },
      { label: "Photography", tag: "photography" },
      { label: "Textile", tag: "textile" },
      { label: "Decorative", tag: "decorative" },
      { label: "Artifact", tag: "artifact" },
    ],
  },
  {
    label: "Geography",
    tags: [
      { label: "European", tag: "european" },
      { label: "Asian", tag: "asian" },
      { label: "African & Oceanic", tag: "african_oceanic" },
      { label: "American", tag: "american" },
      { label: "Ancient Americas", tag: "ancient_americas" },
      { label: "Mediterranean & Islamic", tag: "ancient_mediterranean_islamic" },
      { label: "Global", tag: "modern_global" },
    ],
  },
];

export type SortOption = "recency" | "az" | "za";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recency", label: "Recently Liked" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

// ── Props ─────────────────────────────────────────────────────────────────────
type SearchFilterBarProps = {
  // Search
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  placeholder?: string;
  // Filter
  activeFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  // Sort (optional — only shown when provided)
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────
export function SearchFilterBar({
  onSearch,
  onClear,
  isSearching,
  placeholder = "Search by title or tag…",
  activeFilters,
  onFiltersChange,
  sortBy,
  onSortChange,
}: SearchFilterBarProps) {
  const [value, setValue] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterMouseDown = useRef(false);
  const sortMouseDown = useRef(false);

  const submitQuery = (q: string) => {
    onSearch(q);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) submitQuery(value.trim());
    if (e.key === "Escape") handleClear();
  };

  const handleClear = () => {
    setValue("");
    onClear();
  };

  const toggleFilter = (tag: string) => {
    onFiltersChange(
      activeFilters.includes(tag)
        ? activeFilters.filter((t) => t !== tag)
        : [...activeFilters, tag]
    );
  };

  const clearFilters = () => onFiltersChange([]);

  const hasValue = value.trim().length > 0;
  const filterCount = activeFilters.length;
  const showSortBtn = sortBy !== undefined && onSortChange !== undefined;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "#fafaf8",
      paddingBottom: 8,
      marginBottom: 8,
    }}>
      {/* ── Main row: search input + filter btn + optional sort btn ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

        {/* Search input */}
        <div style={{
          flex: 1,
          background: theme.components.badge.background,
          borderRadius: 8,
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `1.5px solid transparent`,
          transition: "border-color 0.15s",
        }}>
          <Search size={15} strokeWidth={2} color={theme.components.badge.mutedText} />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.text,
            }}
          />
          {(hasValue || isSearching) && (
            <button
              onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                padding: 2, display: "flex", alignItems: "center" }}>
              <X size={13} strokeWidth={2} color={theme.components.badge.mutedText} />
            </button>
          )}
          {hasValue && (
            <button
              onMouseDown={(e) => { e.preventDefault(); submitQuery(value.trim()); }}
              style={{
                background: theme.components.button.primaryBackground,
                color: theme.components.button.primaryText,
                border: "none", borderRadius: 5, padding: "3px 9px",
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
              }}>
              Search
            </button>
          )}
        </div>

        {/* Filter button */}
        <div style={{ position: "relative" }}>
          <button
            onMouseDown={() => { filterMouseDown.current = true; }}
            onMouseUp={() => { filterMouseDown.current = false; }}
            onClick={() => { setShowFilter((v) => !v); setShowSort(false); }}
            style={{
              background: filterCount > 0
                ? theme.components.button.primaryBackground
                : theme.components.badge.background,
              color: filterCount > 0
                ? theme.components.button.primaryText
                : theme.components.badge.mutedText,
              border: "none", borderRadius: 8,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, position: "relative",
            }}>
            <SlidersHorizontal size={16} strokeWidth={2} />
            {filterCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                background: theme.colors.danger,
                color: "#fff", borderRadius: "50%",
                width: 16, height: 16, fontSize: 9,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              }}>
                {filterCount}
              </span>
            )}
          </button>

          {/* Filter dropdown */}
          {showFilter && (
            <div
              onMouseDown={() => { filterMouseDown.current = true; }}
              onMouseUp={() => { filterMouseDown.current = false; }}
              style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                background: theme.components.card.background,
                border: `1px solid ${theme.components.card.border}`,
                borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                zIndex: 100, width: 240, maxHeight: 360, overflowY: "auto",
                padding: "12px 0",
              }}>
              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px 10px",
                borderBottom: `1px solid ${theme.components.divider.color}`,
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  color: theme.components.badge.text, letterSpacing: "0.04em" }}>
                  FILTER BY
                </span>
                {filterCount > 0 && (
                  <button onClick={clearFilters} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                    color: theme.components.button.primaryBackground, padding: 0,
                  }}>
                    Clear all
                  </button>
                )}
              </div>

              {/* Groups */}
              {FILTER_GROUPS.map((group) => (
                <div key={group.label} style={{ padding: "0 14px 12px" }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                    fontFamily: "'DM Sans', sans-serif",
                    color: theme.components.badge.mutedText,
                    marginBottom: 8, textTransform: "uppercase",
                  }}>
                    {group.label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {group.tags.map(({ label, tag }) => {
                      const isActive = activeFilters.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleFilter(tag)}
                          style={{
                            background: isActive
                              ? theme.components.button.primaryBackground
                              : theme.components.badge.background,
                            color: isActive
                              ? theme.components.button.primaryText
                              : theme.components.badge.mutedText,
                            border: `1px solid ${isActive
                              ? theme.components.button.primaryBackground
                              : theme.components.divider.color}`,
                            borderRadius: 20, padding: "4px 10px",
                            fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                            cursor: "pointer", whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Apply button */}
              <div style={{ padding: "8px 14px 0",
                borderTop: `1px solid ${theme.components.divider.color}` }}>
                <button
                  onClick={() => setShowFilter(false)}
                  style={{
                    width: "100%",
                    background: theme.components.button.primaryBackground,
                    color: theme.components.button.primaryText,
                    border: "none", borderRadius: 6, padding: "9px 0",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                  }}>
                  Apply{filterCount > 0 ? ` (${filterCount})` : ""}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort button — only rendered when sortBy prop is provided */}
        {showSortBtn && (
          <div style={{ position: "relative" }}>
            <button
              onMouseDown={() => { sortMouseDown.current = true; }}
              onMouseUp={() => { sortMouseDown.current = false; }}
              onClick={() => { setShowSort((v) => !v); setShowFilter(false); }}
              style={{
                background: theme.components.badge.background,
                color: theme.components.badge.mutedText,
                border: "none", borderRadius: 8,
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}>
              <ArrowUpDown size={16} strokeWidth={2} />
            </button>

            {/* Sort dropdown */}
            {showSort && (
              <div
                onMouseDown={() => { sortMouseDown.current = true; }}
                onMouseUp={() => { sortMouseDown.current = false; }}
                style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: theme.components.card.background,
                  border: `1px solid ${theme.components.card.border}`,
                  borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  zIndex: 100, minWidth: 160, overflow: "hidden",
                }}>
                <div style={{ padding: "10px 14px 8px", fontSize: 10,
                  fontWeight: 700, letterSpacing: "0.06em",
                  fontFamily: "'DM Sans', sans-serif",
                  color: theme.components.badge.mutedText,
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${theme.components.divider.color}`,
                  marginBottom: 4 }}>
                  SORT BY
                </div>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { onSortChange!(option.value); setShowSort(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "10px 14px", border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                      background: sortBy === option.value
                        ? theme.components.badge.background
                        : theme.components.card.background,
                      color: sortBy === option.value
                        ? theme.components.badge.text
                        : theme.components.badge.mutedText,
                      fontWeight: sortBy === option.value ? 600 : 400,
                    }}>
                    {option.value === sortBy ? "✓ " : ""}{option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filter chips shown below the row when filters are applied */}
      {filterCount > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
          {activeFilters.map((tag) => {
            const label = FILTER_GROUPS.flatMap((g) => g.tags)
              .find((t) => t.tag === tag)?.label ?? tag;
            return (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                style={{
                  background: theme.components.button.primaryBackground,
                  color: theme.components.button.primaryText,
                  border: "none", borderRadius: 20,
                  padding: "3px 10px 3px 10px", fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                }}>
                {label}
                <X size={10} strokeWidth={2.5} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
