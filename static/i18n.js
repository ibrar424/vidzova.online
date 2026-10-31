/**
 * VidZova Multilingual Globalization Engine
 * - Supports 50+ global languages (excluding Urdu and Hindi).
 * - Automatic browser language detection with English fallback.
 * - Persistent language preference in localStorage and cookie.
 * - RTL layout support for Arabic, Hebrew, and Persian.
 * - Dynamic search filter in header dropdown.
 * - Headless Google Website Translator integration with zero API cost.
 * - Brand text and sensitive elements preserved with .notranslate.
 */

(function () {
  "use strict";

  // 50+ Supported Global Languages (STRICTLY EXCLUDING Urdu and Hindi)
  const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English", native: "English", flag: "🇺🇸", dir: "ltr" },
    { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr" },
    { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
    { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文", flag: "🇨🇳", dir: "ltr" },
    { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文", flag: "🇹🇼", dir: "ltr" },
    { code: "fr", name: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
    { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
    { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹", dir: "ltr" },
    { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", dir: "ltr" },
    { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷", dir: "ltr" },
    { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
    { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
    { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷", dir: "ltr" },
    { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩", dir: "ltr" },
    { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳", dir: "ltr" },
    { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr" },
    { code: "th", name: "Thai", native: "ไทย", flag: "🇹🇭", dir: "ltr" },
    { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱", dir: "ltr" },
    { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱", dir: "ltr" },
    { code: "el", name: "Greek", native: "Ελληνικά", flag: "🇬🇷", dir: "ltr" },
    { code: "cs", name: "Czech", native: "Čeština", flag: "🇨🇿", dir: "ltr" },
    { code: "sv", name: "Swedish", native: "Svenska", flag: "🇸🇪", dir: "ltr" },
    { code: "hu", name: "Hungarian", native: "Magyar", flag: "🇭🇺", dir: "ltr" },
    { code: "ro", name: "Romanian", native: "Română", flag: "🇷🇴", dir: "ltr" },
    { code: "uk", name: "Ukrainian", native: "Українська", flag: "🇺🇦", dir: "ltr" },
    { code: "he", name: "Hebrew", native: "עברית", flag: "🇮🇱", dir: "rtl" },
    { code: "da", name: "Danish", native: "Dansk", flag: "🇩🇰", dir: "ltr" },
    { code: "fi", name: "Finnish", native: "Suomi", flag: "🇫🇮", dir: "ltr" },
    { code: "no", name: "Norwegian", native: "Norsk", flag: "🇳🇴", dir: "ltr" },
    { code: "sk", name: "Slovak", native: "Slovenčina", flag: "🇸🇰", dir: "ltr" },
    { code: "ms", name: "Malay", native: "Bahasa Melayu", flag: "🇲🇾", dir: "ltr" },
    { code: "tl", name: "Filipino", native: "Filipino", flag: "🇵🇭", dir: "ltr" },
    { code: "fa", name: "Persian", native: "فارسی", flag: "🇮🇷", dir: "rtl" },
    { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳", dir: "ltr" },
    { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳", dir: "ltr" },
    { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳", dir: "ltr" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳", dir: "ltr" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳", dir: "ltr" },
    { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳", dir: "ltr" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳", dir: "ltr" },
    { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪", dir: "ltr" },
    { code: "hr", name: "Croatian", native: "Hrvatski", flag: "🇭🇷", dir: "ltr" },
    { code: "sr", name: "Serbian", native: "Српски", flag: "🇷🇸", dir: "ltr" },
    { code: "bg", name: "Bulgarian", native: "Български", flag: "🇧🇬", dir: "ltr" },
    { code: "lt", name: "Lithuanian", native: "Lietuvių", flag: "🇱🇹", dir: "ltr" },
    { code: "lv", name: "Latvian", native: "Latviešu", flag: "🇱🇻", dir: "ltr" },
    { code: "et", name: "Estonian", native: "Eesti", flag: "🇪🇪", dir: "ltr" },
    { code: "sl", name: "Slovenian", native: "Slovenščina", flag: "🇸🇮", dir: "ltr" },
    { code: "ca", name: "Catalan", native: "Català", flag: "🇪🇸", dir: "ltr" },
    { code: "eu", name: "Basque", native: "Euskara", flag: "🇪🇸", dir: "ltr" },
    { code: "gl", name: "Galician", native: "Galego", flag: "🇪🇸", dir: "ltr" },
    { code: "cy", name: "Welsh", native: "Cymraeg", flag: "🇬🇧", dir: "ltr" },
    { code: "ga", name: "Irish", native: "Gaeilge", flag: "🇮🇪", dir: "ltr" },
    { code: "af", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦", dir: "ltr" },
    { code: "is", name: "Icelandic", native: "Íslenska", flag: "🇮🇸", dir: "ltr" },
  ];

  // Helper: Find language by code
  function findLang(code) {
    if (!code) return null;
    const clean = code.toLowerCase().trim();
    // Strict block of Urdu and Hindi
    if (clean === "ur" || clean.startsWith("ur-") || clean === "hi" || clean.startsWith("hi-")) {
      return null;
    }
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === clean) ||
      SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().split("-")[0] === clean.split("-")[0]) ||
      null
    );
  }

  // Detect visitor's preferred language
  function detectLanguage() {
    // 1. Check URL query param ?lang= or ?hl=
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get("lang") || params.get("hl");
    if (paramLang) {
      const match = findLang(paramLang);
      if (match) return match.code;
    }

    // 2. Check localStorage saved choice
    const saved = localStorage.getItem("vidzova_lang");
    if (saved) {
      const match = findLang(saved);
      if (match) return match.code;
    }

    // 3. Inspect browser languages
    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];
    for (const bLang of browserLangs) {
      if (!bLang) continue;
      const clean = bLang.toLowerCase().trim();
      // Strictly exclude Urdu and Hindi
      if (clean.startsWith("ur") || clean.startsWith("hi")) {
        return "en";
      }
      const match = findLang(clean);
      if (match) {
        return match.code;
      }
    }

    // Fallback: English
    return "en";
  }

  // Set Cookie Helper
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + d.toUTCString();
    }
    // Set for current host and domain
    const host = window.location.hostname;
    const domainPart = host.includes(".") && !host.match(/^\d+/) ? "; domain=." + host.replace(/^www\./, "") : "";
    document.cookie = name + "=" + (value || "") + expires + "; path=/" + domainPart + "; SameSite=Lax";
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  // Apply Language & Trigger Headless Google Translation
  function applyLanguage(targetCode, userInitiated = false) {
    const langObj = findLang(targetCode) || SUPPORTED_LANGUAGES[0];
    const code = langObj.code;

    // Update localStorage
    localStorage.setItem("vidzova_lang", code);

    // Update HTML attributes and RTL direction
    document.documentElement.lang = code;
    if (langObj.dir === "rtl") {
      document.documentElement.setAttribute("dir", "rtl");
      document.body.classList.add("rtl-mode");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.body.classList.remove("rtl-mode");
    }

    // Update Header Label
    const currentLabel = document.getElementById("currentLangLabel");
    if (currentLabel) {
      currentLabel.textContent = `${langObj.flag} ${langObj.native}`;
    }

    // Configure Google Translate Cookie: /en/{targetCode}
    if (code === "en") {
      // Revert to English
      setCookie("googtrans", "/en/en", 365);
      setCookie("googtrans", "", -1);
    } else {
      // e.g. /en/es, /en/ar, /en/zh-CN
      setCookie("googtrans", `/en/${code}`, 365);
    }

    // Trigger Google Translate Combo if element exists
    const teCombo = document.querySelector(".goog-te-combo");
    if (teCombo) {
      teCombo.value = code;
      teCombo.dispatchEvent(new Event("change"));
    } else if (userInitiated) {
      // If combo not loaded yet, reload to let cookie take effect immediately
      window.location.reload();
    }
  }

  // Build Language Dropdown in Header
  function buildLanguageDropdown() {
    const dropdownList = document.getElementById("langList");
    if (!dropdownList) return;

    dropdownList.innerHTML = "";
    SUPPORTED_LANGUAGES.forEach((l) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "sf-lang-item notranslate";
      item.setAttribute("translate", "no");
      item.setAttribute("data-lang-code", l.code);
      item.innerHTML = `
        <span class="sf-lang-flag">${l.flag}</span>
        <span class="sf-lang-name">${l.name}</span>
        <span class="sf-lang-native">${l.native}</span>
      `;
      item.addEventListener("click", () => {
        applyLanguage(l.code, true);
        closeDropdown();
      });
      dropdownList.appendChild(item);
    });

    // Search filter input
    const searchInput = document.getElementById("langSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = dropdownList.querySelectorAll(".sf-lang-item");
        items.forEach((it) => {
          const text = it.textContent.toLowerCase();
          if (text.includes(query)) {
            it.classList.remove("hidden");
          } else {
            it.classList.add("hidden");
          }
        });
      });
    }
  }

  function toggleDropdown() {
    const dropdown = document.getElementById("langDropdown");
    const toggleBtn = document.getElementById("langToggleBtn");
    if (!dropdown || !toggleBtn) return;

    const isHidden = dropdown.classList.contains("hidden");
    if (isHidden) {
      dropdown.classList.remove("hidden");
      toggleBtn.setAttribute("aria-expanded", "true");
      const searchInput = document.getElementById("langSearchInput");
      if (searchInput) searchInput.focus();
    } else {
      closeDropdown();
    }
  }

  function closeDropdown() {
    const dropdown = document.getElementById("langDropdown");
    const toggleBtn = document.getElementById("langToggleBtn");
    if (!dropdown || !toggleBtn) return;
    dropdown.classList.add("hidden");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  // Load Google Website Translator Script Headlessly
  function loadGoogleTranslateScript() {
    // Only load if not already on page
    if (document.getElementById("google-translate-script")) return;

    // Define global callback expected by Google
    window.googleTranslateElementInit = function () {
      const included = SUPPORTED_LANGUAGES.map((l) => l.code).join(",");
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: included,
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );

      // Re-trigger current language once combo is ready
      setTimeout(() => {
        const target = detectLanguage();
        if (target !== "en") {
          applyLanguage(target, false);
        }
      }, 300);
    };

    // Inject hidden container
    if (!document.getElementById("google_translate_element")) {
      const container = document.createElement("div");
      container.id = "google_translate_element";
      container.className = "notranslate hidden";
      container.setAttribute("translate", "no");
      container.style.display = "none";
      document.body.appendChild(container);
    }

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  }

  // Initialize on DOM Ready
  window.addEventListener("DOMContentLoaded", () => {
    // Prevent brand names and symbols from being translated
    const brandElements = document.querySelectorAll(".sf-logo, .sf-brand, .sf-logo-vid, .sf-logo-zova, .sf-logo-svg, svg, code, pre");
    brandElements.forEach((el) => {
      el.classList.add("notranslate");
      el.setAttribute("translate", "no");
    });

    // Detect and apply initial language
    const currentLang = detectLanguage();
    applyLanguage(currentLang, false);

    // Build header selector dropdown
    buildLanguageDropdown();

    const toggleBtn = document.getElementById("langToggleBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdown();
      });
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      const selector = document.getElementById("langSelector");
      if (selector && !selector.contains(e.target)) {
        closeDropdown();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });

    // Load Google Translation Script
    loadGoogleTranslateScript();
  });
})();
