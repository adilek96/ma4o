export const interests = [
  "sports",
  "music",
  "movies",
  "books",
  "travel",
  "cooking",
  "art",
  "technology",
  "nature",
  "photography",
  "dancing",
  "yoga",
  "gaming",
  "fashion",
  "cars",
  "animals",
] as const;

export type Interest = typeof interests[number];
