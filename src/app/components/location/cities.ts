export interface ServedCity {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const SERVED_CITIES: ServedCity[] = [
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { slug: "delhi", name: "Delhi NCR", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { slug: "bangalore", name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { slug: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { slug: "kanpur", name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { slug: "noida", name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
];

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "lucknow";
}
