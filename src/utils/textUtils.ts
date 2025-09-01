/**
 * Utility functions for text processing and font detection
 */

/**
 * Detects if the given text contains Khmer Unicode characters
 * @param text - The text to analyze
 * @returns true if text contains Khmer characters, false otherwise
 */
export const isKhmerText = (text: string): boolean => {
  if (!text) return false;
  // Khmer Unicode range: U+1780 to U+17FF
  // This includes:
  // - Khmer consonants (U+1780-U+17A2)
  // - Khmer vowels (U+17A3-U+17DD)
  // - Khmer symbols and numerals (U+17E0-U+17EF)
  // - Khmer lunar date symbols (U+17F0-U+17F9)
  // - Additional Khmer characters (U+17FA-U+17FF)
  const khmerRegex = /[\u1780-\u17FF]/;
  return khmerRegex.test(text);
};

/**
 * Detects the primary script/language of a text string
 * @param text - The text to analyze
 * @returns The detected script type
 */
export const detectTextScript = (
  text: string
): "khmer" | "latin" | "mixed" | "other" => {
  if (!text) return "other";

  const khmerChars = (text.match(/[\u1780-\u17FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;

  if (totalChars === 0) return "other";

  const khmerRatio = khmerChars / totalChars;
  const latinRatio = latinChars / totalChars;

  if (khmerRatio > 0.5) return "khmer";
  if (latinRatio > 0.5) return "latin";
  if (khmerChars > 0 && latinChars > 0) return "mixed";

  return "other";
};

/**
 * Gets the appropriate font family based on text content
 * @param text - The text content
 * @param khmerFont - Font to use for Khmer text
 * @param defaultFont - Font to use for non-Khmer text (Inter by default)
 * @returns The appropriate font family
 */
export const getFontForText = (
  text: string,
  khmerFont: string = "KantumruyPro_400Regular",
  defaultFont: string = "Inter_400Regular"
): string => {
  return isKhmerText(text) ? khmerFont : defaultFont;
};
