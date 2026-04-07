import { useEffect, useState } from "react";
import { Heart, Pin } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { getExhibitSections } from "../new_data";
import { theme } from "../theme";
import type { ExhibitSection, ForYouItem } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001/api";

const PINNED_SECTIONS_KEY = "tigerart_pinned_sections";

type ExploreScreenProps = {
  onSectionClick: (section: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

const styles = {
  page: {
    padding: "16px 20px 100px",
    overflowY: "auto" as const,
    height: "100%",
  },
  title: {
    margin: "0 0 20px",
    fontSize: 22,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: theme.components.badge.text,
    background: theme.components.badge.background,
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 4,
  },
  pinnedLabel: {
    margin: "0 0 12px",
    fontSize: 11,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: theme.components.badge.mutedText,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  divider: {
    border: "none",
    borderTop: `1px solid ${theme.components.card.border}`,
    margin: "20px 0",
  },
  sectionBlock: { marginBottom: 28 },
  sectionHeader: {
    background: theme.components.badge.background,
    borderRadius: 4,
    padding: "8px 12px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    color: theme.components.badge.text,
    marginBottom: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  pinButton: {
    background: "none",
    border: "none",
    padding: "2px 4px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 4,
    marginLeft: 2,
    opacity: 0.55,
    transition: "opacity 0.15s",
  },
  sectionRow: {
    display: "flex",
    gap: 10,
    overflowX: "auto" as const,
    paddingBottom: 4,
    scrollbarWidth: "thin" as const,
  },
  cardInner: { width: 150, flex: "0 0 auto" as const, cursor: "pointer" },
  image: {
    width: "100%",
    aspectRatio: "3 / 4",
    objectFit: "cover" as const,
    borderRadius: 8,
    display: "block",
  },
  cardTextWrap: { paddingTop: 6 },
  itemName: {
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    color: theme.components.badge.text,
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    color: theme.components.badge.mutedText,
  },
} as const;

function SearchResultCard({
  item,
  favorites,
  onToggleFavorite,
}: {
  item: ForYouItem;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${theme.components.card.border}`,
        borderRadius: 8,
        overflow: "hidden",
        background: theme.components.card.background,
      }}
    >
      <div style={{ position: "relative" }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{
              width: "100%",
              aspectRatio: "4 / 3",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Placeholder
            label="Unable to Render Image"
            aspectRatio="4/3"
            style={{ borderRadius: 0 }}
          />
        )}
        <button
          onClick={() => onToggleFavorite(item.id)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Heart
            size={16}
            strokeWidth={2.2}
            color={
              favorites.includes(item.id)
                ? theme.components.favorite.active
                : "#fff"
            }
            fill={
              favorites.includes(item.id)
                ? theme.components.favorite.active
                : "none"
            }
          />
        </button>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: theme.components.badge.text,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {item.title}
        </span>
        <div
          style={{
            background: theme.components.badge.background,
            borderRadius: 4,
            padding: "6px 10px",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText,
            marginTop: 6,
          }}
        >
          {item.about}
        </div>
      </div>
    </div>
  );
}

function ExploreSectionCard({
  section,
  onSectionClick,
  favorites,
  onToggleFavorite,
  isPinned,
  onTogglePin,
}: {
  section: ExhibitSection;
  onSectionClick: (s: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  isPinned: boolean;
  onTogglePin: (name: string) => void;
}) {
  const [pinHovered, setPinHovered] = useState(false);

  return (
    <div style={styles.sectionBlock}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        {/* Pin/unpin toggle button — sits to the LEFT of the badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(section.name);
          }}
          onMouseEnter={() => setPinHovered(true)}
          onMouseLeave={() => setPinHovered(false)}
          title={isPinned ? "Unpin section" : "Pin to top"}
          style={{
            ...styles.pinButton,
            opacity: isPinned || pinHovered ? 1 : 0.35,
            marginLeft: 0,
            marginRight: 6,
            color: theme.components.badge.text,
          }}
        >
          <Pin
            size={15}
            strokeWidth={2}
            color={theme.components.badge.text}
            fill={isPinned ? theme.components.badge.text : "none"}
          />
        </button>

        {/* Section name badge — identical style whether pinned or not */}
        <div
          style={{ ...styles.sectionHeader, marginBottom: 0 }}
          onClick={() => onSectionClick(section)}
        >
          {section.name}
        </div>
      </div>

      <div style={styles.sectionRow}>
        {section.items.map((item) => (
          <div
            key={item.id}
            style={styles.cardInner}
            onClick={() => onSectionClick(section)}
          >
            <div style={{ position: "relative" }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={styles.image} />
              ) : (
                <Placeholder label="Unable to Render Image" aspectRatio="3/4" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(4px)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Heart
                  size={16}
                  strokeWidth={2.2}
                  color={
                    favorites.includes(item.id)
                      ? theme.components.favorite.active
                      : "#fff"
                  }
                  fill={
                    favorites.includes(item.id)
                      ? theme.components.favorite.active
                      : "none"
                  }
                />
              </button>
            </div>
            <div style={styles.cardTextWrap}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemDesc}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExploreScreen({
  onSectionClick,
  favorites,
  onToggleFavorite,
}: ExploreScreenProps) {
  const [sections, setSections] = useState<ExhibitSection[]>([]);
  const [searchResults, setSearchResults] = useState<ForYouItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pinnedSections, setPinnedSections] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(PINNED_SECTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getExhibitSections()
      .then((data) => setSections(data))
      .catch((e) => console.error("Error fetching sections:", e));
  }, []);

  const handleTogglePin = (sectionName: string) => {
    setPinnedSections((prev) => {
      const updated = prev.includes(sectionName)
        ? prev.filter((n) => n !== sectionName)
        : [...prev, sectionName];
      try {
        localStorage.setItem(PINNED_SECTIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSearch = (query: string) => {
    setSearchLoading(true);
    fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data: ForYouItem[]) => {
        setSearchResults(data);
        setSearchLoading(false);
      })
      .catch(() => setSearchLoading(false));
  };

  const handleClear = () => setSearchResults(null);
  const isSearching = searchResults !== null;

  // Split sections into pinned and unpinned, preserving pin order
  const pinnedList = pinnedSections
    .map((name) => sections.find((s) => s.name === name))
    .filter((s): s is ExhibitSection => Boolean(s));

  const unpinnedList = sections.filter((s) => !pinnedSections.includes(s.name));

  const sharedCardProps = (section: ExhibitSection) => ({
    section,
    onSectionClick,
    favorites,
    onToggleFavorite,
    isPinned: pinnedSections.includes(section.name),
    onTogglePin: handleTogglePin,
  });

  return (
    <div style={styles.page}>
      <SearchBar
        onSearch={handleSearch}
        onClear={handleClear}
        isSearching={isSearching}
      />
      <h1 style={styles.title}>{isSearching ? "SEARCH RESULTS" : "EXPLORE"}</h1>

      {searchLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText,
            fontSize: 14,
          }}
        >
          Searching…
        </div>
      )}

      {isSearching && !searchLoading && searchResults!.length === 0 && (
        <div
          style={{
            background: theme.components.badge.background,
            borderRadius: 8,
            padding: "24px 20px",
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontWeight: 600,
              color: theme.components.badge.text,
            }}
          >
            No results found
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: theme.components.badge.mutedText,
            }}
          >
            Try a different keyword or tag
          </p>
        </div>
      )}

      {isSearching && !searchLoading && searchResults!.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.mutedText,
            }}
          >
            {searchResults!.length} result
            {searchResults!.length !== 1 ? "s" : ""} found
          </p>
          {searchResults!.map((item) => (
            <SearchResultCard
              key={item.id}
              item={item}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {!isSearching && (
        <>
          {/* ── Pinned sections ── */}
          {pinnedList.length > 0 && (
            <>
              <div style={styles.pinnedLabel}>
                <Pin size={11} strokeWidth={2.5} />
                Pinned
              </div>
              {pinnedList.map((section) => (
                <ExploreSectionCard
                  key={section.name}
                  {...sharedCardProps(section)}
                />
              ))}
              <hr style={styles.divider} />
            </>
          )}

          {/* ── Remaining sections ── */}
          {unpinnedList.map((section) => (
            <ExploreSectionCard
              key={section.name}
              {...sharedCardProps(section)}
            />
          ))}
        </>
      )}
    </div>
  );
}
