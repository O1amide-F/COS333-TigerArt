import type { CSSProperties } from "react";
import { theme } from "../theme";

type PlaceholderProps = {
  style?: CSSProperties;
  label?: string;
  aspectRatio?: string;
};

export function Placeholder({
  style = {},
  label = "Image",
  aspectRatio = "4/3",
}: PlaceholderProps) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.components.placeholder.gradientStart} 0%, ${theme.components.placeholder.gradientEnd} 100%)`,
        aspectRatio,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.components.placeholder.label,
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.05em",
        borderRadius: 4,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
