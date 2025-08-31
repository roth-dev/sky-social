# Google Translate Integration Setup

This guide explains how to set up Google Translate API integration for translating post content in Sky Social.

## Prerequisites

1. Google Cloud Platform account
2. Google Translate API enabled
3. API key with appropriate permissions

## Setup Instructions

### 1. Enable Google Translate API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Cloud Translation API"
5. Click "Enable"

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Restrict the API key to only the Translation API

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Replace `your_google_translate_api_key_here` with your actual API key:

```bash
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_actual_api_key_here
```

### 4. Security Best Practices

- **Never commit API keys to version control**
- Use environment variables for all API keys
- Restrict API keys to specific APIs and domains in production
- Monitor API usage and set quotas
- Rotate API keys regularly

## Features

### Translation Functionality

- **Automatic Language Detection**: Detects the source language of posts
- **Smart Translation**: Only translates when source and target languages differ
- **Toggle View**: Users can switch between original and translated text
- **Language Indicators**: Shows source → target language mapping
- **Error Handling**: Graceful fallbacks when translation fails

### User Experience

- **Loading States**: Shows "Translating..." while processing
- **Attribution**: Credits Google Translate for translations
- **Accessibility**: Proper color contrast and text sizing
- **Internationalization**: All UI text is translatable

### Supported Languages

Google Translate API supports 100+ languages. Common ones include:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Khmer (km)
- And many more...

## Usage

### For Users

1. Find a post in a foreign language
2. Tap the three-dot menu (⋯) on the post
3. Select "Translate"
4. View the translated text
5. Toggle between original and translated versions

### For Developers

The translation service is available as a singleton:

```typescript
import { translationService } from "@/lib/translator";

// Translate text
const result = await translationService.translateText(
  "Hello world",
  "es", // target language
  "en" // source language (optional)
);

// Detect language
const detection = await translationService.detectLanguage("Hello world");
```

## API Costs

Google Translate API pricing (as of 2024):

- $20 per 1 million characters
- First 500,000 characters per month are free

Monitor usage in Google Cloud Console to avoid unexpected charges.

## Error Handling

The implementation includes comprehensive error handling:

- **No API Key**: Graceful fallback with user notification
- **Network Errors**: Retry logic and user-friendly error messages
- **API Limits**: Proper error messages for quota exceeded
- **Invalid Text**: Validation before API calls

## Customization

### Default Target Language

The service automatically detects the user's language preference from:

1. Browser language (web)
2. System locale (mobile)
3. Fallback to English

### Supported Languages

To restrict available languages, modify the `translationService.translateText()` calls to validate against a whitelist.

## Troubleshooting

### Common Issues

1. **"API key not configured"**

   - Ensure `.env` file exists with correct API key
   - Restart the development server after adding environment variables

2. **"Translation API error: 403"**

   - Check if Translation API is enabled in Google Cloud Console
   - Verify API key permissions and restrictions

3. **"Translation API error: 429"**
   - You've exceeded API quotas
   - Check usage in Google Cloud Console
   - Consider implementing caching or rate limiting

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=translation
```

This will log translation requests and responses to the console.

## Production Deployment

### Environment Variables

Ensure these environment variables are set in your production environment:

```bash
EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_production_api_key
```

### Performance Considerations

- Implement caching for frequently translated content
- Consider rate limiting to prevent API abuse
- Monitor API usage and costs
- Use CDN for static translation caches

### Security

- Use restricted API keys in production
- Implement request validation and sanitization
- Monitor for unusual usage patterns
- Set up alerts for API usage spikes

## Support

For issues with Google Translate API:

- [Google Cloud Translation Documentation](https://cloud.google.com/translate/docs)
- [Google Cloud Support](https://cloud.google.com/support)

For issues with Sky Social integration:

- Check the implementation in `src/lib/translator.ts`
- Review the Post component integration in `src/components/Post.tsx`
