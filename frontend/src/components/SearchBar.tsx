import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { theme } from "../theme";

const TAG_CHIPS = [
  { label: "Ancient", tag: "ancient" },
  { label: "Medieval", tag: "medieval" },
  { label: "Early Modern", tag: "early_modern" },
  { label: "19th Century", tag: "19th_century" },
  { label: "Early 20th", tag: "early_20th" },
  { label: "Modern", tag: "modern" },
  { label: "Painting", tag: "painting" },
  { label: "Sculpture", tag: "sculpture" },
  { label: "Drawing", tag: "drawing" },
  { label: "Print", tag: "print" },
  { label: "Photography", tag: "photography" },
  { label: "Textile", tag: "textile" },
  { label: "Decorative", tag: "decorative" },
  { label: "Artifact", tag: "artifact" },
  { label: "European", tag: "european" },
  { label: "Asian", tag: "asian" },
  { label: "African & Oceanic", tag: "african_oceanic" },
  { label: "American", tag: "american" },
  { label: "Ancient Americas", tag: "ancient_americas" },
  { label: "Mediterranean & Islamic", tag: "ancient_mediterranean_islamic" },
  { label: "Global", tag: "modern_global" },
];

type SearchBarProps = {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
};

export function SearchBar({ onSearch, onClear, isSearching }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [showChips, setShowChips] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track whether pointer is inside the chip area so blur doesn't close it prematurely
  const chipsMouseDown = useRef(false);

  const submitQuery = (q: string) => {
    onSearch(q);
    setShowChips(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) submitQuery(value.trim());
    if (e.key === "Escape") handleClear();
  };

  const handleBlur = () => {
    // If the user clicked inside the chip list, don't close
    if (chipsMouseDown.current) return;
    setShowChips(false);
  };

  const handleChipClick = (tag: string) => {
    setValue(tag);
    setActiveTag(tag);
    submitQuery(tag);
  };

  const handleClear = () => {
    setValue("");
    setActiveTag(null);
    onClear();
    setShowChips(false);
  };

  const hasValue = value.trim().length > 0;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Input row */}
      <div style={{
        background: theme.components.badge.background,
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: showChips
          ? `1.5px solid ${theme.components.button.primaryBackground}`
          : `1.5px solid transparent`,
        transition: "border-color 0.15s",
      }}>
        <Search size={16} strokeWidth={2} color={theme.components.badge.mutedText} />

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowChips(true)}
          onBlur={handleBlur}
          placeholder="Search by title or tag…"
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.text,
          }}
        />

        {/* Clear button */}
        {(hasValue || isSearching) && (
          <button
            onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 2, display: "flex", alignItems: "center",
            }}
          >
            <X size={14} strokeWidth={2} color={theme.components.badge.mutedText} />
          </button>
        )}

        {/* Search button */}
        {hasValue && (
          <button
            onMouseDown={(e) => { e.preventDefault(); submitQuery(value.trim()); }}
            style={{
              background: theme.components.button.primaryBackground,
              color: theme.components.button.primaryText,
              border: "none", borderRadius: 5,
              padding: "4px 10px", fontSize: 12,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        )}
      </div>

      {/* Tag chips — only shown when input is focused */}
      {showChips && (
        <div
          onMouseDown={() => { chipsMouseDown.current = true; }}
          onMouseUp={() => { chipsMouseDown.current = false; }}
          style={{
            display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8,
            padding: "8px 4px",
            background: theme.components.badge.background,
            borderRadius: 8,
          }}
        >
          {TAG_CHIPS.map(({ label, tag }) => {
            const isActive = activeTag === tag && isSearching;
            return (
              <button
                key={tag}
                onMouseDown={(e) => { e.preventDefault(); handleChipClick(tag); }}
                style={{
                  background: isActive
                    ? theme.components.button.primaryBackground
                    : theme.colors.white,
                  color: isActive
                    ? theme.components.button.primaryText
                    : theme.components.badge.mutedText,
                  border: `1px solid ${theme.components.divider.color}`,
                  borderRadius: 20,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
