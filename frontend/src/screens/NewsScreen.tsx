import { useEffect, useState } from "react";
import { Placeholder } from "../components/Placeholder";
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
        style={{
          margin: "0 0 20px",
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          letterSpacing: "0.06em",
          color: theme.components.badge.text,
          background: theme.components.badge.background,
          display: "block",
          padding: "8px 14px",
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        LATEST NEWS
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, index) => (
          <div key={item.id}>
            <div style={{ position: "relative" }}>
              {item.imageUrl ? (
                <>
                  <img
                    src={item.imageUrl.replace("http://", "https://")}
                    alt={item.title}
                    style={{
                      width: "100%",
                      aspectRatio: "16/7",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "block";
                    }}
                  />
                  <div style={{ display: "none" }}>
                    <Placeholder
                      label="Unable to Render Image"
                      aspectRatio="16 / 7"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                </>
              ) : (
                <Placeholder
                  label="Unable to Render Image"
                  aspectRatio="16 / 7"
                  style={{ borderRadius: 0 }}
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