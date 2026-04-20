import type { CSSProperties } from "react";
import { getFallbackImageForAspect } from "../assets/fallbackImage";

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
  const fallbackSrc = getFallbackImageForAspect(aspectRatio);

  return (
    <img
      src={fallbackSrc}
      alt={label}
      style={{
        width: "100%",
        aspectRatio,
        objectFit: "cover",
        display: "block",
        borderRadius: 4,
        ...style,
      }}
    />
  );
}
