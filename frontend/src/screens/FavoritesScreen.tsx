import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { getExhibitSections, getForYouItems } from "../new_data";
import { theme } from "../theme";
import type { ExhibitSection, ForYouItem } from "../types";

type FavoritesScreenProps = {
  // Array of artwork IDs the user has liked.
  favorites: number[];
  // Callback to like/unlike an artwork by ID.
  onToggleFavorite: (id: number) => void;
  // Navigation callback used when empty-state button is clicked.
  onNavHome: () => void;
};

export function FavoritesScreen({
  favorites,
  onToggleFavorite,
  onNavHome,
}: FavoritesScreenProps) {
  // "For You" data source used to resolve favorites into display cards.
  const [forYouItems, setForYouItems] = useState<ForYouItem[]>([]);
  // Explore section data source used as a fallback if an ID is not in For You.
  const [sections, setSections] = useState<ExhibitSection[]>([]);
  // Drives loading UI while we fetch sources needed to build favorite cards.
  const [isLoading, setIsLoading] = useState(false);
  // Only one card is expanded at a time; null means all cards are collapsed.
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Initial data load: fetch both sources in parallel so favorites can be resolved.
  useEffect(() => {
    setIsLoading(true);
    Promise.all([getForYouItems(), getExhibitSections()])
      .then(([forYou, exhibitSections]) => {
        setForYouItems(forYou);
        setSections(exhibitSections);
      })
      .catch((error) => {
        console.error("Error fetching favorites data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // If an expanded card gets unliked and removed, collapse it to avoid stale UI.
  useEffect(() => {
    if (expandedId !== null && !favorites.includes(expandedId)) {
      setExpandedId(null);
    }
  }, [favorites, expandedId]);

  // Build a merged lookup map from both data sources, then project only liked IDs.
  const favoriteCards = useMemo(() => {
    // Map gives O(1) access by ID when converting favorites to renderable cards.
    const byId = new Map<
      number,
      { id: number; title: string; subtitle: string }
    >();

    // Prefer For You content for title/description when IDs overlap.
    for (const item of forYouItems) {
      byId.set(item.id, {
        id: item.id,
        title: item.title,
        subtitle: item.about,
      });
    }

    // Fill in any missing IDs from Explore sections.
    for (const section of sections) {
      for (const item of section.items) {
        if (!byId.has(item.id)) {
          byId.set(item.id, {
            id: item.id,
            title: item.name,
            subtitle: item.desc,
          });
        }
      }
    }

    // Keep favorites in user-selected order and drop unresolved IDs safely.
    return favorites
      .map((favoriteId) => byId.get(favoriteId))
      .filter(
        (card): card is { id: number; title: string; subtitle: string } =>
          card !== undefined,
      );
  }, [favorites, forYouItems, sections]);

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Search bar is decorative/consistent with the rest of the app shell. */}
      <SearchBar />
      {/* Screen heading. */}
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
        FAVORITES
      </h1>

      {/* Branch 1: user has likes but data is still loading. */}
      {favorites.length > 0 && isLoading ? (
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
      ) : // Branch 2: we have resolved cards, so render masonry-style gallery.
      favoriteCards.length > 0 ? (
        <div
          style={{
            // CSS columns create a lightweight Pinterest-like staggered feed.
            columnCount: 2,
            columnGap: 12,
          }}
        >
          {favoriteCards.map((card, index) => (
            <div
              key={card.id}
              // Clicking a tile toggles expanded metadata under the image.
              onClick={() =>
                setExpandedId((prev) => (prev === card.id ? null : card.id))
              }
              style={{
                // Prevent cards from splitting across columns.
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
              <Placeholder
                label="Image"
                // Rotate through ratios for visual rhythm similar to masonry boards.
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

              {/* Expanded panel reveals metadata only for the selected card. */}
              {expandedId === card.id && (
                <div
                  style={{
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: theme.components.badge.text,
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {card.title}
                    </div>
                    <button
                      onClick={(event) => {
                        // Keep heart click from also toggling card expansion.
                        event.stopPropagation();
                        // Remove from favorites directly from this screen.
                        onToggleFavorite(card.id);
                      }}
                      aria-label="Remove favorite"
                      style={{
                        background: theme.components.button.ghostBackground,
                        border: theme.components.button.ghostBorder,
                        cursor: "pointer",
                        lineHeight: 0,
                        flexShrink: 0,
                      }}
                    >
                      <Heart
                        size={18}
                        strokeWidth={2.2}
                        color={theme.components.favorite.active}
                        fill={theme.components.favorite.active}
                      />
                    </button>
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
      ) : (
        // Branch 3: empty state when the user has no likes.
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
          {/* Primary action sends user back to discover artwork to like. */}
          <button
            onClick={onNavHome}
            style={{
              marginTop: 8,
              background: theme.components.button.primaryBackground,
              color: theme.components.button.primaryText,
              border: theme.components.button.ghostBorder,
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
