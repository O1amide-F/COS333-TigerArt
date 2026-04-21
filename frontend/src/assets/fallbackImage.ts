export const PUAMLogoRect = new URL("./PUAMLogoRect.jpg", import.meta.url).href;
export const PUAMLogoSquare = new URL("./PUAMLogoSquare.png", import.meta.url)
  .href;

// Backward-compatible default for callers that only need a generic fallback.
export const PUAMLogo = PUAMLogoSquare;

export function getFallbackImageForAspect(aspectRatio: string): string {
  void aspectRatio;

  // Always use the square logo. The caller controls sizing with contain-fit,
  // so any unused space can show the background color behind it.
  return PUAMLogoSquare;
}
