"use client";

import { useState, useEffect, useCallback } from "react";

export type Language = "en" | "fr" | "es" | "hi" | "ar";

export const LANGUAGES: { code: Language; label: string; flag: string; rtl?: boolean }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", label: "العربية", flag: "🇦🇪", rtl: true },
];

// Translation dictionary — key UI strings
const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.women": "Women",
    "nav.men": "Men",
    "nav.outerwear": "Outerwear",
    "nav.footwear": "Footwear",
    "nav.accessories": "Accessories",
    "nav.community": "Community",
    "action.shop": "Shop",
    "action.search": "Search",
    "action.addToBag": "Add to Bag",
    "action.buyNow": "Buy Now",
    "action.checkout": "Checkout",
    "action.viewAll": "View All",
    "action.continueShopping": "Continue Shopping",
    "hero.title": "The Art of",
    "hero.subtitle": "Quiet Luxury.",
    "hero.cta": "Explore Collection",
    "hero.cta2": "Featured Piece",
    "product.description": "Description",
    "product.materials": "Materials",
    "product.craftsmanship": "Craftsmanship",
    "product.care": "Care",
    "product.sustainability": "Sustainability",
    "product.reviews": "Reviews",
    "product.qa": "Q&A",
    "product.sizeGuide": "Size Guide",
    "product.inStock": "In Stock",
    "product.outOfStock": "Out of Stock",
    "product.estimatedDelivery": "Estimated delivery",
    "cart.title": "Your Bag",
    "cart.subtotal": "Subtotal",
    "cart.empty": "Your bag is empty",
    "profile.title": "My Account",
    "profile.orders": "Orders",
    "profile.addresses": "Addresses",
    "profile.settings": "Settings",
    "footer.newsletter": "Join our inner circle",
    "footer.copyright": "© 2026 MAISON ÉLÉGANCE. All rights reserved.",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.women": "Femme",
    "nav.men": "Homme",
    "nav.outerwear": "Vêtements d'extérieur",
    "nav.footwear": "Chaussures",
    "nav.accessories": "Accessoires",
    "nav.community": "Communauté",
    "action.shop": "Boutique",
    "action.search": "Rechercher",
    "action.addToBag": "Ajouter au panier",
    "action.buyNow": "Acheter maintenant",
    "action.checkout": "Paiement",
    "action.viewAll": "Voir tout",
    "action.continueShopping": "Continuer vos achats",
    "hero.title": "L'Art de la",
    "hero.subtitle": "Luxe Silencieux.",
    "hero.cta": "Explorer la Collection",
    "hero.cta2": "Pièce Vedette",
    "product.description": "Description",
    "product.materials": "Matériaux",
    "product.craftsmanship": "Savoir-faire",
    "product.care": "Entretien",
    "product.sustainability": "Durabilité",
    "product.reviews": "Avis",
    "product.qa": "Questions",
    "product.sizeGuide": "Guide des tailles",
    "product.inStock": "En stock",
    "product.outOfStock": "Épuisé",
    "product.estimatedDelivery": "Livraison estimée",
    "cart.title": "Votre Panier",
    "cart.subtotal": "Sous-total",
    "cart.empty": "Votre panier est vide",
    "profile.title": "Mon Compte",
    "profile.orders": "Commandes",
    "profile.addresses": "Adresses",
    "profile.settings": "Paramètres",
    "footer.newsletter": "Rejoignez notre cercle",
    "footer.copyright": "© 2026 MAISON ÉLÉGANCE. Tous droits réservés.",
  },
  es: {
    "nav.home": "Inicio",
    "nav.women": "Mujer",
    "nav.men": "Hombre",
    "nav.outerwear": "Abrigos",
    "nav.footwear": "Calzado",
    "nav.accessories": "Accesorios",
    "nav.community": "Comunidad",
    "action.shop": "Tienda",
    "action.search": "Buscar",
    "action.addToBag": "Añadir a la bolsa",
    "action.buyNow": "Comprar ahora",
    "action.checkout": "Pagar",
    "action.viewAll": "Ver todo",
    "action.continueShopping": "Seguir comprando",
    "hero.title": "El Arte del",
    "hero.subtitle": "Lujo Silencioso.",
    "hero.cta": "Explorar Colección",
    "hero.cta2": "Pieza Destacada",
    "product.description": "Descripción",
    "product.materials": "Materiales",
    "product.craftsmanship": "Artesanía",
    "product.care": "Cuidado",
    "product.sustainability": "Sostenibilidad",
    "product.reviews": "Reseñas",
    "product.qa": "Preguntas",
    "product.sizeGuide": "Guía de tallas",
    "product.inStock": "En stock",
    "product.outOfStock": "Agotado",
    "product.estimatedDelivery": "Entrega estimada",
    "cart.title": "Tu Bolsa",
    "cart.subtotal": "Subtotal",
    "cart.empty": "Tu bolsa está vacía",
    "profile.title": "Mi Cuenta",
    "profile.orders": "Pedidos",
    "profile.addresses": "Direcciones",
    "profile.settings": "Configuración",
    "footer.newsletter": "Únete a nuestro círculo",
    "footer.copyright": "© 2026 MAISON ÉLÉGANCE. Todos los derechos reservados.",
  },
  hi: {
    "nav.home": "होम",
    "nav.women": "महिलाएं",
    "nav.men": "पुरुष",
    "nav.outerwear": "बाहरी कपड़े",
    "nav.footwear": "जूते",
    "nav.accessories": "सहायक उपकरण",
    "nav.community": "समुदाय",
    "action.shop": "खरीदें",
    "action.search": "खोजें",
    "action.addToBag": "बैग में जोड़ें",
    "action.buyNow": "अभी खरीदें",
    "action.checkout": "चेकआउट",
    "action.viewAll": "सभी देखें",
    "action.continueShopping": "खरीदारी जारी रखें",
    "hero.title": "शांत विलासिता का",
    "hero.subtitle": "कला।",
    "hero.cta": "संग्रह देखें",
    "hero.cta2": "विशेष टुकड़ा",
    "product.description": "विवरण",
    "product.materials": "सामग्री",
    "product.craftsmanship": "कारीगरी",
    "product.care": "देखभाल",
    "product.sustainability": "स्थिरता",
    "product.reviews": "समीक्षाएं",
    "product.qa": "प्रश्न",
    "product.sizeGuide": "साइज गाइड",
    "product.inStock": "स्टॉक में",
    "product.outOfStock": "स्टॉक समाप्त",
    "product.estimatedDelivery": "अनुमानित डिलीवरी",
    "cart.title": "आपका बैग",
    "cart.subtotal": "उप-योग",
    "cart.empty": "आपका बैग खाली है",
    "profile.title": "मेरा खाता",
    "profile.orders": "ऑर्डर",
    "profile.addresses": "पते",
    "profile.settings": "सेटिंग्स",
    "footer.newsletter": "हमारे सर्कल में शामिल हों",
    "footer.copyright": "© 2026 MAISON ÉLÉGANCE. सर्वाधिकार सुरक्षित।",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.women": "نساء",
    "nav.men": "رجال",
    "nav.outerwear": "الملابس الخارجية",
    "nav.footwear": "الأحذية",
    "nav.accessories": "الإكسسوارات",
    "nav.community": "المجتمع",
    "action.shop": "تسوق",
    "action.search": "بحث",
    "action.addToBag": "أضف إلى الحقيبة",
    "action.buyNow": "اشترِ الآن",
    "action.checkout": "الدفع",
    "action.viewAll": "عرض الكل",
    "action.continueShopping": "متابعة التسوق",
    "hero.title": "فن",
    "hero.subtitle": "الفخامة الهادئة.",
    "hero.cta": "استكشف المجموعة",
    "hero.cta2": "القطعة المميزة",
    "product.description": "الوصف",
    "product.materials": "المواد",
    "product.craftsmanship": "الحرفية",
    "product.care": "العناية",
    "product.sustainability": "الاستدامة",
    "product.reviews": "المراجعات",
    "product.qa": "الأسئلة",
    "product.sizeGuide": "دليل المقاسات",
    "product.inStock": "متوفر",
    "product.outOfStock": "غير متوفر",
    "product.estimatedDelivery": "التوصيل المتوقع",
    "cart.title": "حقيبتك",
    "cart.subtotal": "المجموع الفرعي",
    "cart.empty": "حقيبتك فارغة",
    "profile.title": "حسابي",
    "profile.orders": "الطلبات",
    "profile.addresses": "العناوين",
    "profile.settings": "الإعدادات",
    "footer.newsletter": "انضم إلى دائرتنا",
    "footer.copyright": "© 2026 MAISON ÉLÉGANCE. جميع الحقوق محفوظة.",
  },
};

let currentLang: Language = "en";
const listeners = new Set<(lang: Language) => void>();

export function getLang(): Language {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("maison-lang");
    if (stored && translations[stored as Language]) {
      currentLang = stored as Language;
    }
  }
  return currentLang;
}

export function setLang(lang: Language) {
  currentLang = lang;
  if (typeof window !== "undefined") {
    localStorage.setItem("maison-lang", lang);
    // Set RTL for Arabic
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }
  listeners.forEach((l) => l(lang));
}

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(getLang());

  useEffect(() => {
    const listener = (l: Language) => setLangState(l);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const change = useCallback((l: Language) => {
    setLang(l);
    setLangState(l);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  }, [lang]);

  const isRTL = lang === "ar";

  return { lang, setLang: change, t, isRTL, languages: LANGUAGES };
}
