export const languages = [
  "ru",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "zh",
  "ja",
  "ko",
  "ar",
  "pt",
  "tr",
  "pl",
  "cs",
  "hu",
  "fi",
  "sv",
  "no",
  "da",
  "nl",
] as const;

export type Language = typeof languages[number];
