# Font Setup - Khmer Unicode Detection with Inter

This Text component automatically detects Khmer Unicode text and applies the appropriate font:

- **Khmer text**: Uses KantumruyPro fonts
- **Non-Khmer text**: Uses Inter fonts (Google Fonts)

## Features

✅ **Automatic Detection**: Detects Khmer Unicode characters (U+1780 to U+17FF)  
✅ **Smart Font Selection**: KantumruyPro for Khmer, Inter for other text  
✅ **Configurable**: Can disable auto-detection when needed  
✅ **Performance**: Only loads needed fonts, better performance for mixed content

## Installation

The following packages are required:

```bash
npm install @expo-google-fonts/inter @expo-google-fonts/kantumruy-pro
```

## Usage

### Basic Usage (Auto-detection enabled by default)

```tsx
import { Text } from '@/components/ui/Text';

// Khmer text - automatically uses KantumruyPro
<Text>សួស្តី ពិភពលោក</Text>

// English text - automatically uses Inter
<Text>Hello World</Text>

// Mixed content - detects Khmer, uses KantumruyPro
<Text>Hello សួស្តី World</Text>
```

### Font Weights

```tsx
// Different weights for English (Inter fonts)
<Text font="thin">Inter Thin</Text>
<Text font="normal">Inter Regular</Text>
<Text font="semiBold">Inter SemiBold</Text>
<Text font="bold">Inter Bold</Text>
<Text font="extrabold">Inter ExtraBold</Text>

// Different weights for Khmer (KantumruyPro fonts)
<Text font="thin">ពុម្ពអក្សរស្រាល</Text>
<Text font="bold">ពុម្ពអក្សរធាត់</Text>
```

### Manual Control

```tsx
// Disable auto-detection - always use KantumruyPro
<Text autoDetectKhmer={false}>
  This English text will use KantumruyPro
</Text>

// Force specific font (bypass detection)
<Text autoDetectKhmer={false} font="bold">
  Always KantumruyPro Bold
</Text>
```

## Font Mapping

### KantumruyPro (Khmer text)

- `thin` → KantumruyPro_100Thin
- `normal` → KantumruyPro_400Regular
- `semiBold` → KantumruyPro_500Medium
- `bold` → KantumruyPro_700Bold
- `extrabold` → KantumruyPro_700Bold

### Inter (Non-Khmer text)

- `thin` → Inter_100Thin
- `normal` → Inter_400Regular
- `semiBold` → Inter_600SemiBold
- `bold` → Inter_700Bold
- `extrabold` → Inter_800ExtraBold

## Utility Functions

You can also use the detection functions independently:

```tsx
import {
  isKhmerText,
  detectTextScript,
  getFontForText,
} from "@/utils/textUtils";

// Check if text contains Khmer
const hasKhmer = isKhmerText("Hello សួស្តី"); // true

// Detect script type
const script = detectTextScript("Hello World"); // 'latin'
const script2 = detectTextScript("សួស្តី"); // 'khmer'

// Get appropriate font
const font = getFontForText("Hello World"); // 'Inter_400Regular'
const font2 = getFontForText("សួស្តី"); // 'KantumruyPro_400Regular'
```

## Performance Benefits

1. **Smaller bundle size**: Inter fonts only loaded when needed
2. **Better rendering**: Native fonts for Latin text, specialized fonts for Khmer
3. **Automatic optimization**: No manual font selection required
4. **Backward compatible**: Existing code works without changes

## Technical Details

- **Khmer Unicode Range**: U+1780 to U+17FF
- **Detection Logic**: Regex-based Unicode range detection
- **Font Loading**: Managed in `I18nProvider.tsx`
- **Fallback**: Graceful degradation if fonts fail to load
