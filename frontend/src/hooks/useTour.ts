import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { tourSteps } from "./tourSteps.ts";

const TOUR_STORAGE_KEY = "tigerart_tour_done";

// ─── useTour ────────────────────────────────────────────────────────────────
// Drop this hook into App.tsx (or your top-level shell component).
//
// It automatically starts the tour on first visit.
// It also returns a `startTour` function so you can wire up a
// "Take the tour" button in a Help menu or Profile screen.
//
// Usage:
//   const { startTour } = useTour({ autoStart: true });
//   <button onClick={startTour}>Take the tour</button>

type UseTourOptions = {
  /** Run the tour automatically the first time a user visits. Default: true */
  autoStart?: boolean;
};

export function useTour({ autoStart = true }: UseTourOptions = {}) {
  const startTour = useCallback(() => {
    const driverObj = driver({
      // ── Appearance ──────────────────────────────────────────────────────
      animate: true,
      overlayColor: "rgba(0, 0, 0, 0.55)",
      overlayOpacity: 1,
      smoothScroll: true,
      allowClose: true,

      // ── Progress & controls ─────────────────────────────────────────────
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Done",

      // ── Popover styling — matches TigerArt's DM Sans + Princeton palette ─
      popoverClass: "tigerart-tour-popover",

      steps: tourSteps,

      // Mark tour as done when the user finishes or closes it
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "1");
        driverObj.destroy();
      },
    });

    driverObj.drive();
  }, []);

  // Auto-start on first visit
  useEffect(() => {
    if (!autoStart) return;
    const alreadySeen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (alreadySeen) return;

    // Small delay so the app finishes its initial render before the overlay fires
    const timeout = setTimeout(() => {
      startTour();
    }, 800);

    return () => clearTimeout(timeout);
  }, [autoStart, startTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, []);

  return { startTour, resetTour };
}
