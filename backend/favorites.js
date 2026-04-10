const BASE = "http://localhost:5001/api";

export async function getFavoriteIds(userId) {
  const res = await fetch(`${BASE}/favorites/${userId}/ids`);
  return res.json(); // number[]
}

export async function getFavorites(userId) {
  const res = await fetch(`${BASE}/favorites/${userId}`);
  return res.json(); // artwork objects[]
}

export async function addFavorite(userId, artworkId) {
  await fetch(`${BASE}/favorites/${userId}/${artworkId}`, { method: "POST" });
}

export async function removeFavorite(userId, artworkId) {
  await fetch(`${BASE}/favorites/${userId}/${artworkId}`, { method: "DELETE" });
}
