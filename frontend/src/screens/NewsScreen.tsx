import { Placeholder } from "../components/Placeholder";
import { NEWS_ITEMS } from "../data";
import { theme } from "../theme";

export function NewsScreen() {
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Page title component for the news feed. */}
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

      {/* News list component rendered from data items. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {NEWS_ITEMS.map((item, index) => (
          // One news article card component.
          <div key={item.id}>
            <Placeholder label="Image" aspectRatio="16/7" />
            <div style={{ padding: "12px 0 16px" }}>
              {/* News headline badge component. */}
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
                {item.name}
              </div>
              {/* Decorative metadata line component under headline. */}
              <div
                style={{
                  width: 100,
                  height: 5,
                  background: theme.components.divider.color,
                  borderRadius: 3,
                }}
              />
            </div>
            {/* Divider component between articles. */}
            {index < NEWS_ITEMS.length - 1 && (
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
