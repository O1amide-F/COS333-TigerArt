import type { CSSProperties } from "react";
import { C } from "../theme";

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
        background: `linear-gradient(135deg, ${C.surface} 0%, #E8E6E1 100%)`,
        aspectRatio,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.muted,
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
