import React, { createContext, useContext, PropsWithChildren } from "react";
import { useSettings, Language } from "./SettingsContext";

interface Translations {
  [key: string]: {
    en: string;
    km: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": {
    en: "Home",
    km: "ទំព័រដើម",
  },
  "nav.search": {
    en: "Search",
    km: "ស្វែងរក",
  },
  "nav.create": {
    en: "New Post",
    km: "បង្កើតថ្មី",
  },
  "nav.video": {
    en: "Video",
    km: "វីដេអូ",
  },
  "nav.profile": {
    en: "Profile",
    km: "ប្រវត្តិរូប",
  },
  "nav.settings": {
    en: "Settings",
    km: "ការកំណត់",
  },

  // Common
  "common.save": {
    en: "Save",
    km: "រក្សាទុក",
  },
  "common.cancel": {
    en: "Cancel",
    km: "បោះបង់",
  },
  "common.done": {
    en: "Done",
    km: "រួចរាល់",
  },
  "common.loading": {
    en: "Loading...",
    km: "កំពុងផ្ទុក...",
  },
  "common.error": {
    en: "Error",
    km: "កំហុស",
  },
  "common.retry": {
    en: "Try Again",
    km: "ព្យាយាមម្តងទៀត",
  },

  // Settings
  "settings.title": {
    en: "Settings",
    km: "ការកំណត់",
  },
  "settings.appearance": {
    en: "Appearance",
    km: "រូបរាង",
  },
  "settings.language": {
    en: "Language",
    km: "ភាសា",
  },
  "settings.theme": {
    en: "Theme",
    km: "ស្បែក",
  },
  "settings.theme.light": {
    en: "Light",
    km: "ភ្លឺ",
  },
  "settings.theme.dark": {
    en: "Dark",
    km: "ងងឹត",
  },
  "settings.theme.system": {
    en: "System",
    km: "ប្រព័ន្ធ",
  },
  "settings.language.english": {
    en: "English",
    km: "អង់គ្លេស",
  },
  "settings.language.khmer": {
    en: "Khmer",
    km: "ខ្មែរ",
  },
  "settings.account": {
    en: "Account",
    km: "គណនី",
  },
  "settings.privacy": {
    en: "Privacy & Safety",
    km: "ភាពឯកជន និងសុវត្ថិភាព",
  },
  "settings.notifications": {
    en: "Notifications",
    km: "ការជូនដំណឹង",
  },
  "settings.about": {
    en: "About",
    km: "អំពី",
  },
  "settings.logout": {
    en: "Sign Out",
    km: "ចាកចេញ",
  },

  // Auth
  "auth.signin": {
    en: "Sign In",
    km: "ចូលគណនី",
  },
  "auth.username": {
    en: "Username or Email",
    km: "ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល",
  },
  "auth.password": {
    en: "Password",
    km: "ពាក្យសម្ងាត់",
  },
  "auth.welcome": {
    en: "Welcome to Sky Social",
    km: "សូមស្វាគមន៍មកកាន់ Sky Social",
  },
  "auth.subtitle": {
    en: "Connect with the decentralized social web",
    km: "ភ្ជាប់ជាមួយបណ្តាញសង្គមវិមជ្ឈការ",
  },
  "auth.signup": {
    en: "Don't have a Bluesky account? Create one at bsky.app",
    km: "មិនមានគណនី Bluesky? បង្កើតនៅ bsky.app",
  },

  // Timeline
  "timeline.welcome": {
    en: "Welcome to Sky Social!",
    km: "សូមស្វាគមន៍មកកាន់ Sky Social!",
  },
  "timeline.empty.authenticated": {
    en: "Follow people to see their posts in your timeline. Discover new accounts in the search tab!",
    km: "តាមដានមនុស្សដើម្បីមើលការបង្ហោះរបស់ពួកគេ។ រកគណនីថ្មីនៅផ្ទាំងស្វែងរក!",
  },
  "timeline.empty.unauthenticated": {
    en: "Discover posts from the decentralized social web. Sign in to interact with posts and see your personalized timeline.",
    km: "រកមើលការបង្ហោះពីបណ្តាញសង្គមវិមជ្ឈការ។ ចូលគណនីដើម្បីធ្វើអន្តរកម្មជាមួយការបង្ហោះ។",
  },

  // Posts
  "post.like": {
    en: "Like",
    km: "ចូលចិត្ត",
  },
  "post.repost": {
    en: "Repost",
    km: "បង្ហោះឡើងវិញ",
  },
  "post.comment": {
    en: "Comment",
    km: "មតិយោបល់",
  },
  "post.share": {
    en: "Share",
    km: "ចែករំលែក",
  },
};

interface I18nContextType {
  t: (key: string) => string;
  language: Language;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: PropsWithChildren) {
  const { language } = useSettings();

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return (
    <I18nContext.Provider value={{ t, language }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}