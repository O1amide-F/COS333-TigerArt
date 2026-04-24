import { useEffect, useMemo, useState } from "react";
import { Heart, Clock } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { getFallbackImageForAspect } from "../assets/fallbackImage";
import { SearchFilterBar } from "../components/SearchFilterBar.tsx";
import { itemMatchesFilters } from "../utils/filterUtils";
import { ArtworkModal } from "../components/ArtworkModal";
import { theme } from "../theme";
import type { ExhibitSection, ExhibitItem } from "../types";

const API_BASE = "/api";

type RecentlyViewedScreenProps = {
  userId: string | null;
  recentIds: number[];
  onSectionClick: (section: ExhibitSection) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

type ArtworkFromAPI = {
  artwork_id: number;
  title: string;
  description?: string;
  department?: string;
  classification?: string;
  displaydate?: string;
  displaymaker?: string;
  on_view?: boolean;
  image_url?: string;
};

type RecentCard = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl?: string;
  classification?: string;
  department?: string;
  displaydate?: string;
};

export function RecentlyViewedScreen({
  userId,
  recentIds,
  favorites,
  onToggleFavorite,
}: RecentlyViewedScreenProps) {
  const [artworks, setArtworks] = useState<ArtworkFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<ExhibitItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const endpoint = userId
      ? `${API_BASE}/recently-viewed/${userId}`
      : recentIds.length > 0
        ? `${API_BASE}/artworks/by-ids?ids=${encodeURIComponent(recentIds.join(","))}`
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
        console.error("Error fetching recently viewed:", e);
        setError("Could not load recently viewed. Is the server running?");
      })
      .finally(() => setIsLoading(false));
  }, [userId, recentIds]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(4);
  }, [searchQuery]);

  const recentCards = useMemo<RecentCard[]>(
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

  const displayCards = useMemo(() => {
    let cards = recentCards;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q),
      );
    }
    return cards.filter((c) => itemMatchesFilters(c, activeFilters));
  }, [recentCards, searchQuery, activeFilters]);

  // Convert artwork to ExhibitItem for modal
  const toExhibitItem = (artwork: ArtworkFromAPI): ExhibitItem => ({
    id: artwork.artwork_id,
    name: artwork.title ?? "Untitled",
    desc: artwork.description ?? "",
    imageUrl: artwork.image_url,
    department: artwork.department,
    classification: artwork.classification,
    displaydate: artwork.displaydate,
    displaymaker: artwork.displaymaker,
    on_view: artwork.on_view,
  });

  const handleCardClick = (card: RecentCard) => {
    const artwork = artworks.find((a) => a.artwork_id === card.id);
    if (!artwork) return;
    setModalItem(toExhibitItem(artwork));
  };

  // Shared heart button
  const HeartButton = ({ itemId }: { itemId: number }) => {
    const isFavorited = favorites.includes(itemId);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(itemId);
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
          color={isFavorited ? theme.components.favorite.active : "#fff"}
          fill={isFavorited ? theme.components.favorite.active : "none"}
        />
      </button>
    );
  };

  const isSearching = searchQuery !== null;

  // Featured = first card, grid = rest up to visibleCount
  const featuredCard = displayCards[0];
  const gridCards = displayCards.slice(1, 1 + visibleCount);
  const hasMore = displayCards.length - 1 > visibleCount;

  const [sortBy, setSortBy] = useState<"recency" | "az" | "za">("recency");
  const handleSearch = (q: string) => setSearchQuery(q);
  const handleClear = () => setSearchQuery(null);

  return (
    <div
      style={{ padding: "0px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* ── Sticky header: title + search bar ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 20,
        background: theme.colors.bg, paddingBottom: 8, paddingTop: 16, marginBottom: 8 }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: theme.components.badge.text,
          }}
        >
          {isSearching ? "Search Results" : "Recently Viewed"}
        </h1>
        <div data-tour="recently-viewed-search">
          <SearchFilterBar
            onSearch={handleSearch}
            onClear={handleClear}
            isSearching={isSearching}
            placeholder="Search recently viewed…"
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
          Loading recently viewed...
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
            No matching results
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
              found
            </p>
          )}

          {/* Featured hero card */}
          {featuredCard && (
            <div
              data-tour="recently-viewed-card"
              style={{ marginBottom: 10, cursor: "pointer" }}
              onClick={() => handleCardClick(featuredCard)}
            >
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  background: theme.components.card.background,
                  height: "100%",
                }}
                >
                  <div style={{ position: "relative" }}>
                  {featuredCard.imageUrl ? (
                    <img
                      src={featuredCard.imageUrl}
                      alt={featuredCard.title}
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        objectFit: "contain",
                        backgroundColor: theme.components.image.background,
                        display: "block",
                        borderRadius: 4,
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackImageForAspect("16/9");
                      }}
                    />
                  ) : (
                    <Placeholder
                      label="Unable to Render Image"
                      aspectRatio="16/9"
                    />
                  )}
                  <HeartButton itemId={featuredCard.id} />
                </div>
                <div style={{ 
                  padding: "8px 10px", 
                }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      color: theme.components.badge.text,
                      marginBottom: 4,
                    }}
                  >
                    {featuredCard.title}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              borderTop: `1px solid ${theme.components.divider.color}`,
              paddingTop: 14,
            }}
          />

          {/* 2-column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 4,
            }}
          >
            {gridCards.map((card) => (
              <div
                key={card.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleCardClick(card)}
              >
                <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  background: theme.components.card.background,
                  height: "100%",
                }}
                >
                  <div style={{ position: "relative" }}>
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
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
                      />
                    )}
                    <HeartButton itemId={card.id} />
                  </div>
                  <div style={{ 
                    background: theme.components.card.background,
                    padding: "8px 10px", 
                  }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        color: theme.components.badge.text,
                      }}
                    >
                      {card.title}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {hasMore && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                data-tour="exhibit-detail-more"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "black";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = theme.components.badge.background;
                  e.currentTarget.style.color = theme.components.badge.text;
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                Click here to view more images
              </button>
            </div>
          )}
        </>
      ) : (
        // Empty state
        <div
          style={{
            border: `1px solid ${theme.components.card.border}`,
            borderRadius: 10,
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            background: theme.components.card.background,
          }}
        >
          <Clock
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
            Nothing viewed yet
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.mutedText,
              textAlign: "center",
            }}
          >
            Artworks you tap to learn more about will appear here!
          </div>
        </div>
      )}

      {modalItem && (
        <ArtworkModal
          item={modalItem}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onClose={() => setModalItem(null)}
          userId={userId}
        />
      )}
    </div>
  );
}
