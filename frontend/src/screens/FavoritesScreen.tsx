import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchFilterBar } from "../components/SearchFilterBar.tsx";
import { itemMatchesFilters } from "../utils/filterUtils";
import { theme } from "../theme";

const API_BASE = '/api';

type FavoritesScreenProps = {
  userId: string | null;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onNavHome: () => void;
};

type ArtworkFromAPI = {
  artwork_id: number;
  title: string;
  description?: string;
  image_url?: string;
  classification?: string;  
  department?: string;      
  displaydate?: string;
};

type FavoriteCard = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl?: string;
  classification?: string;  
  department?: string;      
  displaydate?: string;
};

type SortOption = "recency" | "az" | "za";

export function FavoritesScreen({
  userId,
  favorites,
  onToggleFavorite,
  onNavHome,
}: FavoritesScreenProps) {
  const [artworks, setArtworks] = useState<ArtworkFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recency");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const endpoint = userId
      ? `${API_BASE}/favorites/${userId}`
      : favorites.length > 0
        ? `${API_BASE}/artworks/by-ids?ids=${encodeURIComponent(favorites.join(","))}`
        : null;

    if (!endpoint) {
      setArtworks([]);
      setIsLoading(false);
      return;
    }

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data: ArtworkFromAPI[]) => setArtworks(data))
      .catch((e) => {
        console.error("Error fetching favorites:", e);
        setError("Could not load favorites. Is the server running?");
      })
      .finally(() => setIsLoading(false));
  }, [userId, favorites]); // re-fetch when favorites toggle so removals reflect immediately

  useEffect(() => {
    if (expandedId !== null && !favorites.includes(expandedId))
      setExpandedId(null);
  }, [favorites, expandedId]);

  const favoriteCards = useMemo<FavoriteCard[]>(
    () =>
      artworks.map((a) => ({
        id: a.artwork_id,
        title: a.title ?? "Untitled",
        subtitle: a.description ?? "",
        imageUrl: a.image_url,
        classification: a.classification, 
        department: a.department,           
        displaydate: a.displaydate,
      })),
    [artworks],
  );

  const sortedCards = useMemo(() => {
    const cards = [...favoriteCards];
    if (sortBy === "az")
      return cards.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "za")
      return cards.sort((a, b) => b.title.localeCompare(a.title));
    // "recency": backend returns ORDER BY sa.id DESC (newest first) — preserve that order
    return cards;
  }, [favoriteCards, sortBy]);

  const displayCards = useMemo(() => {
    let cards = sortedCards;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q),
      );
    }
    return cards.filter((c) => itemMatchesFilters(c, activeFilters));
  }, [sortedCards, searchQuery, activeFilters]);

  const isSearching = searchQuery !== null;

  const handleSearch = (q: string) => setSearchQuery(q);
  const handleClear = () => setSearchQuery(null);

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchFilterBar
        onSearch={handleSearch}
        onClear={handleClear}
        isSearching={isSearching}
        placeholder="Search your favorites…"
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: theme.components.badge.text,
            background: theme.components.badge.background,
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 4,
          }}
        >
          {isSearching ? "SEARCH RESULTS" : "FAVORITES"}
        </h1>
      </div>

      {isLoading ? (
        <div
          style={{
            border: `1px solid ${theme.components.card.border}`,
            borderRadius: 10,
            padding: "20px 24px",
            background: theme.components.card.background,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText,
          }}
        >
          Loading your favorites...
        </div>
      ) : error ? (
        <div
          style={{
            border: `1px solid ${theme.components.card.border}`,
            borderRadius: 10,
            padding: "20px 24px",
            background: theme.components.card.background,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            color: "#c0392b",
          }}
        >
          {error}
        </div>
      ) : isSearching && displayCards.length === 0 ? (
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
            No matching favorites
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: theme.components.badge.mutedText,
            }}
          >
            Try a different search term
          </p>
        </div>
      ) : displayCards.length > 0 ? (
        <>
          {isSearching && (
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                color: theme.components.badge.mutedText,
              }}
            >
              {displayCards.length} result{displayCards.length !== 1 ? "s" : ""}{" "}
              in your favorites
            </p>
          )}
          <div style={{ columnCount: 2, columnGap: 12 }}>
            {displayCards.map((card, index) => (
              <div
                key={card.id}
                onClick={() =>
                  setExpandedId((prev) => (prev === card.id ? null : card.id))
                }
                style={{
                  breakInside: "avoid",
                  marginBottom: 12,
                  border: `1px solid ${theme.components.card.border}`,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: theme.components.card.background,
                  cursor: "pointer",
                  transition: "all 180ms ease",
                }}
              >
                <div style={{ position: "relative" }}>
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      style={{
                        width: "100%",
                        aspectRatio:
                          index % 5 === 0
                            ? "3/4"
                            : index % 5 === 1
                              ? "1/1"
                              : index % 5 === 2
                                ? "4/5"
                                : index % 5 === 3
                                  ? "2/3"
                                  : "4/3",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Placeholder
                      label="Unable to Render Image"
                      aspectRatio={
                        index % 5 === 0
                          ? "3/4"
                          : index % 5 === 1
                            ? "1/1"
                            : index % 5 === 2
                              ? "4/5"
                              : index % 5 === 3
                                ? "2/3"
                                : "4/3"
                      }
                      style={{ borderRadius: 0 }}
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(card.id);
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
                      color={theme.components.favorite.active}
                      fill={theme.components.favorite.active}
                    />
                  </button>
                </div>
                {expandedId === card.id && (
                  <div style={{ padding: "12px" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: theme.components.badge.text,
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.2,
                        marginBottom: 8,
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        color: theme.components.badge.mutedText,
                        lineHeight: 1.5,
                      }}
                    >
                      {card.subtitle}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            border: `1px solid ${theme.components.favorites_card.border}`,
            borderRadius: 10,
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            background: theme.components.favorites_card.background,
          }}
        >
          <Heart
            size={48}
            strokeWidth={1.7}
            color={theme.components.favorite.inactive}
          />
          <div
            style={{
              fontSize: 16,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: theme.components.badge.text,
            }}
          >
            No favorites yet
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.mutedText,
              textAlign: "center",
            }}
          >
            Tap hearts on artworks to see them here
          </div>
          <button
            onClick={onNavHome}
            style={{
              marginTop: 8,
              background: theme.components.button.primaryBackground,
              color: theme.components.button.primaryText,
              border: "none",
              borderRadius: 6,
              padding: "12px 28px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Explore Art
          </button>
        </div>
      )}
    </div>
  );
}
