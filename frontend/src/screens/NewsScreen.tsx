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
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <h1
        data-tour="news-heading"
        style={{
          margin: "0 0 4px",
          fontSize: 24,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: theme.components.badge.text,
          background: theme.components.badge.background,
          display: "block",
          padding: "8px 14px",
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        Latest News
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            {...(index === 0 ? { "data-tour": "news-article" } : {})}
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

            <div style={{ padding: "12px 0 16px" }}>
              <div
                style={{
                  background: theme.components.badge.background,
                  display: "inline-block",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: theme.components.badge.text,
                  marginBottom: 6,
                }}
              >
                {item.title}
              </div>

              {item.publishedDate && (
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#666",
                    marginBottom: 8,
                  }}
                >
                  {item.publishedDate}
                </div>
              )}

              {item.articleUrl && (
                <a
                  href={item.articleUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    color: theme.components.badge.text,
                    textDecoration: "none",
                    marginBottom: 8,
                  }}
                >
                  Read Article
                </a>
              )}

              <div
                style={{
                  width: 100,
                  height: 5,
                  background: theme.components.divider.color,
                  borderRadius: 3,
                }}
              />
            </div>

            {index < items.length - 1 && (
              <div
                style={{
                  borderTop: `1px solid ${theme.components.divider.color}`,
                  marginBottom: 16,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
