import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./locales/en/translation.json";
import translationBg from "./locales/bg/translation.json";    

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: translationEn
        },
        bg: {
            translation: translationBg
        }
    },
    lng: "en", // Default language
    interpolation: {
        escapeValue: false
    }
});


export default i18n;