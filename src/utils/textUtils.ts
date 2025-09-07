/**
 * Utility functions for text processing and font detection
 */

import React from "react";

/**
 * Cache for isKhmerText results to avoid repeated regex checks
 */
const khmerTextCache = new Map<string, boolean>();
const CACHE_MAX_SIZE = 1000; // Prevent memory leaks

/**
 * Detects if the given text contains Khmer Unicode characters
 * @param text - The text to analyze
 * @returns true if text contains Khmer characters, false otherwise
 */
export const isKhmerText = (text: string): boolean => {
  if (!text) return false;

  // Check cache first
  if (khmerTextCache.has(text)) {
    return khmerTextCache.get(text)!;
  }

  // Clear cache if it gets too large
  if (khmerTextCache.size >= CACHE_MAX_SIZE) {
    khmerTextCache.clear();
  }

  // Khmer Unicode range: U+1780 to U+17FF
  // This includes:
  // - Khmer consonants (U+1780-U+17A2)
  // - Khmer vowels (U+17A3-U+17DD)
  // - Khmer symbols and numerals (U+17E0-U+17EF)
  // - Khmer lunar date symbols (U+17F0-U+17F9)
  // - Additional Khmer characters (U+17FA-U+17FF)
  const khmerRegex = /[\u1780-\u17FF]/;
  const result = khmerRegex.test(text);

  // Cache the result
  khmerTextCache.set(text, result);

  return result;
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

/**
 * Cache for text extraction results to avoid repeated processing
 */
const textExtractionCache = new Map<React.ReactNode, string>();
const TEXT_CACHE_MAX_SIZE = 500; // Prevent memory leaks

/**
 * Extracts text content from React elements, including Trans components
 * @param children - React children (can be strings, numbers, React elements, etc.)
 * @returns The extracted text content as a string
 */
export const extractTextFromReactChildren = (
  children: React.ReactNode
): string => {
  // Quick return for simple cases
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  // Check cache for complex objects (but not for primitives)
  if (typeof children === "object" && children !== null) {
    if (textExtractionCache.has(children)) {
      return textExtractionCache.get(children)!;
    }
  }

  let result = "";

  if (Array.isArray(children)) {
    result = children.map(extractTextFromReactChildren).join("");
  } else if (React.isValidElement(children)) {
    // Handle React elements with type safety
    const props = children.props as { children?: React.ReactNode };
    if (props && props.children) {
      result = extractTextFromReactChildren(props.children);
    }
  }

  // Cache the result if it's a complex object
  if (typeof children === "object" && children !== null) {
    // Clear cache if it gets too large
    if (textExtractionCache.size >= TEXT_CACHE_MAX_SIZE) {
      textExtractionCache.clear();
    }
    textExtractionCache.set(children, result);
  }

  return result;
};
