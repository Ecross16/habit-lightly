const LIGHT_MESSAGES = [
  "Shine like you're solar-powered ☀️",
  "Brightness isn’t just a theme — it's your energy.",
  "The path is clear, the light is yours — walk it boldly.",
];

const DARK_MESSAGES = [
  "Even in the shadows, you radiate purpose.",
  "Night mode: activated. So is your ambition.",
  "Stars shine brightest when the world is darkest.",
];

export function getMessageForUser(userId: string): string {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const source = prefersDark ? DARK_MESSAGES : LIGHT_MESSAGES;
  const index = userId.length % source.length;
  return source[index];
}