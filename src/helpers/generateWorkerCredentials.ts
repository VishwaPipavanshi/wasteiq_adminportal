import crypto from "crypto";

/**
 * Generates a random, human-readable password.
 * Excludes ambiguous characters like 0/O, 1/l/I.
 */
export const generatePassword = (length: number = 10): string => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const specials = "@#$!";
  const all = uppercase + lowercase + digits + specials;

  // Ensure at least one character from each category
  const mandatory = [
    uppercase[crypto.randomInt(uppercase.length)],
    lowercase[crypto.randomInt(lowercase.length)],
    digits[crypto.randomInt(digits.length)],
    specials[crypto.randomInt(specials.length)],
  ];

  const rest = Array.from({ length: length - 4 }, () => {
    const bytes = crypto.randomBytes(1);
    return all[bytes[0] % all.length];
  });

  // Shuffle the combined array
  const combined = [...mandatory, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
};
