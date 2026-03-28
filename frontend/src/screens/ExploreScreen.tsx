import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { EXHIBIT_SECTIONS } from "../data";
import { theme } from "../theme";
import type { ExhibitSection } from "../types";

type ExploreScreenProps = {
  onSectionClick: (section: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

// Shared inline styles keep the JSX "template" concise and easier to scan.
const styles = {
  page: { padding: "16px 20px 100px", overflowY: "auto", height: "100%" },
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
    display: "inline-block",
    cursor: "pointer",
  },
  sectionRow: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 4,
    scrollbarWidth: "thin",
  },
  card: { cursor: "pointer" },
  cardInner: { width: 150, flex: "0 0 auto" },
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

function ExploreSectionCard({
  section,
  onSectionClick,
  favorites,
  onToggleFavorite,
}: {
  section: ExhibitSection;
  onSectionClick: (section: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <div style={styles.sectionBlock}>
      {/* Clickable section title that routes to section detail. */}
      <div style={styles.sectionHeader} onClick={() => onSectionClick(section)}>
        {section.name}
      </div>

      {/* Horizontal carousel with all items from the selected collection. */}
      <div style={styles.sectionRow}>
        {section.items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSectionClick(section)}
            style={{ ...styles.card, ...styles.cardInner }}
          >
            {/* Shared placeholder image component for exhibit thumbnails. */}
            <Placeholder label="Image" aspectRatio="3/4" />
            <div style={styles.cardTextWrap}>
              {/* Exhibit name text component area. */}
              <div style={styles.itemName}>{item.name}</div>
              {/* Exhibit description text component area. */}
              <div style={styles.itemDesc}>{item.desc}</div>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(item.id);
              }}
              style={{
                background: theme.components.button.ghostBackground,
                border: theme.components.button.ghostBorder,
                cursor: "pointer",
                transition: "color 0.2s, transform 0.15s",
                padding: "6px 0 0",
                transform: favorites.includes(item.id)
                  ? "scale(1.2)"
                  : "scale(1)",
              }}
              aria-label={`Toggle favorite for ${item.name}`}
            >
              <Heart
                size={18}
                strokeWidth={2.2}
                color={
                  favorites.includes(item.id)
                    ? theme.components.favorite.active
                    : theme.components.favorite.inactive
                }
                fill={
                  favorites.includes(item.id)
                    ? theme.components.favorite.active
                    : "none"
                }
              />
            </button>
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
  return (
    // The screen body acts like a Jinja template loop over section data.
    <div style={styles.page}>
      {/* Reusable search component shown at the top of Explore. */}
      <SearchBar />
      {/* Page title component for this screen. */}
      <h1 style={styles.title}>EXPLORE</h1>

      {/* Section-list component loop: each section renders one card block. */}
      {EXHIBIT_SECTIONS.map((section) => (
        <ExploreSectionCard
          key={section.name}
          section={section}
          onSectionClick={onSectionClick}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
