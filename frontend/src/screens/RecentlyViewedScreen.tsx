import { useEffect, useMemo, useState } from "react";
import { Heart, Clock } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { theme } from "../theme";
import type { ExhibitSection } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001/api";

type RecentlyViewedScreenProps = {
  userId: string | null;
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
};

export function RecentlyViewedScreen({
  userId,
  onSectionClick,
  favorites,
  onToggleFavorite,
}: RecentlyViewedScreenProps) {
  const [artworks, setArtworks] = useState<ArtworkFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE}/recently-viewed/${userId}`)
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
  }, [userId]);

  const recentCards = useMemo<RecentCard[]>(
    () =>
      artworks.map((a) => ({
        id: a.artwork_id,
        title: a.title ?? "Untitled",
        subtitle: a.description ?? "",
        imageUrl: a.image_url,
      })),
    [artworks],
  );

  const displayCards = useMemo(() => {
    if (!searchQuery) return recentCards;
    const q = searchQuery.toLowerCase();
    return recentCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q),
    );
  }, [recentCards, searchQuery]);

  // Build a minimal ExhibitSection so onSectionClick works the same as Explore
  const handleCardClick = (card: RecentCard) => {
    if (expandedId === card.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(card.id);

    // Find the full artwork to build the section
    const artwork = artworks.find((a) => a.artwork_id === card.id);
    if (!artwork) return;

    const section: ExhibitSection = {
      name: artwork.title ?? "Untitled",
      items: [
        {
          id: artwork.artwork_id,
          name: artwork.title ?? "Untitled",
          desc: artwork.description ?? "",
          imageUrl: artwork.image_url,
          department: artwork.department,
          classification: artwork.classification,
          displaydate: artwork.displaydate,
          displaymaker: artwork.displaymaker,
          on_view: artwork.on_view,
        },
      ],
    };
    onSectionClick(section);
  };

  const isSearching = searchQuery !== null;

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchBar
        onSearch={(q) => setSearchQuery(q)}
        onClear={() => setSearchQuery(null)}
        isSearching={isSearching}
      />

      <h1
        style={{
          margin: "0 0 24px",
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
        {isSearching ? "SEARCH RESULTS" : "RECENTLY VIEWED"}
      </h1>

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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displayCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                style={{
                  border: `1px solid ${theme.components.card.border}`,
                  borderRadius: 10,
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
                        aspectRatio: "4/3",
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
                      color={
                        favorites.includes(card.id)
                          ? theme.components.favorite.active
                          : "#fff"
                      }
                      fill={
                        favorites.includes(card.id)
                          ? theme.components.favorite.active
                          : "none"
                      }
                    />
                  </button>
                </div>

                {/* Title always visible below image */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: theme.components.badge.text,
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.2,
                      marginBottom: card.subtitle ? 6 : 0,
                    }}
                  >
                    {card.title}
                  </div>
                  {card.subtitle && (
                    <div
                      style={{
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        color: theme.components.badge.mutedText,
                        lineHeight: 1.5,
                      }}
                    >
                      {card.subtitle}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
            Artworks you tap will appear here
          </div>
        </div>
      )}
    </div>
  );
}
