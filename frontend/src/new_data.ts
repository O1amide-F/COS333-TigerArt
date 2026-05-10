import { Compass, Heart, House, Newspaper, Settings, Clock } from "lucide-react";
import type { ExhibitSection, ForYouItem, NavItem, NewsItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: House, label: "Home" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "favorites", icon: Heart, label: "Favorites" },
  { id: "news", icon: Newspaper, label: "News" },
  { id: "recently_viewed", icon: Clock, label: "Recently Viewed" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const SURVEY_IMAGES = [1, 2, 3, 4, 5, 6];

const API_BASE = '/api';

export async function getForYouItems(): Promise<ForYouItem[]> {
  const response = await fetch(`${API_BASE}/for-you`);
  return await response.json();
}

export async function getExhibitSections(): Promise<ExhibitSection[]> {
  const response = await fetch(`${API_BASE}/exhibits`);
  return await response.json();
}

export async function getNewsItems(): Promise<NewsItem[]> {
  const response = await fetch(`${API_BASE}/news`);
  return await response.json();
}