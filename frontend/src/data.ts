import {
  Clock,
  Compass,
  Heart,
  House,
  Newspaper,
  Settings,
} from "lucide-react";
import type { ExhibitSection, ForYouItem, NavItem, NewsItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: House, label: "Home" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "favorites", icon: Heart, label: "Favorites" },
  { id: "recently_viewed", icon: Clock, label: "Recently Viewed" },
  { id: "news", icon: Newspaper, label: "News" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const SURVEY_IMAGES = [1, 2, 3, 4, 5, 6];

export const FOR_YOU_ITEMS: ForYouItem[] = [
  {
    id: 1,
    title: "Starlight Composition",
    about: "Oil on canvas - 2024 - Emily Chen",
  },
  {
    id: 2,
    title: "Urban Geometry",
    about: "Digital print - 2023 - Marcus Webb",
  },
  { id: 3, title: "Tidal Memory", about: "Watercolor - 2024 - Sofia Reyes" },
  { id: 4, title: "Fracture Lines", about: "Mixed media - 2023 - James Park" },
];

export const EXHIBIT_SECTIONS: ExhibitSection[] = [
  {
    name: "Contemporary Works",
    items: [
      { id: 1, name: "Solitude I", desc: "Oil on canvas" },
      { id: 2, name: "Refraction", desc: "Digital print" },
      { id: 3, name: "Ember Study", desc: "Charcoal" },
      { id: 4, name: "Drift", desc: "Watercolor" },
    ],
  },
  {
    name: "Photography Collection",
    items: [
      { id: 5, name: "Street No. 7", desc: "Silver gelatin" },
      { id: 6, name: "Portrait II", desc: "Digital" },
      { id: 7, name: "Architecture", desc: "C-print" },
      { id: 8, name: "Abstract Light", desc: "Long exposure" },
    ],
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    name: "Princeton Art Museum Opens New Wing",
    sub: "Featuring contemporary works from emerging artists",
  },
  {
    id: 2,
    name: "Student Exhibition: Semester Showcase",
    sub: "Over 40 students present original work this Friday",
  },
  {
    id: 3,
    name: "Artist Talk: Digital Futures",
    sub: "Panel discussion on AI and artistic practice",
  },
  {
    id: 4,
    name: "New Acquisitions Announced",
    sub: "Museum collection grows with 12 new pieces",
  },
];
