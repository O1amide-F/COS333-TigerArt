import type { LucideIcon } from "lucide-react";

export type NavId = "home" | "explore" | "favorites" | "news" | "settings";

export type Screen =
  | "login"
  | "survey"
  | "home"
  | "explore"
  | "exhibitDetail"
  | "favorites"
  | "news"
  | "settings";

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
  displaymaker?: string;
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
  displaymaker?: string;
  on_view?: boolean;
};

export type NewsItem = {
  id: number;
  name: string;
  sub: string;
};
