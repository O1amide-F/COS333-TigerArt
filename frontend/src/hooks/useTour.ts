import { useEffect, useCallback, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { NavId } from "../types";

const TOUR_STORAGE_KEY = "tigerart_tour_done";

// ─── Step groups — one per page ───────────────────────────────────────────────
// The tour navigates to each page automatically before highlighting its elements.

const STEP_GROUPS: {
  navId: NavId;
  steps: {
    element: string;
    title: string;
    description: string;
    advanceDelayMs?: number;
    requirement?: {
      minLikes?: number;
      minViews?: number;
      message: string;
    };
  }[];
}[] = [
  {
    navId: "home",
    steps: [
      {
        element: '[data-tour="search"]',
        title: "Search artworks",
        description:
          "Find pieces by title, artist, department, or classification. Results update as you type.",
      },
      {
        element: '[data-tour="nav-explore"]',
        title: "Go to Explore",
        description:
          "Tap the Explore button in the highlighted nav area to continue.",
        advanceDelayMs: 280,
      },
    ],
  },
  {
    navId: "explore",
    steps: [
      {
        element: '[data-tour="pin-btn"]',
        title: "Pin sections",
        description:
          "Tap the highlighted pin to keep your favorite section near the top.",
      },
      {
        element: '[data-tour="explore-card"]',
        title: "Open artwork cards",
        description:
          "Tap artwork cards to open details and add them to Recently Viewed.",
      },
      {
        element: '[data-tour="section-heading"]',
        title: "Open a section",
        description:
          "Tap the highlighted section heading to open the full exhibit detail screen.",
        advanceDelayMs: 280,
      },
      {
        element: '[data-tour="exhibit-detail-heading"]',
        title: "Exhibit detail screen",
        description:
          "This is the full exhibit view with many related artworks.",
      },
      {
        element: '[data-tour="exhibit-detail-featured"]',
        title: "Browse detail artworks",
        description:
          "Tap around this page to explore more works in the exhibit.",
      },
      {
        element: '[data-tour="nav-favorites"]',
        title: "Go to Favorites",
        description:
          "Before continuing, like at least 2 artworks and open at least 2 artworks so Favorites and Recently Viewed are populated.",
        advanceDelayMs: 280,
        requirement: {
          minLikes: 2,
          minViews: 2,
          message:
            "Like at least 2 artworks and open at least 2 artworks before continuing.",
        },
      },
    ],
  },
  {
    navId: "favorites",
    steps: [
      {
        element: '[data-tour="favorites-heading"]',
        title: "Your saved collection",
        description: "This is where all your favorited artworks live.",
      },
      {
        element: '[data-tour="nav-recently-viewed"]',
        title: "Go to Recently Viewed",
        description:
          "Tap the highlighted Recently Viewed nav button to continue.",
        advanceDelayMs: 280,
      },
    ],
  },
  {
    navId: "recently_viewed",
    steps: [
      {
        element: '[data-tour="recently-viewed-card"]',
        title: "Open artwork details",
        description: "Tap the highlighted artwork card to open its details.",
        advanceDelayMs: 320,
      },
      {
        element: '[data-tour="artwork-modal-title"]',
        title: "Artwork modal",
        description: "This modal shows the full artwork details and metadata.",
      },
      {
        element: '[data-tour="artwork-modal-close"]',
        title: "Close the modal",
        description: "Tap the highlighted close button to return to the page.",
        advanceDelayMs: 220,
      },
      {
        element: '[data-tour="nav-news"]',
        title: "Go to News",
        description: "Tap the highlighted News nav button to continue.",
        advanceDelayMs: 280,
      },
    ],
  },
  {
    navId: "news",
    steps: [
      {
        element: '[data-tour="news-heading"]',
        title: "Latest news",
        description:
          "This page highlights exhibitions, events, and museum updates.",
      },
      {
        element: '[data-tour="news-article"]',
        title: "Open article summaries",
        description:
          "Use this highlighted article block to browse and open full stories.",
      },
      {
        element: '[data-tour="nav-settings"]',
        title: "Go to Settings",
        description: "Tap the highlighted Settings nav button to continue.",
        advanceDelayMs: 280,
      },
    ],
  },
  {
    navId: "settings",
    steps: [
      {
        element: '[data-tour="settings-tour-btn"]',
        title: "Replay tour anytime",
        description:
          "Use this highlighted button any time to launch the guided tour again.",
      },
    ],
  },
];

// ─── useTour ──────────────────────────────────────────────────────────────────

type UseTourOptions = {
  autoStart?: boolean;
  /** App's navigate function — used to switch pages mid-tour */
  onNavigate: (id: NavId) => void;
  getTourStats?: () => {
    favoritesCount: number;
    recentlyViewedCount: number;
  };
};

export function useTour({
  autoStart = true,
  onNavigate,
  getTourStats,
}: UseTourOptions) {
  const CONTINUE_HINT =
    "Press in the highlighted area to continue, or click Next.";

  const navigateRef = useRef(onNavigate);
  const statsRef = useRef(getTourStats);
  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);
  useEffect(() => {
    statsRef.current = getTourStats;
  }, [getTourStats]);

  const waitForElement = useCallback((selector: string, timeoutMs = 12000) => {
    return new Promise<HTMLElement | null>((resolve) => {
      const startedAt = Date.now();

      const check = () => {
        const element = document.querySelector(selector) as HTMLElement | null;
        if (element) {
          resolve(element);
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          resolve(null);
          return;
        }

        window.setTimeout(check, 100);
      };

      check();
    });
  }, []);

  const startTour = useCallback(() => {
    let stepCleanup: (() => void) | null = null;
    const likedIds = new Set<number>();
    const viewedIds = new Set<number>();

    const getProgressText = (stepRequirement?: {
      minLikes?: number;
      minViews?: number;
      message: string;
    }) => {
      if (!stepRequirement) return CONTINUE_HINT;
      const likesTarget = stepRequirement.minLikes ?? 0;
      const viewsTarget = stepRequirement.minViews ?? 0;
      const likesProgress = `${Math.min(likedIds.size, likesTarget)}/${likesTarget}`;
      const viewsProgress = `${Math.min(viewedIds.size, viewsTarget)}/${viewsTarget}`;
      return `${stepRequirement.message} (${likesProgress} likes, ${viewsProgress} opens)`;
    };

    const requirementSatisfied = (stepRequirement?: {
      minLikes?: number;
      minViews?: number;
      message: string;
    }) => {
      if (!stepRequirement) return true;
      const likesOk =
        stepRequirement.minLikes === undefined ||
        likedIds.size >= stepRequirement.minLikes;
      const viewsOk =
        stepRequirement.minViews === undefined ||
        viewedIds.size >= stepRequirement.minViews;
      return likesOk && viewsOk;
    };

    const setInlineHint = (text: string) => {
      const hintEl = document.querySelector(
        ".tigerart-tour-inline-hint",
      ) as HTMLElement | null;
      if (hintEl) hintEl.textContent = text;
    };

    const clearStepCleanup = () => {
      if (stepCleanup) {
        stepCleanup();
        stepCleanup = null;
      }
    };

    const outsideClickBlocker = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const activeElement = document.querySelector(
        ".driver-active-element",
      ) as HTMLElement | null;
      const popover = document.querySelector(
        ".driver-popover",
      ) as HTMLElement | null;
      const insideActive = Boolean(activeElement?.contains(target));
      const insidePopover = Boolean(popover?.contains(target));
      if (!insideActive && !insidePopover) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const actionTracker = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const favoriteTarget = target.closest(
        '[data-tour-track="favorite"]',
      ) as HTMLElement | null;
      if (favoriteTarget) {
        const rawId = favoriteTarget.getAttribute("data-tour-art-id");
        const parsed = rawId ? Number(rawId) : NaN;
        if (!Number.isNaN(parsed)) likedIds.add(parsed);
      }

      const viewTarget = target.closest(
        '[data-tour-track="view"]',
      ) as HTMLElement | null;
      if (viewTarget) {
        const rawId = viewTarget.getAttribute("data-tour-art-id");
        const parsed = rawId ? Number(rawId) : NaN;
        if (!Number.isNaN(parsed)) viewedIds.add(parsed);
      }
    };

    document.addEventListener("click", outsideClickBlocker, true);
    document.addEventListener("click", actionTracker, true);

    const currentStats = statsRef.current?.() ?? {
      favoritesCount: 0,
      recentlyViewedCount: 0,
    };
    const hasExistingFavorites = currentStats.favoritesCount > 0;
    const hasExistingRecent = currentStats.recentlyViewedCount > 0;

    const adaptRequirement = (stepRequirement?: {
      minLikes?: number;
      minViews?: number;
      message: string;
    }) => {
      if (!stepRequirement) return undefined;

      const likesTarget = stepRequirement.minLikes;
      const viewsTarget = stepRequirement.minViews;
      const adjustedLikes =
        likesTarget === undefined
          ? undefined
          : hasExistingFavorites
            ? Math.min(likesTarget, 1)
            : likesTarget;
      const adjustedViews =
        viewsTarget === undefined
          ? undefined
          : hasExistingRecent
            ? Math.min(viewsTarget, 1)
            : viewsTarget;

      const adjustedMessage =
        hasExistingFavorites || hasExistingRecent
          ? "You already have saved activity. Add a couple of new interactions before continuing."
          : stepRequirement.message;

      return {
        ...stepRequirement,
        minLikes: adjustedLikes,
        minViews: adjustedViews,
        message: adjustedMessage,
      };
    };

    // Build driver.js steps; attach onHighlightStarted to the FIRST step of
    // each group so the page is switched before the element is looked up.
    const allSteps = STEP_GROUPS.flatMap((group) =>
      group.steps.map((step, localIdx) => {
        return {
          element: step.element,
          popover: {
            title: step.title,
            description: step.description,
            side: "bottom" as const,
            align: "start" as const,
          },
          onHighlightStarted: () => {
            // Navigate when entering the first step of a new group
            if (localIdx === 0) {
              navigateRef.current(group.navId);
            }
          },
          advanceDelayMs: step.advanceDelayMs,
          requirement: adaptRequirement(step.requirement),
        };
      }),
    );

    const driverObj = driver({
      animate: true,
      overlayColor: "rgba(0,0,0,0.62)",
      overlayOpacity: 1,
      smoothScroll: true,

      // Prevent any click outside the highlighted element from doing anything
      allowClose: true,
      disableActiveInteraction: false,

      showProgress: true,
      progressText: "{{current}} of {{total}}",
      showButtons: ["previous", "next", "close"],
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",

      popoverClass: "tigerart-tour-popover",
      steps: allSteps,

      onPopoverRender: (popover, { driver: internalDriver }) => {
        const footer =
          popover.footer ??
          (popover.wrapper?.querySelector(
            ".driver-popover-footer",
          ) as HTMLElement | null);
        if (!footer) return;
        const existingButton = footer.querySelector(
          ".tigerart-tour-finish-btn",
        );
        if (existingButton) return;

        const finishButton = document.createElement("button");
        finishButton.type = "button";
        finishButton.className = "tigerart-tour-finish-btn";
        finishButton.textContent = "Finish Tour";
        finishButton.addEventListener("click", () => {
          internalDriver.destroy();
        });
        footer.appendChild(finishButton);

        const description =
          popover.description ??
          (popover.wrapper?.querySelector(
            ".driver-popover-description",
          ) as HTMLElement | null);
        if (!description) return;
        const existingHint = popover.wrapper?.querySelector(
          ".tigerart-tour-inline-hint",
        );
        if (existingHint) return;

        const hint = document.createElement("div");
        hint.className = "tigerart-tour-inline-hint";
        hint.textContent = CONTINUE_HINT;
        description.insertAdjacentElement("afterend", hint);
      },

      onNextClick: (_element, _step, { state }) => {
        const activeIdx = state.activeIndex ?? 0;
        const currentStep = allSteps[activeIdx];
        if (!requirementSatisfied(currentStep.requirement)) {
          setInlineHint(getProgressText(currentStep.requirement));
          return;
        }

        const nextIdx = activeIdx + 1;
        if (nextIdx >= allSteps.length) {
          driverObj.destroy();
          return;
        }

        const nextSelector = allSteps[nextIdx].element;
        if (document.querySelector(nextSelector)) {
          setInlineHint(CONTINUE_HINT);
          driverObj.moveNext();
          return;
        }

        clearStepCleanup();
        const activeElement = document.querySelector(
          ".driver-active-element",
        ) as HTMLElement | null;
        if (activeElement) {
          activeElement.click();
        }

        const delay = allSteps[activeIdx].advanceDelayMs ?? 220;
        setTimeout(() => {
          void waitForElement(nextSelector, 1800).then((nextEl) => {
            if (nextEl) {
              setInlineHint(CONTINUE_HINT);
              driverObj.moveNext();
              return;
            }
            setInlineHint("Press in the highlighted area to continue.");
          });
        }, delay);
      },

      onHighlighted: (element, _step, { state }) => {
        clearStepCleanup();
        if (!(element instanceof HTMLElement)) return;
        const activeIdx = state.activeIndex ?? 0;
        const activeStep = allSteps[activeIdx];
        const isLast = activeIdx >= allSteps.length - 1;
        setInlineHint(
          isLast
            ? "Click Finish Tour when you are ready to exit."
            : getProgressText(activeStep.requirement),
        );

        const onElementClick = () => {
          if (isLast) return;
          if (!requirementSatisfied(activeStep.requirement)) {
            setInlineHint(getProgressText(activeStep.requirement));
            return;
          }
          const delay = allSteps[activeIdx].advanceDelayMs ?? 140;
          setTimeout(() => {
            driverObj.moveNext();
          }, delay);
        };

        element.addEventListener("click", onElementClick, { once: true });
        stepCleanup = () => {
          element.removeEventListener("click", onElementClick);
        };
      },

      onDestroyed: () => {
        clearStepCleanup();
        document.removeEventListener("click", outsideClickBlocker, true);
        document.removeEventListener("click", actionTracker, true);
      },

      onDestroyStarted: () => {
        clearStepCleanup();
        document.removeEventListener("click", outsideClickBlocker, true);
        document.removeEventListener("click", actionTracker, true);
        localStorage.setItem(TOUR_STORAGE_KEY, "1");
        if (driverObj.isActive()) {
          driverObj.destroy();
        }
      },
    });

    // Navigate to the first page, then wait until the first spotlight target exists.
    navigateRef.current(STEP_GROUPS[0].navId);
    void waitForElement(STEP_GROUPS[0].steps[0].element).then((element) => {
      if (!element) return;
      driverObj.drive();
    });
  }, [waitForElement]);

  // Auto-start on first visit only
  useEffect(() => {
    if (!autoStart) return;
    const seen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (seen) return;
    const t = setTimeout(() => startTour(), 900);
    return () => clearTimeout(t);
  }, [autoStart, startTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, []);

  return { startTour, resetTour };
}
