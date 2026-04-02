import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";

const messages = {
  en: englishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", {
  allowMissing: true,
});

export default i18nProvider;
