import type { LucideIcon } from "lucide-react";

export type NavId =
  | "home"
  | "explore"
  | "favorites"
  | "news"
  | "settings"
  | "recently_viewed";

export type Screen =
  | "login"
  | "survey"
  | "home"
  | "explore"
  | "exhibitDetail"
  | "favorites"
  | "news"
  | "settings"
  | "recently_viewed";

export type NavItem = {
  id: NavId;
  icon: LucideIcon;
  label: string;
};

export type ExhibitItem = {
  id: number;
  name: string;
  desc: string;
  imageUrl?: string;
  // new detail fields for modal
  department?: string;
  classification?: string;
  displaydate?: string;
  displaymaker?: string | "Unknown";
  gallery_label_text?: string;
  on_view?: boolean;
};

export type ExhibitSection = {
  name: string;
  items: ExhibitItem[];
};

export type ForYouItem = {
  id: number;
  title: string;
  about: string;
  imageUrl?: string;
  // new — matches ExhibitItem detail fields
  department?: string;
  classification?: string;
  displaydate?: string;
  displaymaker?: string | "Unknown";
  gallery_label_text?: string;
  on_view?: boolean;
};

export type NewsItem = {
  id: number;
  uuid: string;
  title: string;
  publishedDate: string | null;
  imageUrl: string | null;
  articleUrl: string | null;
};
