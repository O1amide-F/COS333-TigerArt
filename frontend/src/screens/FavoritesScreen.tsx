import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { getExhibitSections, getForYouItems } from "../new_data";
import { theme } from "../theme";
import type { ExhibitSection, ForYouItem } from "../types";

type FavoritesScreenProps = {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onNavHome: () => void;
};

export function FavoritesScreen({
  favorites,
  onToggleFavorite,
  onNavHome,
}: FavoritesScreenProps) {
  const [forYouItems, setForYouItems] = useState<ForYouItem[]>([]);
  const [sections, setSections] = useState<ExhibitSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  useEffect(() => {
    if (expandedId !== null && !favorites.includes(expandedId)) {
      setExpandedId(null);
    }
  }, [favorites, expandedId]);

  const favoriteCards = useMemo(() => {
    const byId = new Map<
      number,
      { id: number; title: string; subtitle: string; imageUrl?: string }
    >();

    for (const item of forYouItems) {
      byId.set(item.id, {
        id: item.id,
        title: item.title,
        subtitle: item.about,
        imageUrl: item.imageUrl,
      });
    }

    for (const section of sections) {
      for (const item of section.items) {
        if (!byId.has(item.id)) {
          byId.set(item.id, {
            id: item.id,
            title: item.name,
            subtitle: item.desc,
            imageUrl: item.imageUrl,
          });
        }
      }
    }

    return favorites
      .map((favoriteId) => byId.get(favoriteId))
      .filter(
        (
          card,
        ): card is {
          id: number;
          title: string;
          subtitle: string;
          imageUrl?: string;
        } => card !== undefined,
      );
  }, [favorites, forYouItems, sections]);

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchBar />

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
      ) : favoriteCards.length > 0 ? (
        <div
          style={{
            columnCount: 2,
            columnGap: 12,
          }}
        >
          {favoriteCards.map((card, index) => (
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
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  style={{
                    width: "100%",
                    aspectRatio:
                      index % 5 === 0
                        ? "3 / 4"
                        : index % 5 === 1
                          ? "1 / 1"
                          : index % 5 === 2
                            ? "4 / 5"
                            : index % 5 === 3
                              ? "2 / 3"
                              : "4 / 3",
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
                        event.stopPropagation();
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