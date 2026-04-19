import { useEffect, useState } from "react";
import { Heart, Pin, ArrowRight } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { itemMatchesFilters } from "../utils/filterUtils";
import { ArtworkModal } from "../components/ArtworkModal";
import { getExhibitSections } from "../new_data";
import { theme } from "../theme";
import type { ExhibitSection, ExhibitItem, ForYouItem } from "../types";
import { useMemo } from "react";

const PINNED_SECTIONS_KEY = "tigerart_pinned_sections";
const API_BASE = "/api";

type ExploreScreenProps = {
  userId: string | null;
  onSectionClick: (section: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onRecordView: (id: number) => void;
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

const heartButtonStyle = {
  position: "absolute" as const,
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
};

function ViewMoreCard({
  section,
  onSectionClick,
}: {
  section: ExhibitSection;
  onSectionClick: (s: ExhibitSection) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={styles.cardInner}
      onClick={() => onSectionClick(section)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          borderRadius: 8,
          background: hovered
            ? theme.components.badge.text
            : theme.components.badge.background,
          border: `2px solid ${theme.components.card.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "background 0.2s, border-color 0.2s",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            color: hovered ? "#fff" : theme.components.badge.text,
            textAlign: "center",
            letterSpacing: "0.03em",
            lineHeight: 1.4,
            padding: "0 12px",
            transition: "color 0.2s",
          }}
        >
          Click here to view more
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: hovered
              ? "rgba(255,255,255,0.2)"
              : theme.components.card.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s, transform 0.2s",
            transform: hovered ? "translateX(3px)" : "none",
          }}
        >
          <ArrowRight
            size={16}
            strokeWidth={2.2}
            color={hovered ? "#fff" : theme.components.badge.text}
          />
        </div>
      </div>
      <div style={styles.cardTextWrap}>
        <div
          style={{
            ...styles.itemName,
            color: hovered
              ? theme.components.badge.text
              : theme.components.badge.mutedText,
            fontSize: 12,
            transition: "color 0.2s",
          }}
        >
          See all in {section.name}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({
  item,
  favorites,
  onToggleFavorite,
  onCardClick,
}: {
  item: ForYouItem;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onCardClick: (item: ForYouItem) => void;
}) {
  return (
    <div
      data-tour-track="view"
      data-tour-art-id={String(item.id)}
      onClick={() => onCardClick(item)}
      style={{
        border: `1px solid ${theme.components.card.border}`,
        borderRadius: 8,
        overflow: "hidden",
        background: theme.components.card.background,
        cursor: "pointer",
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
          data-tour-track="favorite"
          data-tour-art-id={String(item.id)}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          style={heartButtonStyle}
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
  onCardClick,
  isFirst,
}: {
  section: ExhibitSection;
  onSectionClick: (s: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  isPinned: boolean;
  onTogglePin: (name: string) => void;
  onCardClick: (item: ExhibitItem) => void;
  isFirst: boolean;
}) {
  const [pinHovered, setPinHovered] = useState(false);
  const [sectionHovered, setSectionHovered] = useState(false);

  return (
    <div style={styles.sectionBlock}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        {/* ── Tour target: pin button (first section only) ── */}
        <button
          {...(isFirst ? { "data-tour": "pin-btn" } : {})}
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

        {/* ── Tour target: section heading (first section only) ── */}
        <div
          {...(isFirst ? { "data-tour": "section-heading" } : {})}
          style={{
            ...styles.sectionHeader,
            marginBottom: 0,
            color: sectionHovered ? "#fff" : theme.components.badge.text,
            background: sectionHovered
              ? theme.components.badge.text
              : theme.components.badge.background,
            border: `1px solid ${sectionHovered ? "transparent" : "#000"}`,
            transition: "background 0.2s, color 0.2s, border-color 0.2s",
          }}
          onClick={() => onSectionClick(section)}
          onMouseEnter={() => setSectionHovered(true)}
          onMouseLeave={() => setSectionHovered(false)}
        >
          {section.name}
        </div>
      </div>

      <div style={styles.sectionRow}>
        {section.items.slice(0, 4).map((item, itemIdx) => (
          <div
            key={item.id}
            // Tour targets the first artwork card in the first section
            {...(isFirst && itemIdx === 0
              ? { "data-tour": "explore-card" }
              : {})}
            data-tour-track="view"
            data-tour-art-id={String(item.id)}
            style={styles.cardInner}
            onClick={() => onCardClick(item)}
          >
            <div style={{ position: "relative" }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={styles.image} />
              ) : (
                <Placeholder label="Unable to Render Image" aspectRatio="3/4" />
              )}
              <button
                data-tour-track="favorite"
                data-tour-art-id={String(item.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                style={heartButtonStyle}
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
        <ViewMoreCard section={section} onSectionClick={onSectionClick} />
      </div>
    </div>
  );
}

export function ExploreScreen({
  userId,
  onSectionClick,
  favorites,
  onToggleFavorite,
  onRecordView,
}: ExploreScreenProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sections, setSections] = useState<ExhibitSection[]>([]);
  const [searchResults, setSearchResults] = useState<ForYouItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [modalItem, setModalItem] = useState<ExhibitItem | null>(null);
  const [pinnedSections, setPinnedSections] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem(PINNED_SECTIONS_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getExhibitSections()
      .then(setSections)
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

  const forYouToExhibitItem = (item: ForYouItem): ExhibitItem => ({
    id: item.id,
    name: item.title,
    desc: item.about,
    imageUrl: item.imageUrl,
    department: item.department,
    classification: item.classification,
    displaydate: item.displaydate,
    displaymaker: item.displaymaker,
    on_view: item.on_view,
    gallery_label_text: item.gallery_label_text,
  });

  const filteredSearchResults = useMemo(() => {
    if (!searchResults) return null;
    return searchResults.filter((item) =>
      itemMatchesFilters(item, activeFilters),
    );
  }, [searchResults, activeFilters]);

  const filteredSections = useMemo(() => {
    if (activeFilters.length === 0) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          itemMatchesFilters(item, activeFilters),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, activeFilters]);

  const pinnedList = pinnedSections
    .map((name) => filteredSections.find((s) => s.name === name))
    .filter((s): s is ExhibitSection => Boolean(s));
  const unpinnedList = filteredSections.filter(
    (s) => !pinnedSections.includes(s.name),
  );

  const sharedCardProps = (section: ExhibitSection, isFirst: boolean) => ({
    section,
    onSectionClick,
    favorites,
    onToggleFavorite,
    isPinned: pinnedSections.includes(section.name),
    onTogglePin: handleTogglePin,
    onCardClick: (item: ExhibitItem) => setModalItem(item),
    isFirst,
  });

  const handleClear = () => setSearchResults(null);
  const isSearching = searchResults !== null;

  return (
    <div style={styles.page}>
      {/* ── Tour target: search/filter bar ── */}
      <div data-tour="explore-search">
        <SearchFilterBar
          onSearch={handleSearch}
          onClear={handleClear}
          isSearching={isSearching}
          placeholder="Search by title or tag…"
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
      </div>

      {/* ── Tour target: page heading ── */}
      <h1 data-tour="explore-heading" style={styles.title}>
        {isSearching ? "SEARCH RESULTS" : "EXPLORE"}
      </h1>

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

      {isSearching && !searchLoading && filteredSearchResults!.length === 0 && (
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

      {isSearching && !searchLoading && filteredSearchResults!.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.mutedText,
            }}
          >
            {filteredSearchResults!.length} result
            {filteredSearchResults!.length !== 1 ? "s" : ""} found
          </p>
          {filteredSearchResults!.map((item) => (
            <SearchResultCard
              key={item.id}
              item={item}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onCardClick={(item) => setModalItem(forYouToExhibitItem(item))}
            />
          ))}
        </div>
      )}

      {!isSearching && (
        <>
          {pinnedList.length > 0 && (
            <>
              <div style={styles.pinnedLabel}>
                <Pin size={11} strokeWidth={2.5} />
                Pinned
              </div>
              {pinnedList.map((section, i) => (
                <ExploreSectionCard
                  key={section.name}
                  {...sharedCardProps(section, i === 0)}
                />
              ))}
              <hr style={styles.divider} />
            </>
          )}
          {unpinnedList.map((section, i) => (
            <ExploreSectionCard
              key={section.name}
              {...sharedCardProps(section, pinnedList.length === 0 && i === 0)}
            />
          ))}
        </>
      )}

      {modalItem && (
        <ArtworkModal
          item={modalItem}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onClose={() => setModalItem(null)}
          userId={userId}
          onRecordView={onRecordView}
        />
      )}
    </div>
  );
}
