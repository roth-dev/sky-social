module.exports = {
  locales: ["en", "km"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "locale/{locale}/messages",
      include: ["src"],
    },
  ],
  compileNamespace: "es",
  fallbackLocales: true,
};