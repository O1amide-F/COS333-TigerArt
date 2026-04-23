// screens/ForYouScreen.tsx
//
// KEY FIX: During open-modals step, ArtworkModal must render above the tour
// popover (z-index 9010). We pass a `modalZIndex` prop to ArtworkModal so it
// can be elevated during that step only.
//
// Also fires tour events:
//   • FAVORITE_TOGGLED — only on a new favorite (not unfavorite) during like-photos
//   • MODAL_OPENED — each time a modal opens during open-modals step

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { Placeholder } from "../components/Placeholder";
import { ArtworkModal } from "../components/ArtworkModal";
import { getFallbackImageForAspect } from "../assets/fallbackImage";
import {
  dispatchTourEvent,
  TOUR_EVENTS,
  type TourStep,
} from "../hooks/useTour";
import type { ForYouItem, ExhibitItem } from "../types";
import { theme } from "../theme";

const API_BASE = "/api";

type ForYouScreenProps = {
  userId: string | null;
  isGuest?: boolean;
  seedObjectIds?: number[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onRecordView?: (id: number) => void;
  tourActive?: boolean;
  tourStep?: TourStep;
  refreshKey?: number;
};

type ArtworkFromAPI = {
  artwork_id: number;
  title: string;
  description?: string;
  image_url?: string;
  classification?: string;
  department?: string;
  displaydate?: string;
  displaymaker?: string;
  on_view?: boolean;
};

export function ForYouScreen({
  favorites,
  onToggleFavorite,
  onRecordView,
  userId,
  isGuest = false,
  seedObjectIds = [],
  tourActive = false,
  tourStep,
  refreshKey = 0,
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
  const [randomItems, setRandomItems] = useState<ForYouItem[]>([]);
  const [mergedItems, setMergedItems] = useState<ForYouItem[]>([]);
  const [topTags, setTopTags] = useState<string[]>([]);

  // Fetch 10 random artworks on each visit — reshuffles when refreshKey changes
  // Fetch top tags
  useEffect(() => {
    fetch(`${API_BASE}/random-artworks`)
      .then((r) => r.json())
      .then((d: ForYouItem[]) => setRandomItems(d))
      .catch(() => {});

      if (userId && !isGuest) {
        fetch(`${API_BASE}/user-preferences/${userId}`)
          .then((r) => r.json())
          .then((data: Record<string, number>) => {
            const sorted = Object.entries(data)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([tag]) => tag.replace(/_/g, " "));
            setTopTags(sorted);
          })
          .catch(() => {});
      }
    }, [refreshKey, userId, isGuest]);

  // Merge personalized + random items and shuffle when either updates
  useEffect(() => {
    if (items.length === 0) return;
    const seenIds = new Set(items.map((item) => item.id));
    const uniqueRandom = randomItems.filter((item) => !seenIds.has(item.id));
    const merged = [...items, ...uniqueRandom];
    for (let i = merged.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [merged[i], merged[j]] = [merged[j], merged[i]];
    }
    setMergedItems(merged);
  }, [items, randomItems]);

  useEffect(() => {
    const loadFallback = () =>
      fetch(`${API_BASE}/for-you`)
        .then((r) => r.json())
        .then((d: ForYouItem[]) => {
          setItems(d);
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });

    setLoading(true);
    setError(null);

    if (isGuest) {
      if (seedObjectIds.length === 0) {
        loadFallback();
        return;
      }
      fetch(
        `${API_BASE}/artworks/by-ids?ids=${encodeURIComponent(seedObjectIds.join(","))}`,
      )
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((d: ArtworkFromAPI[]) => {
          setItems(
            d.map((a) => ({
              id: a.artwork_id,
              title: a.title ?? "Untitled",
              about: a.description ?? "",
              imageUrl: a.image_url,
              classification: a.classification,
              department: a.department,
              displaydate: a.displaydate,
              displaymaker: a.displaymaker,
              on_view: a.on_view,
            })),
          );
          setLoading(false);
        })
        .catch(loadFallback);
      return;
    }
    if (!userId) {
      loadFallback();
      return;
    }

    fetch(`${API_BASE}/for-you/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: ForYouItem[]) => {
        setItems(d);
        setLoading(false);
      })
      .catch(loadFallback);
  }, [isGuest, seedObjectIds, userId]);

  const handleSearch = (q: string) => {
    setVisibleCount(10);
    setSearchLoading(true);
    fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d: ForYouItem[]) => {
        setSearchResults(d);
        setSearchLoading(false);
      })
      .catch(() => setSearchLoading(false));
  };
  const handleClear = () => {
    setSearchResults(null);
    setFilterResults(null);
    setVisibleCount(10);
  };
  const handleFiltersChange = (filters: string[]) => {
    setActiveFilters(filters);
    setVisibleCount(10);
    if (!filters.length) {
      setFilterResults(null);
      return;
    }
    fetch(`${API_BASE}/search?q=${encodeURIComponent(filters.join(" "))}`)
      .then((r) => r.json())
      .then((d: ForYouItem[]) => setFilterResults(d))
      .catch(() => setFilterResults(null));
  };

  const displayItems = searchResults ?? filterResults ?? mergedItems;
  const isSearching = searchResults !== null || filterResults !== null;
  const visibleItems = isSearching
    ? displayItems.slice(0, visibleCount)
    : displayItems;

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

  // ── Tour-aware interaction handlers ──────────────────────────────────────
  const handleToggleFavorite = (id: number) => {
    const isNewLike = !favorites.includes(id);
    onToggleFavorite(id);
    if (tourActive && tourStep === "like-photos" && isNewLike) {
      dispatchTourEvent(TOUR_EVENTS.FAVORITE_TOGGLED);
    }
  };

  const handleOpenModal = (item: ForYouItem) => {
    setModalItem(toExhibitItem(item));
    if (tourActive && tourStep === "open-modals") {
      dispatchTourEvent(TOUR_EVENTS.MODAL_OPENED);
    }
    onRecordView?.(item.id);
  };

  // Modal must appear above the tour popover (9010) so the user can interact with it
  const modalZ = tourActive && tourStep === "open-modals" ? 9020 : undefined;

  return (
    <div
      data-tour="home-page"
      style={{
        padding: "0px 20px 100px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: theme.colors.bg,
          paddingTop: 16,
          paddingBottom: 8,
          marginBottom: 8,
        }}
      >
        <h1
          data-tour="for-you-heading"
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: theme.components.badge.text,
          }}
        >
          {isSearching ? "Search Results" : "Home"}
        </h1>
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
      </div>

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
          : "For You Page: Curated according to your preferences"}
      </p>

      {!isSearching && topTags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8,
          marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            color: theme.components.badge.mutedText }}>
            Your taste:
          </span>
          {topTags.map((tag) => (
            <span key={tag} style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: theme.components.button.primaryText,
              background: theme.components.button.primaryBackground,
              borderRadius: 20, padding: "3px 10px",
              textTransform: "capitalize" as const,
              letterSpacing: "0.02em",
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

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
          data-tour="artwork-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              {...(index === 0 ? { "data-tour": "artwork-card" } : {})}
              onClick={() => handleOpenModal(item)}
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
                <button
                  {...(index === 0 ? { "data-tour": "favorite-btn" } : {})}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(item.id);
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
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "center" }}
        >
          <button
            onClick={() => setVisibleCount((p) => p + 10)}
            style={{
              padding: "10px 24px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
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
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setModalItem(null)}
          onRecordView={onRecordView}
          userId={userId}
          // Elevate modal above tour popover during open-modals step
          zIndex={modalZ}
        />
      )}
    </div>
  );
}
