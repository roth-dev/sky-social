/**
 * Google Translate API integration for translating post content
 */

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

interface TranslationResult {
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage: string;
  success: boolean;
  error?: string;
}

class TranslationService {
  private readonly apiKey: string | null;
  private readonly baseUrl =
    "https://translation.googleapis.com/language/translate/v2";

  constructor() {
    // In a real app, this should come from environment variables
    // For now, we'll use a placeholder that needs to be configured
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || null;
  }

  /**
   * Translate text using Google Translate API
   */
  async translateText(
    text: string,
    targetLanguage: string = "en",
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    if (!this.apiKey) {
      return {
        translatedText: text,
        targetLanguage,
        success: false,
        error: "Google Translate API key not configured",
      };
    }

    if (!text.trim()) {
      return {
        translatedText: text,
        targetLanguage,
        success: false,
        error: "No text to translate",
      };
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        q: text,
        target: targetLanguage,
        format: "text",
      });

      if (sourceLanguage) {
        params.append("source", sourceLanguage);
      }

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Translation API error: ${response.status} ${response.statusText}`
        );
      }

      const data: TranslationResponse = await response.json();

      if (!data.data?.translations?.[0]) {
        throw new Error("Invalid response from translation API");
      }

      const translation = data.data.translations[0];

      return {
        translatedText: translation.translatedText,
        sourceLanguage: translation.detectedSourceLanguage || sourceLanguage,
        targetLanguage,
        success: true,
      };
    } catch (error) {
      console.error("Translation error:", error);
      return {
        translatedText: text,
        targetLanguage,
        success: false,
        error: error instanceof Error ? error.message : "Translation failed",
      };
    }
  }

  /**
   * Detect the language of the given text
   */
  async detectLanguage(
    text: string
  ): Promise<{ language: string; confidence: number } | null> {
    if (!this.apiKey || !text.trim()) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        q: text,
      });

      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?${params}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Language detection error: ${response.status}`);
      }

      const data = await response.json();
      const detection = data.data?.detections?.[0]?.[0];

      if (detection) {
        return {
          language: detection.language,
          confidence: detection.confidence,
        };
      }

      return null;
    } catch (error) {
      console.error("Language detection error:", error);
      return null;
    }
  }

  /**
   * Get user's preferred language from system settings
   */
  getUserLanguage(): string {
    // Try to get language from system locale
    if (typeof navigator !== "undefined" && navigator.language) {
      return navigator.language.split("-")[0]; // Get just the language code
    }

    // Fallback for React Native
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      try {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        return locale.split("-")[0];
      } catch (error) {
        console.warn("Could not detect user locale:", error);
      }
    }

    return "en"; // Default fallback
  }

  /**
   * Check if translation is needed (source language different from target)
   */
  isTranslationNeeded(sourceLanguage: string, targetLanguage: string): boolean {
    return sourceLanguage.toLowerCase() !== targetLanguage.toLowerCase();
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Export types for use in components
export type { TranslationResult };
