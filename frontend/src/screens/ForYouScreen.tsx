import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { Placeholder } from "../components/Placeholder";
import type { ForYouItem } from "../types";
import { theme } from "../theme";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001/api";
const USER_ID = 1;

type ForYouScreenProps = {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

export function ForYouScreen({
  favorites,
  onToggleFavorite,
}: ForYouScreenProps) {
  const [items, setItems] = useState<ForYouItem[]>([]);
  const [searchResults, setSearchResults] = useState<ForYouItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/for-you/${USER_ID}`)
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
  }, []);

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

  const displayItems = searchResults ?? items;
  const isSearching = searchResults !== null;

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchBar
        onSearch={handleSearch}
        onClear={handleClear}
        isSearching={isSearching}
      />

      <h1
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
          {displayItems.map((item) => {
            const aspectRatio = "1/1";

            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  breakInside: "avoid",
                  marginBottom: 12,
                  border: `1px solid ${theme.components.card.border}`,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: theme.components.card.background,
                }}
              >
                {/* Image with heart overlaid top-right */}
                <div style={{ position: "relative" }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{
                        width: "100%",
                        aspectRatio,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Placeholder
                      label="Unable to Render Image"
                      aspectRatio={aspectRatio}
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

                {/* Title always visible, tapping toggles details */}
                <div
                  onClick={() =>
                    setExpandedId((prev) => (prev === item.id ? null : item.id))
                  }
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.components.badge.text,
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: theme.components.badge.mutedText,
                      flexShrink: 0,
                      transition: "transform 180ms",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 10px 10px",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      color: theme.components.badge.mutedText,
                      lineHeight: 1.5,
                      borderTop: `1px solid ${theme.components.card.border}`,
                      paddingTop: 8,
                    }}
                  >
                    {item.about}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
