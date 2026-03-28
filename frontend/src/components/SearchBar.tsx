import { Search } from "lucide-react";
import { theme } from "../theme";

export function SearchBar() {
  return (
    <div
      style={{
        background: theme.components.badge.background,
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <Search
        size={16}
        strokeWidth={2}
        color={theme.components.badge.mutedText}
      />
      <span
        style={{
          color: theme.components.badge.mutedText,
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Search
      </span>
    </div>
  );
}
