export const PUAMLogoRect = new URL("./PUAMLogoRect.jpg", import.meta.url).href;
export const PUAMLogoSquare = new URL("./PUAMLogoSquare.png", import.meta.url)
  .href;

// Backward-compatible default for callers that only need a generic fallback.
export const PUAMLogo = PUAMLogoRect;

export function getFallbackImageForAspect(aspectRatio: string): string {
  const [rawWidth, rawHeight] = aspectRatio
    .split("/")
    .map((part) => part.trim());
  const width = Number(rawWidth);
  const height = Number(rawHeight);

  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return PUAMLogoRect;
  }

  const ratio = width / height;

  // Treat moderately portrait/landscape cards as "square-ish" so fallback crops
  // less aggressively. Reserve the rectangular logo for very wide/tall slots.
  return ratio >= 0.625 && ratio <= 1.6 ? PUAMLogoSquare : PUAMLogoRect;
}
