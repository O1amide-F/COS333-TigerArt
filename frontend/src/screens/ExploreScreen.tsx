import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { getExhibitSections } from "../new_data";
import { theme } from "../theme";
import type { ExhibitSection, ForYouItem } from "../types";

//const API_BASE = "http://localhost:5001/api";
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001/api";


type ExploreScreenProps = {
  onSectionClick: (section: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

const styles = {
  page: { padding: "16px 20px 100px", overflowY: "auto" as const, height: "100%" },
  title: {
    margin: "0 0 20px", fontSize: 22,
    fontFamily: "'Playfair Display', serif", fontWeight: 900,
    letterSpacing: "0.06em", color: theme.components.badge.text,
    background: theme.components.badge.background,
    display: "inline-block", padding: "6px 12px", borderRadius: 4,
  },
  sectionBlock: { marginBottom: 28 },
  sectionHeader: {
    background: theme.components.badge.background, borderRadius: 4,
    padding: "8px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, color: theme.components.badge.text,
    marginBottom: 12, display: "inline-block", cursor: "pointer",
  },
  sectionRow: {
    display: "flex", gap: 10, overflowX: "auto" as const,
    paddingBottom: 4, scrollbarWidth: "thin" as const,
  },
  cardInner: { width: 150, flex: "0 0 auto" as const, cursor: "pointer" },
  image: { width: "100%", aspectRatio: "3 / 4", objectFit: "cover" as const, borderRadius: 8, display: "block" },
  cardTextWrap: { paddingTop: 6 },
  itemName: { fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: theme.components.badge.text },
  itemDesc: { fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: theme.components.badge.mutedText },
} as const;

function SearchResultCard({ item, favorites, onToggleFavorite }: {
  item: ForYouItem; favorites: number[]; onToggleFavorite: (id: number) => void;
}) {
  return (
    <div style={{ border: `1px solid ${theme.components.card.border}`,
      borderRadius: 8, overflow: "hidden", background: theme.components.card.background }}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} style={{
          width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />
      ) : (
        <Placeholder label="Unable to Render Image" aspectRatio="4/3" style={{ borderRadius: 0 }} />
      )}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: theme.components.badge.text, fontFamily: "'DM Sans', sans-serif" }}>
            {item.title}
          </span>
          <button onClick={() => onToggleFavorite(item.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            transform: favorites.includes(item.id) ? "scale(1.2)" : "scale(1)" }}>
            <Heart size={18} strokeWidth={2.2}
              color={favorites.includes(item.id) ? theme.components.favorite.active : theme.components.favorite.inactive}
              fill={favorites.includes(item.id) ? theme.components.favorite.active : "none"} />
          </button>
        </div>
        <div style={{ background: theme.components.badge.background, borderRadius: 4,
          padding: "6px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.mutedText }}>
          {item.about}
        </div>
      </div>
    </div>
  );
}

function ExploreSectionCard({ section, onSectionClick, favorites, onToggleFavorite }: {
  section: ExhibitSection; onSectionClick: (s: ExhibitSection) => void;
  favorites: number[]; onToggleFavorite: (id: number) => void;
}) {
  return (
    <div style={styles.sectionBlock}>
      <div style={styles.sectionHeader} onClick={() => onSectionClick(section)}>
        {section.name}
      </div>
      <div style={styles.sectionRow}>
        {section.items.map((item) => (
          <div key={item.id} style={styles.cardInner} onClick={() => onSectionClick(section)}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} style={styles.image} />
            ) : (
              <Placeholder label="Unable to Render Image" aspectRatio="3/4" />
            )}
            <div style={styles.cardTextWrap}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemDesc}>{item.desc}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                padding: "6px 0 0", transform: favorites.includes(item.id) ? "scale(1.2)" : "scale(1)" }}>
              <Heart size={18} strokeWidth={2.2}
                color={favorites.includes(item.id) ? theme.components.favorite.active : theme.components.favorite.inactive}
                fill={favorites.includes(item.id) ? theme.components.favorite.active : "none"} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExploreScreen({ onSectionClick, favorites, onToggleFavorite }: ExploreScreenProps) {
  const [sections, setSections] = useState<ExhibitSection[]>([]);
  const [searchResults, setSearchResults] = useState<ForYouItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    getExhibitSections()
      .then((data) => setSections(data))
      .catch((e) => console.error("Error fetching sections:", e));
  }, []);

  const handleSearch = (query: string) => {
    setSearchLoading(true);
    fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data: ForYouItem[]) => { setSearchResults(data); setSearchLoading(false); })
      .catch(() => setSearchLoading(false));
  };

  const handleClear = () => setSearchResults(null);
  const isSearching = searchResults !== null;

  return (
    <div style={styles.page}>
      <SearchBar onSearch={handleSearch} onClear={handleClear} isSearching={isSearching} />
      <h1 style={styles.title}>{isSearching ? "SEARCH RESULTS" : "EXPLORE"}</h1>

      {searchLoading && (
        <div style={{ textAlign: "center", padding: "40px 0",
          fontFamily: "'DM Sans', sans-serif", color: theme.components.badge.mutedText, fontSize: 14 }}>
          Searching…
        </div>
      )}

      {isSearching && !searchLoading && searchResults!.length === 0 && (
        <div style={{ background: theme.components.badge.background, borderRadius: 8,
          padding: "24px 20px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
          <p style={{ margin: "0 0 6px", fontWeight: 600, color: theme.components.badge.text }}>No results found</p>
          <p style={{ margin: 0, fontSize: 13, color: theme.components.badge.mutedText }}>Try a different keyword or tag</p>
        </div>
      )}

      {isSearching && !searchLoading && searchResults!.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText }}>
            {searchResults!.length} result{searchResults!.length !== 1 ? "s" : ""} found
          </p>
          {searchResults!.map((item) => (
            <SearchResultCard key={item.id} item={item} favorites={favorites} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      )}

      {!isSearching && sections.map((section) => (
        <ExploreSectionCard key={section.name} section={section}
          onSectionClick={onSectionClick} favorites={favorites} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}
