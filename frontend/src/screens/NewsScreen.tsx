import { useEffect, useState } from "react";
import { Placeholder } from "../components/Placeholder";
import { getFallbackImageForAspect } from "../assets/fallbackImage";
import { getNewsItems } from "../new_data";
import type { NewsItem } from "../types";
import { theme } from "../theme";

export function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    getNewsItems()
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching news items:", error));
  }, []);

  return (
    <div
      style={{ padding: "0px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* ── Sticky header: title only ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 20,
        background: theme.colors.bg, paddingBottom: 8, paddingTop:16, marginBottom: 8 }}>
        <h1
          data-tour="news-heading"
          style={{
            margin: 0,
            fontSize: 24,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: theme.components.badge.text,
          }}
        >
          Latest News
        </h1>
      </div>

  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {items.map((item, index) => (
      <div
        key={item.id}
        {...(index === 0 ? { "data-tour": "news-article" } : {})}
        style={{
          border: `1px solid ${theme.components.divider.color}`,
          borderRadius: 12,
          overflow: "hidden",
          background: theme.components.card.background,
        }}
      >
        <div style={{ position: "relative" }}>
          {item.imageUrl ? (
            <>
              <img
                src={item.imageUrl.replace("http://", "https://")}
                alt={item.title}
                style={{
                  width: "100%",
                  aspectRatio: "16/7",
                  objectFit: "contain",
                  backgroundColor: theme.components.image.newsBackground,
                  display: "block",
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackImageForAspect("16/7");
                }}
              />
              <div style={{ display: "none" }}>
                <Placeholder
                  label="Unable to Render Image"
                  aspectRatio="16 / 7"
                  style={{
                    borderRadius: 0,
                    backgroundColor: theme.components.image.newsBackground,
                  }}
                />
              </div>
            </>
          ) : (
            <Placeholder
              label="Unable to Render Image"
              aspectRatio="16 / 7"
              style={{
                borderRadius: 0,
                backgroundColor: theme.components.image.newsBackground,
              }}
            />
          )}
        </div>

        <div style={{ padding: "12px 16px 16px" }}>
          <div
            style={{
              fontSize: 22,
              margin: "0 0 8px",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              color: theme.components.badge.text,
              marginBottom: 8,
              lineHeight: 1.25,
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              color: theme.components.badge.text,
              opacity: 0.75,
              marginBottom: 12,
            }}
          >
            {item.publishedDate}
          </div>

          {item.articleUrl && (
            <a
              href={item.articleUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                fontSize: 18,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: theme.components.badge.text,
                textDecoration: "none",
              }}
            >
              Read More →
            </a>
          )}
        </div>
      </div>
    ))}
  </div>
  </div>
  );
}
