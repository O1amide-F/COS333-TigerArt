import { useEffect, useState} from "react";
import { Heart } from "lucide-react";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { Placeholder } from "../components/Placeholder";
import { ArtworkModal } from "../components/ArtworkModal";
import { getFallbackImageForAspect } from "../assets/fallbackImage";
import type { ForYouItem, ExhibitItem } from "../types";
import { theme } from "../theme";

const API_BASE = "/api";

type ForYouScreenProps = {
  userId: string | null;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onRecordView?: (id: number) => void;
};

export function ForYouScreen({
  favorites,
  onToggleFavorite,
  onRecordView,
  userId,
}: ForYouScreenProps) {
  const [items, setItems] = useState<ForYouItem[]>([]);
  const [searchResults, setSearchResults] = useState<ForYouItem[] | null>(null);
  const [filterResults, setFilterResults] = useState<ForYouItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<ExhibitItem | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);


  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_BASE}/for-you/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error("fallback");
        return r.json();
      })
      .then((data: ForYouItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        fetch(`${API_BASE}/for-you`)
          .then((r) => r.json())
          .then((data: ForYouItem[]) => {
            setItems(data);
            setLoading(false);
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
      });
  }, [userId]);

  const handleSearch = (query: string) => {
    setVisibleCount(10);
    setSearchLoading(true);
    fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data: ForYouItem[]) => {
        setSearchResults(data);
        setSearchLoading(false);
      })
      .catch(() => setSearchLoading(false));
  };

  const handleClear = () => {
    setSearchResults(null);
    setFilterResults(null);
    setVisibleCount(10); 
  };

    // When filters change, search the full collection using tag names as query
    const handleFiltersChange = (filters: string[]) => {
      setActiveFilters(filters);
      setVisibleCount(10);
      if (filters.length === 0) {
        setFilterResults(null);
        return;
      }
      // Join filter tags with spaces — backend search handles multiple keywords
      const query = filters.join(" ");
      fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data: ForYouItem[]) => setFilterResults(data))
        .catch(() => setFilterResults(null));
    };

  const displayItems = searchResults ?? filterResults ?? items;
  const isSearching = searchResults !== null || filterResults !== null;
  const visibleItems = isSearching ? displayItems.slice(0, visibleCount) : displayItems;

  const toExhibitItem = (item: ForYouItem): ExhibitItem => ({
    id: item.id,
    name: item.title,
    desc: item.about,
    imageUrl: item.imageUrl,
    department: item.department,
    classification: item.classification,
    displaydate: item.displaydate,
    displaymaker: item.displaymaker,
    on_view: item.on_view,
  });

  if (!userId) {
    return (
      <div
        style={{
          padding: "16px 20px 100px",
          overflowY: "auto",
          height: "100%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText,
            fontSize: 14,
          }}
        >
          Loading your feed…
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* ── Tour target: search bar ── */}
      <div data-tour="search">
        <SearchFilterBar
          onSearch={handleSearch}
          onClear={handleClear}
          isSearching={isSearching}
          placeholder="Search by title or tag…"
          activeFilters={activeFilters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* ── Tour target: page heading ── */}
      <h1
        data-tour="for-you-heading"
        style={{
          margin: "0 0 4px",
          fontSize: 24,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          color: theme.components.badge.text,
        }}
      >
        {isSearching ? "Search Results" : "For You Page"}
      </h1>

      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.mutedText,
          background: theme.components.badge.background,
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 4,
        }}
      >
        {isSearching
          ? `${displayItems.length} result${displayItems.length !== 1 ? "s" : ""} found`
          : "Curated according to your preferences"}
      </p>

      {(loading || searchLoading) && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText,
            fontSize: 14,
          }}
        >
          {searchLoading ? "Searching…" : "Loading your feed…"}
        </div>
      )}

      {!loading && !searchLoading && error && (
        <div
          style={{
            background: theme.components.badge.background,
            borderRadius: 8,
            padding: "24px 20px",
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText,
            fontSize: 13,
          }}
        >
          Something went wrong loading your feed.
        </div>
      )}

      {!loading &&
        !searchLoading &&
        !error &&
        isSearching &&
        displayItems.length === 0 && (
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

      {!loading && !searchLoading && !error && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              // Tour targets only the first card
              {...(index === 0 ? { "data-tour": "artwork-card" } : {})}
              data-tour-track="view"
              data-tour-art-id={String(item.id)}
              onClick={() => setModalItem(toExhibitItem(item))}
              style={{
                breakInside: "avoid",
                marginBottom: 12,
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
                      aspectRatio: "1/1",
                      objectFit: "contain",
                      backgroundColor: theme.components.image.background,
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImageForAspect("1/1");
                    }}
                  />
                ) : (
                  <Placeholder
                    label="Unable to Render Image"
                    aspectRatio="1/1"
                    style={{ borderRadius: 0 }}
                  />
                )}
                {/* Tour targets the heart on the first card only */}
                <button
                  {...(index === 0 ? { "data-tour": "favorite-btn" } : {})}
                  data-tour-track="favorite"
                  data-tour-art-id={String(item.id)}
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
                    flexShrink: 0,
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
              <div
                style={{
                  padding: "8px 10px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.components.badge.text,
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {isSearching && visibleCount < displayItems.length && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            style={{
              padding: "10px 24px", borderRadius: 6, border: "none",
              cursor: "pointer", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              background: theme.components.badge.background,
              color: theme.components.badge.text,
            }}
          >
            Load more ({displayItems.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {modalItem && (
        <ArtworkModal
          item={modalItem}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onClose={() => setModalItem(null)}
          onRecordView={onRecordView}
        />
      )}
    </div>
  );
}
