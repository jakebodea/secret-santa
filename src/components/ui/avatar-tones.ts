const AVATAR_FALLBACK_TONES = ["primary", "secondary", "accent"] as const;

export type AvatarFallbackTone = (typeof AVATAR_FALLBACK_TONES)[number];

export function avatarFallbackToneForId(id: string): AvatarFallbackTone {
  let hash = 0;
  for (const char of id) {
    hash = (hash + (char.codePointAt(0) ?? 0)) % AVATAR_FALLBACK_TONES.length;
  }
  return AVATAR_FALLBACK_TONES[hash] ?? "primary";
}
