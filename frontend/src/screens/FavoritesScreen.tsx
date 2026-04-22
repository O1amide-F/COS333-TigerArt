import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { ArtworkModal } from "../components/ArtworkModal";
import { SearchFilterBar } from "../components/SearchFilterBar.tsx";
import { itemMatchesFilters } from "../utils/filterUtils";
import { theme } from "../theme";
import type { ExhibitItem } from "../types";

const API_BASE = "/api";

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
  const [modalItem, setModalItem] = useState<ExhibitItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recency");
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
  }, [userId, favorites]);

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
    return cards;
  }, [favoriteCards, sortBy]);

  const displayCards = useMemo(() => {
    let cards = sortedCards;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q),
      );
    }
    return cards.filter((c) => itemMatchesFilters(c, activeFilters));
  }, [sortedCards, searchQuery, activeFilters]);

  const isSearching = searchQuery !== null;

  const toExhibitItem = (artwork: ArtworkFromAPI): ExhibitItem => ({
    id: artwork.artwork_id,
    name: artwork.title ?? "Untitled",
    desc: artwork.description ?? "",
    imageUrl: artwork.image_url,
    classification: artwork.classification,
    department: artwork.department,
    displaydate: artwork.displaydate,
  });

  const handleCardClick = (cardId: number) => {
    const artwork = artworks.find((item) => item.artwork_id === cardId);
    if (artwork) setModalItem(toExhibitItem(artwork));
  };

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: theme.colors.bg,
          paddingBottom: 8,
          marginBottom: 8,
        }}
      >
        <h1
          data-tour="favorites-heading"
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: theme.components.badge.text,
          }}
        >
          {isSearching ? "Search Results" : "Favorites"}
        </h1>
        <div data-tour="favorites-search">
          <SearchFilterBar
            onSearch={(q) => setSearchQuery(q)}
            onClear={() => setSearchQuery(null)}
            isSearching={isSearching}
            placeholder="Search your favorites…"
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
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
          <div style={{ columnCount: 2, columnGap: 16 }}>
            {displayCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 180ms ease",
                  breakInside: "avoid",
                  marginBottom: 16,
                  background: theme.components.card.background,
                }}
              >
                <div style={{ position: "relative" }}>
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
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
                <div
                  style={{
                    padding: "12px",
                    background: theme.components.card.background,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: theme.components.badge.text,
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    {card.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {modalItem && (
            <ArtworkModal
              item={modalItem}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onClose={() => setModalItem(null)}
              userId={userId}
            />
          )}
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
