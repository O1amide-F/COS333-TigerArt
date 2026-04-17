// ── Shared tag-to-field matching ──────────────────────────────────────────────
// Maps our internal tag names to the raw classification/department values
// that come back from the API.

const TAG_CLASSIFICATION_MAP: Record<string, string[]> = {
    painting:     ["paintings", "painting"],
    sculpture:    ["sculpture"],
    drawing:      ["drawings", "drawing"],
    print:        ["prints", "print"],
    photography:  ["photographs", "photography"],
    textile:      ["textiles", "textile"],
    decorative:   ["ceramic", "ceramics", "metal", "glass"],
    artifact:     ["masks", "ivories", "weapons and armor", "bone", "faience"],
  };
  
  const TAG_DEPARTMENT_MAP: Record<string, string[]> = {
    european:                      ["prints and drawings", "european painting and sculpture"],
    asian:                         ["asian art"],
    african_oceanic:               ["african and oceanic art"],
    american:                      ["american art"],
    ancient_americas:              ["art of the ancient americas"],
    ancient_mediterranean_islamic: ["ancient, byzantine, and islamic art"],
    modern_global:                 ["photography", "photography archives", "modern and contemporary art"],
  };
  
  // Era tags are matched against displaydate — reuse parse_era logic approximation
  const ERA_KEYWORDS: Record<string, string[]> = {
    ancient:       ["b.c", "bce", "bc"],
    medieval:      ["5th century", "6th century", "7th century", "8th century",
                    "9th century", "10th century", "11th century", "12th century",
                    "13th century", "14th century"],
    early_modern:  ["15th century", "16th century", "17th century"],
    "19th_century":["18th century", "19th century"],
    early_20th:    ["early 20th", "late 19th", "1900", "1901", "1902", "1903",
                    "1904", "1905", "1906", "1907", "1908", "1909", "191", "192",
                    "193", "1940", "1941", "1942", "1943", "1944", "1945"],
    modern:        ["1946", "1947", "1948", "1949", "195", "196", "197", "198",
                    "199", "200", "201", "202", "late 20th", "21st century"],
  };
  
  type FilterableItem = {
    classification?: string | null;
    department?: string | null;
    displaydate?: string | null;
  };
  
  function itemMatchesTag(item: FilterableItem, tag: string): boolean {
    const clf = (item.classification ?? "").toLowerCase();
    const dept = (item.department ?? "").toLowerCase();
    const date = (item.displaydate ?? "").toLowerCase();
  
    if (TAG_CLASSIFICATION_MAP[tag]) {
      return TAG_CLASSIFICATION_MAP[tag].some((v) => clf.includes(v));
    }
    if (TAG_DEPARTMENT_MAP[tag]) {
      return TAG_DEPARTMENT_MAP[tag].some((v) => dept.includes(v));
    }
    if (ERA_KEYWORDS[tag]) {
      return ERA_KEYWORDS[tag].some((v) => date.includes(v));
    }
    return false;
  }
  
  // Returns true if the item matches ALL active filters (AND logic)
  export function itemMatchesFilters(
    item: FilterableItem,
    activeFilters: string[]
  ): boolean {
    if (activeFilters.length === 0) return true;
    return activeFilters.every((tag) => itemMatchesTag(item, tag));
  }
  