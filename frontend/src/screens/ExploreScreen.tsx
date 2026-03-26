import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { EXHIBIT_SECTIONS } from "../data";
import { C } from "../theme";
import type { ExhibitSection } from "../types";

type ExploreScreenProps = {
  onSectionClick: (section: ExhibitSection) => void;
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
    color: C.text,
    background: C.surface,
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 4,
  },
  sectionBlock: { marginBottom: 28 },
  sectionHeader: {
    background: C.surface,
    borderRadius: 4,
    padding: "8px 12px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    color: C.text,
    marginBottom: 12,
    display: "inline-block",
    cursor: "pointer",
  },
  sectionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  card: { cursor: "pointer" },
  cardTextWrap: { paddingTop: 6 },
  itemName: {
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    color: C.text,
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    color: C.muted,
  },
} as const;

function ExploreSectionCard({
  section,
  onSectionClick,
}: {
  section: ExhibitSection;
  onSectionClick: (section: ExhibitSection) => void;
}) {
  return (
    <div style={styles.sectionBlock}>
      {/* Clickable section title that routes to section detail. */}
      <div style={styles.sectionHeader} onClick={() => onSectionClick(section)}>
        {section.name}
      </div>

      {/* Two-card preview grid, similar to a Jinja for-loop over section items. */}
      <div style={styles.sectionGrid}>
        {section.items.slice(0, 2).map((item) => (
          <div
            key={item.id}
            onClick={() => onSectionClick(section)}
            style={styles.card}
          >
            {/* Shared placeholder image component for exhibit thumbnails. */}
            <Placeholder label="Image" aspectRatio="3/4" />
            <div style={styles.cardTextWrap}>
              {/* Exhibit name text component area. */}
              <div style={styles.itemName}>{item.name}</div>
              {/* Exhibit description text component area. */}
              <div style={styles.itemDesc}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExploreScreen({ onSectionClick }: ExploreScreenProps) {
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
        />
      ))}
    </div>
  );
}
