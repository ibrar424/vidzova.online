document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const videoUrlInput = document.getElementById("videoUrlInput");
  const clearInputBtn = document.getElementById("clearInputBtn");
  const pasteBtn = document.getElementById("pasteBtn");
  const fetchBtn = document.getElementById("fetchBtn");

  const loadingBox = document.getElementById("loadingBox");
  const errorBox = document.getElementById("errorBox");
  const errorText = document.getElementById("errorText");
  const resultCard = document.getElementById("resultCard");

  const videoThumb = document.getElementById("videoThumb");
  const videoDuration = document.getElementById("videoDuration");
  const videoExtractor = document.getElementById("videoExtractor");
  const previewBtn = document.getElementById("previewBtn");
  const embedContainer = document.getElementById("embedContainer");

  const videoTitle = document.getElementById("videoTitle");
  const videoAuthor = document.getElementById("videoAuthor");
  const videoViews = document.getElementById("videoViews");
  const originalLink = document.getElementById("originalLink");

  const mainDownloadBtn = document.getElementById("mainDownloadBtn");
  const mainDownloadLabel = document.getElementById("mainDownloadLabel");
  const formatDropdownBtn = document.getElementById("formatDropdownBtn");
  const selectedFormatText = document.getElementById("selectedFormatText");
  const selectedFormatBadge = document.getElementById("selectedFormatBadge");
  const formatMenu = document.getElementById("formatMenu");

  const combinedGroupTitle = document.getElementById("combinedGroupTitle");
  const combinedFormatsList = document.getElementById("combinedFormatsList");
  const videoOnlyFormatsGroup = document.getElementById("videoOnlyFormatsGroup");
  const videoOnlyFormatsList = document.getElementById("videoOnlyFormatsList");
  const highResGroupTitle = document.getElementById("highResGroupTitle");
  const audioFormatsGroup = document.getElementById("audioFormatsGroup");
  const audioFormatsList = document.getElementById("audioFormatsList");

  const selectedFormatInfo = document.getElementById("selectedFormatInfo");
  const directStreamLink = document.getElementById("directStreamLink");

  const downloadProgressBox = document.getElementById("downloadProgressBox");
  const progressStatusText = document.getElementById("progressStatusText");
  const progressPercentText = document.getElementById("progressPercentText");
  const progressBarFill = document.getElementById("progressBarFill");
  const progressBytesText = document.getElementById("progressBytesText");
  const progressSpeedText = document.getElementById("progressSpeedText");

  const historySection = document.getElementById("historySection");
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  const themeToggle = document.getElementById("themeToggle");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const heroPlatformLabel = document.getElementById("heroPlatformLabel");
  const activeCategoryIcon = document.getElementById("activeCategoryIcon");
  const helperTipText = document.getElementById("helperTipText");
  const activeSampleChip = document.getElementById("activeSampleChip");

  const youtubeFeatureSection = document.getElementById("youtube-feature");
  const facebookFeatureSection = document.getElementById("facebook-feature");
  const instagramFeatureSection = document.getElementById("instagram-feature");
  const tiktokFeatureSection = document.getElementById("tiktok-feature");
  const snapchatFeatureSection = document.getElementById("snapchat-feature");
  const twitterFeatureSection = document.getElementById("twitter-feature");
  const pinterestFeatureSection = document.getElementById("pinterest-feature");
  const amazonFeatureSection = document.getElementById("amazon-feature");
  const alibabaFeatureSection = document.getElementById("alibaba-feature");
  const redditFeatureSection = document.getElementById("reddit-feature");

  const tryYouTubeBtn = document.getElementById("tryYouTubeBtn");
  const tryFacebookBtn = document.getElementById("tryFacebookBtn");
  const tryInstagramBtn = document.getElementById("tryInstagramBtn");
  const tryTikTokBtn = document.getElementById("tryTikTokBtn");
  const trySnapchatBtn = document.getElementById("trySnapchatBtn");
  const tryTwitterBtn = document.getElementById("tryTwitterBtn");
  const tryPinterestBtn = document.getElementById("tryPinterestBtn");
  const tryAmazonBtn = document.getElementById("tryAmazonBtn");
  const tryAlibabaBtn = document.getElementById("tryAlibabaBtn");
  const howToHeading = document.getElementById("howToHeading");
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

  let currentVideo = null;
  let selectedFormat = null;
  let pollTimer = null;
  let activeJobId = null;
  let downloadTriggered = false;
  // Always use relative URLs on production (vidzova.online) for 100% reliability.
  // The server internally proxies to the residential tunnel when needed.
  let activeApiBase = "";

  function initApiEndpoint() {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal && window.location.port !== "5000") {
      fetch("http://127.0.0.1:5000/api/config")
        .then((lr) => {
          if (lr.ok) activeApiBase = "http://127.0.0.1:5000";
        })
        .catch(() => {
          activeApiBase = "";
        });
    } else {
      activeApiBase = "";
    }
  }
  initApiEndpoint();

  const CATEGORY_ICONS = {
    Reddit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,

    YouTube: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    Pinterest: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641 0 12.017 0z"/></svg>`,
    Snapchat: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#000000"><path d="M12.206.024c-4.494 0-7.854 3.498-7.854 7.81 0 1.238.411 2.378 1.127 3.32-.084.288-.344.97-.887 1.285-.595.346-1.393.39-1.928.94-.37.382-.444.912-.178 1.408.312.584.978.887 1.63.974.195.026.39.04.582.043-.086.37-.21.73-.374 1.076-.445.942-1.22 1.614-2.247 1.897-.333.091-.58.36-.628.7-.048.342.115.681.417.864 1.348.815 2.923.864 4.394.502.818-.202 1.572-.577 2.268-1.077.587.39 1.272.637 1.996.72 1.026.117 2.062-.057 3.018-.507.956.45 1.992.624 3.018.507.724-.083 1.41-.33 1.996-.72.696.5 1.45.875 2.268 1.077 1.47.362 3.046.313 4.394-.502.302-.183.465-.522.417-.864-.048-.34-.295-.609-.628-.7-1.027-.283-1.802-.955-2.247-1.897-.164-.346-.288-.706-.374-1.076.192-.003.387-.017.582-.043.652-.087 1.318-.39 1.63-.974.266-.496.192-1.026-.178-1.408-.535-.55-1.333-.594-1.928-.94-.543-.315-.803-.997-.887-1.285.716-.942 1.127-2.082 1.127-3.32 0-4.312-3.36-7.81-7.854-7.81z"/></svg>`,
    Amazon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    Alibaba: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    Facebook: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    Instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    TikTok: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FE2C55"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    Twitter: `<svg width="15" height="15" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  };

  // Theme setup
  if (localStorage.getItem("sf_theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "sf_theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  });

  const PLATFORM_PATHS = {
    YouTube: "/youtube-video-downloader",
    Pinterest: "/pinterest-video-downloader",
    Snapchat: "/snapchat-video-downloader",
    Amazon: "/amazon-video-downloader",
    Alibaba: "/alibaba-video-downloader",
    Reddit: "/reddit-video-downloader",
    Facebook: "/facebook-video-downloader",
    Instagram: "/instagram-video-downloader",
    TikTok: "/tiktok-video-downloader",
    Twitter: "/twitter-video-downloader"
  };

  const PLATFORM_TITLES = {
    YouTube: "YouTube Video Downloader - Download YouTube Videos HD, 1080p, 4K & MP3 | Vidzova",
    Pinterest: "Pinterest Video & Image Downloader - Download Pins & GIFs Free | Vidzova",
    Snapchat: "Snapchat Video Downloader - Download Spotlight & Stories MP4 | Vidzova",
    Amazon: "Amazon Product Video Downloader - Download Product Videos & Images | Vidzova",
    Alibaba: "Alibaba Video Downloader - Download Supplier Videos & Photos | Vidzova",
    Facebook: "Facebook Video Downloader - Download FB Videos & Reels HD | Vidzova",
    Instagram: "Instagram Video Downloader - Download IG Reels & Stories | Vidzova",
    TikTok: "TikTok Video Downloader - Download TikTok Videos Without Watermark | Vidzova",
    Twitter: "Twitter Video Downloader - Download X & Twitter Videos HD | Vidzova",
    Reddit: "Reddit Video Downloader with Audio - Save Reddit Videos HD MP4 | Vidzova"
  };

  function getPlatformFromPath(path) {
    const p = (path || window.location.pathname).toLowerCase();
    if (p.includes("reddit")) return "Reddit";
    const p = (path || window.location.pathname).toLowerCase();
    if (p.includes("pinterest")) return "Pinterest";
    if (p.includes("snapchat")) return "Snapchat";
    if (p.includes("amazon")) return "Amazon";
    if (p.includes("alibaba")) return "Alibaba";
    if (p.includes("facebook")) return "Facebook";
    if (p.includes("instagram")) return "Instagram";
    if (p.includes("tiktok")) return "TikTok";
    if (p.includes("twitter")) return "Twitter";
    if (p.includes("youtube")) return "YouTube";
    return "YouTube";
  }

  // Centralized platform switcher: shows ONLY the selected category badge & dialog box content
  function setActivePlatform(platform, focusInput = true, updateUrl = true) {
    document.querySelectorAll("[data-platform]").forEach((el) => {
      if (
        el.classList.contains("sf-nav-link") ||
        el.classList.contains("sf-resource-pill")
      ) {
        el.classList.toggle("active", el.dataset.platform === platform);
      }
    });

    document.body.classList.toggle("pinterest-mode", platform === "Pinterest");
    document.body.classList.toggle("snapchat-mode", platform === "Snapchat");
    document.body.classList.toggle("amazon-mode", platform === "Amazon");
    document.body.classList.toggle("alibaba-mode", platform === "Alibaba");
    document.body.classList.toggle("facebook-mode", platform === "Facebook");
    document.body.classList.toggle("instagram-mode", platform === "Instagram");
    document.body.classList.toggle("tiktok-mode", platform === "TikTok");
    document.body.classList.toggle("twitter-mode", platform === "Twitter");
    document.body.classList.toggle("reddit-mode", platform === "Reddit");

    if (youtubeFeatureSection) {
      youtubeFeatureSection.classList.toggle("hidden", platform !== "YouTube");
    }
    if (facebookFeatureSection) {
      facebookFeatureSection.classList.toggle("hidden", platform !== "Facebook");
    }
    if (instagramFeatureSection) {
      instagramFeatureSection.classList.toggle("hidden", platform !== "Instagram");
    }
    if (tiktokFeatureSection) {
      tiktokFeatureSection.classList.toggle("hidden", platform !== "TikTok");
    }
    if (snapchatFeatureSection) {
      snapchatFeatureSection.classList.toggle("hidden", platform !== "Snapchat");
    }
    if (twitterFeatureSection) {
      twitterFeatureSection.classList.toggle("hidden", platform !== "Twitter");
    }
    if (pinterestFeatureSection) {
      pinterestFeatureSection.classList.toggle("hidden", platform !== "Pinterest");
    }
    if (amazonFeatureSection) {
      amazonFeatureSection.classList.toggle("hidden", platform !== "Amazon");
    }
    if (alibabaFeatureSection) {
      alibabaFeatureSection.classList.toggle("hidden", platform !== "Alibaba");
    }
    if (redditFeatureSection) {
      redditFeatureSection.classList.toggle("hidden", platform !== "Reddit");
    }

    // Update the single active category badge on top of Online Video Downloader
    if (heroPlatformLabel) {
      heroPlatformLabel.textContent = `${platform} Video Downloader`;
    }
    if (activeCategoryIcon) {
      activeCategoryIcon.innerHTML =
        CATEGORY_ICONS[platform] || CATEGORY_ICONS.YouTube;
    }

    if (helperTipText) {
      helperTipText.textContent = "";
    }

    if (platform === "YouTube") {
      heroTitle.textContent = "YouTube Video Downloader";
      heroSubtitle.textContent =
        "Download YouTube videos in MP4, 1080p, 720p, 4K HD and MP3 audio instantly for free with our fast YouTube video downloader.";
      videoUrlInput.placeholder =
        "Paste your YouTube video link here (e.g., https://www.youtube.com/watch?v=...)...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "▶ YouTube Sample Video";
        activeSampleChip.dataset.url = "https://youtu.be/e_04ZrNroTo?si=KqAGkerHW2LDd4eL";
        activeSampleChip.className = "sf-sample-chip";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download YouTube Videos in 3 Easy Steps";
      }
    } else if (platform === "Facebook") {
      heroTitle.textContent = "Facebook Video Downloader";
      heroSubtitle.textContent =
        "Download Facebook videos, Reels, and Watch clips in full HD 1080p MP4 with our free online Facebook video downloader.";
      videoUrlInput.placeholder =
        "Paste your Facebook video or Reel link here...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "📘 Facebook Sample Video";
        activeSampleChip.dataset.url = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
        activeSampleChip.className = "sf-sample-chip sf-chip-fb";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Facebook Videos & Reels in 3 Easy Steps";
      }
    } else if (platform === "Instagram") {
      heroTitle.textContent = "Instagram Video Downloader";
      heroSubtitle.textContent =
        "Download Instagram videos, Reels, IGTV, and Stories in high quality MP4 with our fast Instagram video downloader.";
      videoUrlInput.placeholder =
        "Paste your Instagram Reel, Story, or video link here...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "📸 Instagram Sample Video";
        activeSampleChip.dataset.url = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
        activeSampleChip.className = "sf-sample-chip sf-chip-ig";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Instagram Videos & Reels in 3 Easy Steps";
      }
    } else if (platform === "TikTok") {
      heroTitle.textContent = "TikTok Video Downloader";
      heroSubtitle.textContent =
        "Download TikTok videos without watermark in crystal-clear MP4 HD with our lightning-fast TikTok video downloader.";
      videoUrlInput.placeholder =
        "Paste your TikTok video link here (e.g., https://www.tiktok.com/@...)...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "🎵 TikTok Sample Video";
        activeSampleChip.dataset.url = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
        activeSampleChip.className = "sf-sample-chip sf-chip-tt";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download TikTok Videos Without Watermark in 3 Easy Steps";
      }
    } else if (platform === "Snapchat") {
      heroTitle.textContent = "Snapchat Video Downloader";
      heroSubtitle.textContent =
        "Download Snapchat videos, Spotlight clips, and public Stories in MP4 HD without watermark with our free Snapchat video downloader.";
      videoUrlInput.placeholder =
        "Paste your Snapchat link here (e.g., https://www.snapchat.com/spotlight/...)...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "👻 Snapchat Sample";
        activeSampleChip.dataset.url = "https://www.snapchat.com/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYYWtidGhudGZpAX1TKn0JAX1TKnXJAAAAAA";
        activeSampleChip.className = "sf-sample-chip sf-chip-snap";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Snapchat Spotlight Videos & Stories in 3 Easy Steps";
      }
    } else if (platform === "Twitter") {
      heroTitle.textContent = "Twitter Video Downloader";
      heroSubtitle.textContent =
        "Download Twitter videos and X posts, GIF clips in MP4 1080p HD with our secure Twitter video downloader.";
      videoUrlInput.placeholder =
        "Paste your Twitter or X video link here (e.g., https://x.com/...)...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "𝕏 Twitter / X Sample";
        activeSampleChip.dataset.url = "https://x.com/Twitter/status/1700000000000000000";
        activeSampleChip.className = "sf-sample-chip sf-chip-tw";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Twitter / X Videos & GIFs in 3 Easy Steps";
      }
    } else if (platform === "Pinterest") {
      heroTitle.textContent = "Pinterest Video Downloader";
      heroSubtitle.textContent =
        "Download Pinterest videos, Idea Pins, and animated GIFs in MP4 HD with our free online Pinterest video downloader.";
      videoUrlInput.placeholder =
        "Paste your Pinterest video or image link here...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "📌 Pinterest Sample Pin";
        activeSampleChip.dataset.url = "https://www.pinterest.com/pin/58969076305194654/";
        activeSampleChip.className = "sf-sample-chip sf-chip-pin";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Pinterest Videos & Images in 3 Easy Steps";
      }
    } else if (platform === "Amazon") {
      heroTitle.textContent = "Amazon Video Downloader";
      heroSubtitle.textContent =
        "Download Amazon product videos, review videos, and high-res listing images in MP4 HD with our Amazon video downloader.";
      videoUrlInput.placeholder =
        "Paste your Amazon product video link or ASIN here...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "🛒 Amazon Sample Video";
        activeSampleChip.dataset.url = "https://www.amazon.co.uk/dp/B098XNCHLD";
        activeSampleChip.className = "sf-sample-chip sf-chip-amz";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Amazon Product Videos in 3 Easy Steps";
      }
    } else if (platform === "Alibaba") {
      heroTitle.textContent = "Alibaba Video Downloader";
      heroSubtitle.textContent =
        "Download Alibaba product videos and supplier factory inspection clips in MP4 HD with our Alibaba video downloader.";
      videoUrlInput.placeholder =
        "Paste your Alibaba product video link here...";
      if (activeSampleChip) {
        activeSampleChip.textContent = "📦 Alibaba Sample Video";
        activeSampleChip.dataset.url =
          "https://www.alibaba.com/product-detail/Kids-Entertainment-Bouncer-Bouncy-Castle-Waterslide_1601271126969.html";
        activeSampleChip.className = "sf-sample-chip sf-chip-ali";
      }
      if (howToHeading) {
        howToHeading.textContent = "How to Download Alibaba Product Videos in 3 Easy Steps";
      }
    } else {
      heroTitle.textContent = `${platform} Video Downloader`;
      heroSubtitle.textContent = `Download ${platform} videos in MP4 HD and audio formats directly to your device with our ${platform} video downloader.`;
      videoUrlInput.placeholder = `Paste your ${platform} video link here...`;
      if (activeSampleChip) {
        activeSampleChip.textContent = `▶ ${platform} Sample`;
        activeSampleChip.dataset.url = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
        activeSampleChip.className = "sf-sample-chip";
      }
      if (howToHeading) {
        howToHeading.textContent = `How to Download ${platform} Videos in 3 Easy Steps`;
      }
    }

    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = `${platform} Video Downloader`;
    }
    if (videoThumb) {
      videoThumb.alt = `${platform} Video Downloader Media Thumbnail`;
    }

    if (PLATFORM_TITLES[platform]) {
      document.title = PLATFORM_TITLES[platform];
    }

    if (updateUrl) {
      const targetPath = PLATFORM_PATHS[platform] || "/";
      if (window.location.pathname !== targetPath) {
        // If navigating from Home ("/"), use pushState so Home page stays in browser history!
        // When the user clicks the browser Back button, they see Home page first, then Google Search.
        // If switching between category pages (e.g. Amazon -> Pinterest), use replaceState so category tabs don't create a trapped history loop.
        if (window.location.pathname === "/" && targetPath !== "/") {
          window.history.pushState({ platform }, "", targetPath);
        } else if (targetPath === "/") {
          window.history.replaceState({ platform }, "", "/");
        } else {
          window.history.replaceState({ platform }, "", targetPath);
        }
      }
    }

    if (focusInput) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      videoUrlInput.focus();
    }
  }

  // Helper to completely clear pasted URL, errors, and previous media results
  function clearAllInputAndResults() {
    if (videoUrlInput) videoUrlInput.value = "";
    if (clearInputBtn) clearInputBtn.classList.add("hidden");
    if (errorBox) errorBox.classList.add("hidden");
    if (loadingBox) loadingBox.classList.add("hidden");
    if (resultCard) resultCard.classList.add("hidden");
    if (downloadProgressBox) downloadProgressBox.classList.add("hidden");
    if (embedContainer) embedContainer.classList.add("hidden");
    currentVideo = null;
    selectedFormat = null;
  }

  // Handle all platform buttons/links: automatically clear pasted URL & errors on switch
  document.querySelectorAll("[data-platform]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const platform = e.currentTarget.dataset.platform;
      if (platform) {
        clearAllInputAndResults();
        setActivePlatform(platform, true, true);
      }
    });
  });

  // Handle [Vidzova] Logo Click: cleanly reset to Home page without trapping browser back history
  const logoLink = document.querySelector(".sf-logo");
  if (logoLink) {
    logoLink.addEventListener("click", (e) => {
      e.preventDefault();
      clearAllInputAndResults();
      setActivePlatform("YouTube", true, false);
      window.history.replaceState({}, "", "/");
      document.title = "Vidzova - Free Online Video Downloader (YouTube, Pinterest, Amazon, Alibaba, TikTok)";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (tryYouTubeBtn) {
    tryYouTubeBtn.addEventListener("click", () => {
      const sampleYt = "https://youtu.be/e_04ZrNroTo?si=KqAGkerHW2LDd4eL";
      setActivePlatform("YouTube", true, true);
      videoUrlInput.value = sampleYt;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleYt);
    });
  }

  if (tryFacebookBtn) {
    tryFacebookBtn.addEventListener("click", () => {
      const sampleFb = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
      setActivePlatform("Facebook", true, true);
      videoUrlInput.value = sampleFb;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleFb);
    });
  }

  if (tryInstagramBtn) {
    tryInstagramBtn.addEventListener("click", () => {
      const sampleIg = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
      setActivePlatform("Instagram", true, true);
      videoUrlInput.value = sampleIg;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleIg);
    });
  }

  if (tryTikTokBtn) {
    tryTikTokBtn.addEventListener("click", () => {
      const sampleTt = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
      setActivePlatform("TikTok", true, true);
      videoUrlInput.value = sampleTt;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleTt);
    });
  }

  if (tryPinterestBtn) {
    tryPinterestBtn.addEventListener("click", () => {
      const samplePin = "https://www.pinterest.com/pin/58969076305194654/";
      setActivePlatform("Pinterest", true, true);
      videoUrlInput.value = samplePin;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(samplePin);
    });
  }

  if (trySnapchatBtn) {
    trySnapchatBtn.addEventListener("click", () => {
      const sampleSnap = "https://www.snapchat.com/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYYWtidGhudGZpAX1TKn0JAX1TKnXJAAAAAA";
      setActivePlatform("Snapchat", true, true);
      videoUrlInput.value = sampleSnap;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleSnap);
    });
  }

  if (tryTwitterBtn) {
    tryTwitterBtn.addEventListener("click", () => {
      const sampleTw = "https://x.com/Twitter/status/1700000000000000000";
      setActivePlatform("Twitter", true, true);
      videoUrlInput.value = sampleTw;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleTw);
    });
  }

  if (tryAmazonBtn) {
    tryAmazonBtn.addEventListener("click", () => {
      const sampleAmz = "https://www.amazon.co.uk/dp/B098XNCHLD";
      setActivePlatform("Amazon", true, true);
      videoUrlInput.value = sampleAmz;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleAmz);
    });
  }

  if (tryAlibabaBtn) {
    tryAlibabaBtn.addEventListener("click", () => {
      const sampleAli =
        "https://www.alibaba.com/product-detail/Kids-Entertainment-Bouncer-Bouncy-Castle-Waterslide_1601271126969.html";
      setActivePlatform("Alibaba", true, true);
      videoUrlInput.value = sampleAli;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(sampleAli);
    });
  }

  // Detect initial platform from SEO URL path and record state
  const initialPlatform = getPlatformFromPath(window.location.pathname);
  window.history.replaceState({ platform: initialPlatform }, "", window.location.pathname);
  setActivePlatform(initialPlatform, false, false);

  // When user clicks browser Back button:
  // Automatically clear any old pasted URL, clear error alerts, and show the target page cleanly
  window.addEventListener("popstate", (e) => {
    clearAllInputAndResults();
    const currentPath = window.location.pathname.toLowerCase();
    const targetPlatform = (e.state && e.state.platform) ? e.state.platform : getPlatformFromPath(currentPath);
    setActivePlatform(targetPlatform, false, false);
    if (currentPath === "/" || currentPath === "") {
      document.title = "Vidzova - Free Online Video Downloader (YouTube, Pinterest, Amazon, Alibaba, TikTok)";
    }
  });

  // Auto-detect platform when user types or pastes a URL / ASIN
  function autoDetectPlatformFromUrl(val) {
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();
    if (lower.includes("pinterest.") || lower.includes("pin.it/")) {
      setActivePlatform("Pinterest", false, false);
    } else if (lower.includes("snapchat.com")) {
      setActivePlatform("Snapchat", false, false);
    } else if (
      lower.includes("amazon.") ||
      lower.includes("amzn.to") ||
      lower.includes("a.co/") ||
      /^B0[A-Z0-9]{8}$/i.test(trimmed)
    ) {
      setActivePlatform("Amazon", false, false);
    } else if (
      lower.includes("alibaba.com") ||
      lower.includes("1688.com") ||
      lower.includes("aliexpress.com")
    ) {
      setActivePlatform("Alibaba", false, false);
    } else if (lower.includes("facebook.com") || lower.includes("fb.watch")) {
      setActivePlatform("Facebook", false, false);
    } else if (lower.includes("instagram.com")) {
      setActivePlatform("Instagram", false, false);
    } else if (lower.includes("tiktok.com")) {
      setActivePlatform("TikTok", false, false);
    } else if (lower.includes("twitter.com") || lower.includes("x.com")) {
      setActivePlatform("Twitter", false, false);
    } else if (lower.includes("reddit.com") || lower.includes("redd.it")) {
      setActivePlatform("Reddit", false, false);
    } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      setActivePlatform("YouTube", false, false);
    }
  }

  // Input clear button visibility
  videoUrlInput.addEventListener("input", () => {
    const val = videoUrlInput.value.trim();
    clearInputBtn.classList.toggle("hidden", !val);
    if (val) autoDetectPlatformFromUrl(val);
  });

  clearInputBtn.addEventListener("click", () => {
    clearAllInputAndResults();
    videoUrlInput.focus();
  });

  // Paste button
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const trimmed = text.trim();
        videoUrlInput.value = trimmed;
        clearInputBtn.classList.remove("hidden");
        autoDetectPlatformFromUrl(trimmed);
        fetchVideoInfo(trimmed);
      }
    } catch {
      videoUrlInput.focus();
    }
  });

  // Single active sample chip click
  if (activeSampleChip) {
    activeSampleChip.addEventListener("click", () => {
      const url = activeSampleChip.dataset.url;
      if (!url) return;
      videoUrlInput.value = url;
      clearInputBtn.classList.remove("hidden");
      fetchVideoInfo(url);
    });
  }

  // Toggle format dropdown
  formatDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    formatMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!formatMenu.contains(e.target) && e.target !== formatDropdownBtn) {
      formatMenu.classList.add("hidden");
    }
  });

  // Preview button for YouTube embed or direct MP4/Image media
  previewBtn.addEventListener("click", () => {
    if (!currentVideo) return;
    if (!embedContainer.classList.contains("hidden")) {
      embedContainer.classList.add("hidden");
      embedContainer.innerHTML = "";
      return;
    }
    const extLower = (currentVideo.extractor || "").toLowerCase();
    if (extLower.includes("youtube") && currentVideo.id) {
      embedContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(currentVideo.id)}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      embedContainer.classList.remove("hidden");
    } else if (selectedFormat && selectedFormat.direct_url) {
      if (selectedFormat.is_image || ["JPG", "PNG", "WEBP", "GIF"].includes(selectedFormat.ext)) {
        embedContainer.innerHTML = `<img src="${selectedFormat.direct_url}" alt="Preview" />`;
      } else {
        embedContainer.innerHTML = `<video src="${selectedFormat.direct_url}" controls autoplay playsinline></video>`;
      }
      embedContainer.classList.remove("hidden");
    }
  });

  // Form submit
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = videoUrlInput.value.trim();
    if (url) {
      autoDetectPlatformFromUrl(url);
      fetchVideoInfo(url);
    }
  });

  async function fetchVideoInfo(url) {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    activeJobId = null;
    downloadTriggered = false;
    errorBox.classList.add("hidden");
    resultCard.classList.add("hidden");
    downloadProgressBox.classList.add("hidden");
    embedContainer.classList.add("hidden");
    embedContainer.innerHTML = "";
    loadingBox.classList.remove("hidden");
    fetchBtn.disabled = true;

    try {
      let res;
      let data;
      try {
        res = await fetch(`${activeApiBase}/api/info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        data = await res.json();
      } catch (netErr) {
        throw new Error("Unable to connect to download server. Please check your internet connection.");
      }

      const isLocalHost = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if ((!res.ok || (data && data.error)) && isLocalHost && activeApiBase === "") {
        try {
          const localRes = await fetch("http://127.0.0.1:5000/api/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          const localData = await localRes.json();
          if (localRes.ok && !localData.error) {
            activeApiBase = "http://127.0.0.1:5000";
            res = localRes;
            data = localData;
          }
        } catch {}
      }
      if (!res.ok || !data || data.error) {
        throw new Error((data && data.error) || "Unable to fetch video details. Please check the URL.");
      }
      currentVideo = data;
      renderVideoResult(data);
      saveToHistory(data);
    } catch (err) {
      errorText.textContent = err.message;
      errorBox.classList.remove("hidden");
    } finally {
      loadingBox.classList.add("hidden");
      fetchBtn.disabled = false;
    }
  }

  function renderVideoResult(data) {
    const extName = (data.extractor || "Video").toLowerCase();
    const isPin = extName.includes("pinterest");
    const isAmz = extName.includes("amazon");
    const isAli = extName.includes("alibaba");

    videoThumb.src = data.thumbnail || "";
    videoDuration.textContent = data.duration_str || (isPin ? "Pin" : "HD");
    videoExtractor.textContent = data.extractor || "Video";

    if (isPin) {
      videoExtractor.style.background = "#e60023";
    } else if (isAmz) {
      videoExtractor.style.background = "#ff9900";
    } else if (isAli) {
      videoExtractor.style.background = "#ff6a00";
    } else {
      videoExtractor.style.background = "";
    }

    videoTitle.textContent = data.title;
    videoAuthor.textContent = data.uploader || "Creator";
    videoViews.textContent = data.view_count
      ? `${Number(data.view_count).toLocaleString()} views`
      : `${data.extractor || "Media"} • Ready to save`;
    originalLink.href = data.webpage_url || "#";

    const combined = data.formats.combined || [];
    const videoOnly = data.formats.video_only || [];
    const audio = data.formats.audio || [];

    combinedFormatsList.innerHTML = "";
    videoOnlyFormatsList.innerHTML = "";
    audioFormatsList.innerHTML = "";

    if (combinedGroupTitle) {
      if (isPin) {
        combinedGroupTitle.textContent = "Pinterest Video / GIF / HD Image";
      } else if (isAmz || isAli) {
        combinedGroupTitle.textContent = `${data.extractor} Product Videos (MP4)`;
      } else {
        combinedGroupTitle.textContent = "Video with Sound (MP4 / WEBM)";
      }
    }

    combined.forEach((fmt) => {
      combinedFormatsList.appendChild(createFormatOption(fmt));
    });

    if (videoOnly.length > 0) {
      videoOnlyFormatsGroup.classList.remove("hidden");
      if (isPin || isAmz || isAli) {
        highResGroupTitle.textContent = "High-Res Product / Pin Gallery Images";
      } else {
        highResGroupTitle.textContent = data.has_ffmpeg
          ? "High Resolution (Merged Video + Audio)"
          : "High Resolution (Video Stream)";
      }
      videoOnly.forEach((fmt) => {
        videoOnlyFormatsList.appendChild(createFormatOption(fmt));
      });
    } else {
      videoOnlyFormatsGroup.classList.add("hidden");
    }

    if (audio.length > 0) {
      audioFormatsGroup.classList.remove("hidden");
      audio.forEach((fmt) => {
        audioFormatsList.appendChild(createFormatOption(fmt));
      });
    } else {
      audioFormatsGroup.classList.add("hidden");
    }

    const defaultFmt = combined[0] || videoOnly[0] || audio[0];
    if (defaultFmt) {
      selectFormat(defaultFmt);
    }

    // Reset Lyrics UI
    const lDrawer = document.getElementById("lyricsDrawer");
    const lBtn = document.getElementById("lyricsGenerateBtn");
    const lBtnText = document.getElementById("lyricsBtnText");
    const lBadge = document.getElementById("lyricsBadge");
    if (lDrawer) lDrawer.classList.add("hidden");
    if (lBtn) {
      lBtn.disabled = false;
      if (lBtnText) lBtnText.textContent = "Download Lyrics (Same Language)";
      if (lBadge) lBadge.textContent = "Generate";
    }

    resultCard.classList.remove("hidden");
  }

  function createFormatOption(fmt) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sf-format-item";
    const muteIcon = !fmt.has_audio && !fmt.is_image && fmt.ext !== "GIF" ? " 🔇" : "";
    const badgeHtml = fmt.badge
      ? `<span class="sf-mini-badge">${fmt.badge}</span>`
      : "";

    btn.innerHTML = `
      <span class="sf-format-item-left">
        <span>${fmt.ext} ${fmt.quality}${muteIcon}</span>
        ${badgeHtml}
      </span>
      <span class="sf-format-item-right">${fmt.filesize_str || "Auto"}</span>
    `;
    btn.addEventListener("click", () => {
      selectFormat(fmt);
      formatMenu.classList.add("hidden");
    });
    return btn;
  }

  function selectFormat(fmt) {
    selectedFormat = fmt;
    selectedFormatText.textContent = `${fmt.ext} ${fmt.quality}`;
    if (fmt.badge) {
      selectedFormatBadge.textContent = fmt.badge;
      selectedFormatBadge.classList.remove("hidden");
    } else {
      selectedFormatBadge.classList.add("hidden");
    }

    mainDownloadLabel.textContent = `Download ${fmt.ext} ${fmt.quality}`;
    const typeNote = fmt.is_image
      ? "High-Res Image"
      : fmt.ext === "GIF"
      ? "Animated GIF"
      : fmt.has_audio
      ? "With Sound"
      : "Video Stream";
    selectedFormatInfo.textContent = `${fmt.ext} (${fmt.quality}) • ${typeNote} • Size: ${fmt.filesize_str || "Auto"}`;

    if (fmt.direct_url) {
      directStreamLink.href = fmt.direct_url;
      directStreamLink.classList.remove("hidden");
    } else {
      directStreamLink.classList.add("hidden");
    }
  }

  // Trigger server-side download & poll progress
  mainDownloadBtn.addEventListener("click", async () => {
    if (!currentVideo || !selectedFormat) return;

    mainDownloadBtn.disabled = true;
    downloadProgressBox.classList.remove("hidden");
    progressStatusText.textContent = "Starting download on server...";
    progressPercentText.textContent = "0%";
    progressBarFill.style.width = "4%";
    progressBytesText.textContent = "Initializing stream...";
    progressSpeedText.textContent = "";

    try {
        const isDirectMedia = selectedFormat.direct_url &&
          !selectedFormat.direct_url.includes("googlevideo.com") &&
          !selectedFormat.direct_url.includes(".m3u8");

        const res = await fetch(`${activeApiBase}/api/download-start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: currentVideo.webpage_url,
            format_id: selectedFormat.format_id,
            direct_url: isDirectMedia ? selectedFormat.direct_url : "",
            title: currentVideo.title,
            ext: selectedFormat.ext,
          }),
        });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Could not start download.");
      }

      const jobId = data.job_id;
      pollDownloadJob(jobId);
    } catch (err) {
      progressStatusText.textContent = `Error: ${err.message}`;
      mainDownloadBtn.disabled = false;
    }
  });

  function pollDownloadJob(jobId) {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    activeJobId = jobId;
    downloadTriggered = false;

    async function checkStatus() {
      if (activeJobId !== jobId || downloadTriggered) return;

      try {
        const res = await fetch(`${activeApiBase}/api/download-status/${jobId}`);
        if (activeJobId !== jobId || downloadTriggered) return;

        const status = await res.json();
        if (!res.ok || status.error) {
          throw new Error(status.error || "Download failed.");
        }

        if (status.status === "downloading" || status.status === "starting") {
          const pct = status.progress || 5;
          progressStatusText.textContent = "Downloading media...";
          progressPercentText.textContent = `${pct}%`;
          progressBarFill.style.width = `${pct}%`;
          progressBytesText.textContent = `${status.downloaded_str || ""} / ${status.total_str || ""}`;
          progressSpeedText.textContent = status.speed_str || "";
          pollTimer = setTimeout(checkStatus, 1500);
        } else if (status.status === "processing") {
          progressStatusText.textContent = "Finalizing file...";
          progressPercentText.textContent = "100%";
          progressBarFill.style.width = "100%";
          pollTimer = setTimeout(checkStatus, 1500);
        } else if (status.status === "completed") {
          if (downloadTriggered) return;
          downloadTriggered = true;
          activeJobId = null;
          if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
          }

          progressStatusText.textContent = `Completed! Saving "${status.filename}" (${status.filesize_str || ""})`;
          progressPercentText.textContent = "100%";
          progressBarFill.style.width = "100%";
          mainDownloadBtn.disabled = false;

          // Trigger browser attachment download EXACTLY ONCE
          const downloadUrl = status.direct_download_url || `${activeApiBase}/api/download-file/${jobId}`;
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = status.filename || "download";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => a.remove(), 250);
        } else if (status.status === "error") {
          activeJobId = null;
          progressStatusText.textContent = `Download error: ${status.error}`;
          mainDownloadBtn.disabled = false;
        }
      } catch (err) {
        if (activeJobId !== jobId || downloadTriggered) return;
        activeJobId = null;
        progressStatusText.textContent = `Error: ${err.message}`;
        mainDownloadBtn.disabled = false;
      }
    }

    // Start sequential polling (next request only sent after previous returns)
    pollTimer = setTimeout(checkStatus, 800);
  }

  // Recent History Management
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem("sf_history") || "[]");
    } catch {
      return [];
    }
  }

  function saveToHistory(video) {
    const list = getHistory().filter((item) => item.webpage_url !== video.webpage_url);
    list.unshift({
      title: video.title,
      thumbnail: video.thumbnail,
      duration_str: video.duration_str,
      webpage_url: video.webpage_url,
      extractor: video.extractor,
    });
    localStorage.setItem("sf_history", JSON.stringify(list.slice(0, 6)));
    renderHistory();

    if (supabaseClient) {
      let userEmail = null;
      try {
        const u = JSON.parse(localStorage.getItem("vidzova_google_user") || "null");
        userEmail = u?.email || null;
      } catch {}
      supabaseClient
        .from("download_history")
        .insert([
          {
            user_email: userEmail,
            platform: video.extractor || "Video",
            title: video.title || "Video",
            source_url: video.webpage_url || "",
            thumbnail: video.thumbnail || "",
            duration_str: video.duration_str || "",
          },
        ])
        .then(() => {})
        .catch(() => {});
    }
  }

  function renderHistory() {
    const list = getHistory();
    if (list.length === 0) {
      historySection.classList.add("hidden");
      return;
    }
    historySection.classList.remove("hidden");
    historyList.innerHTML = "";
    list.forEach((item) => {
      const card = document.createElement("div");
      card.className = "sf-history-card";
      card.innerHTML = `
        <img src="${item.thumbnail || ""}" alt="" />
        <div class="sf-history-card-info">
          <div class="sf-history-card-title">${item.title}</div>
          <div class="sf-history-card-meta">${item.extractor || "Video"} • ${item.duration_str || ""}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        videoUrlInput.value = item.webpage_url;
        clearInputBtn.classList.remove("hidden");
        autoDetectPlatformFromUrl(item.webpage_url);
        fetchVideoInfo(item.webpage_url);
      });
      historyList.appendChild(card);
    });
  }

  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("sf_history");
    renderHistory();
  });

  renderHistory();

  // Direct Google Login, Account Chooser & Supabase Sync Logic
  const DEFAULT_SUPABASE_URL = "https://cavipmpeegxhkuyhrhwd.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdmlwbXBlZWd4aGt1eWhyaHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzEwMDcsImV4cCI6MjEwODQ0NzAwN30.u1VIOKaURK2uBASIzzQhAqXBrAF5njwSivwOYPO_wuI";
  let supabaseClient = window.supabase
    ? window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY)
    : null;
  fetch("/api/config")
    .then((r) => r.json())
    .then((cfg) => {
      if (cfg && cfg.supabase_url && cfg.supabase_anon_key && window.supabase) {
        supabaseClient = window.supabase.createClient(
          cfg.supabase_url,
          cfg.supabase_anon_key
        );
      }
    })
    .catch(() => {});

  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const userProfileBox = document.getElementById("userProfileBox");
  const userAvatar = document.getElementById("userAvatar");
  const userNameText = document.getElementById("userNameText");
  const userEmailText = document.getElementById("userEmailText");
  const googleLogoutBtn = document.getElementById("googleLogoutBtn");
  const googleLoginModal = document.getElementById("googleLoginModal");
  const closeGoogleModalBtn = document.getElementById("closeGoogleModalBtn");
  const googleAccountList = document.getElementById("googleAccountList");
  const useAnotherAccountBtn = document.getElementById("useAnotherAccountBtn");
  const googleLoginForm = document.getElementById("googleLoginForm");
  const googleEmailInput = document.getElementById("googleEmailInput");

  function formatNameFromEmail(email) {
    const local = (email.split("@")[0] || "User")
      .replace(/[0-9]+/g, "")
      .replace(/[._-]+/g, " ")
      .trim();
    if (!local) return "Google User";
    return local
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function getSavedGoogleAccounts() {
    try {
      const list = JSON.parse(localStorage.getItem("vidzova_google_accounts") || "null");
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return [
      {
        name: "Ibrar Hasan",
        email: "ibrar.hasan7@gmail.com",
      },
    ];
  }

  function saveGoogleAccountToList(user) {
    const accounts = getSavedGoogleAccounts().filter(
      (a) => a.email.toLowerCase() !== user.email.toLowerCase()
    );
    accounts.unshift(user);
    localStorage.setItem("vidzova_google_accounts", JSON.stringify(accounts.slice(0, 5)));
  }

  function signInDirectlyWithGoogle(account) {
    const email = account.email.trim();
    const name = account.name || formatNameFromEmail(email);
    const userObj = { name, email };
    localStorage.setItem("vidzova_google_user", JSON.stringify(userObj));
    saveGoogleAccountToList(userObj);
    if (googleLoginModal) googleLoginModal.classList.add("hidden");
    renderGoogleUser();

    if (supabaseClient) {
      supabaseClient
        .from("users")
        .upsert(
          [{ email, name, last_sign_in: new Date().toISOString() }],
          { onConflict: "email" }
        )
        .then(() => {})
        .catch(() => {});
    }
  }

  function renderAccountChooserList() {
    if (!googleAccountList) return;
    const accounts = getSavedGoogleAccounts();
    googleAccountList.innerHTML = "";
    accounts.forEach((acc) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sf-google-account-row";
      const initial = (acc.name || acc.email || "G").charAt(0).toUpperCase();
      btn.innerHTML = `
        <span class="sf-google-account-avatar">${initial}</span>
        <span class="sf-google-account-details">
          <span class="sf-google-account-name">${acc.name || formatNameFromEmail(acc.email)}</span>
          <span class="sf-google-account-email">${acc.email}</span>
        </span>
      `;
      btn.addEventListener("click", () => {
        signInDirectlyWithGoogle(acc);
      });
      googleAccountList.appendChild(btn);
    });
  }

  function renderGoogleUser() {
    try {
      const saved = JSON.parse(localStorage.getItem("vidzova_google_user") || "null");
      if (saved && saved.email) {
        if (googleLoginBtn) googleLoginBtn.classList.add("hidden");
        if (userProfileBox) userProfileBox.classList.remove("hidden");
        const name = saved.name || formatNameFromEmail(saved.email);
        if (userNameText) userNameText.textContent = name;
        if (userEmailText) userEmailText.textContent = saved.email;
        if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();
      } else {
        if (googleLoginBtn) googleLoginBtn.classList.remove("hidden");
        if (userProfileBox) userProfileBox.classList.add("hidden");
      }
    } catch {
      if (googleLoginBtn) googleLoginBtn.classList.remove("hidden");
      if (userProfileBox) userProfileBox.classList.add("hidden");
    }
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      renderAccountChooserList();
      if (googleLoginForm) googleLoginForm.classList.add("hidden");
      if (googleLoginModal) googleLoginModal.classList.remove("hidden");
    });
  }

  if (useAnotherAccountBtn) {
    useAnotherAccountBtn.addEventListener("click", () => {
      if (googleLoginForm) {
        googleLoginForm.classList.toggle("hidden");
        if (!googleLoginForm.classList.contains("hidden") && googleEmailInput) {
          googleEmailInput.focus();
        }
      }
    });
  }

  if (closeGoogleModalBtn) {
    closeGoogleModalBtn.addEventListener("click", () => {
      if (googleLoginModal) googleLoginModal.classList.add("hidden");
    });
  }

  if (googleLoginModal) {
    googleLoginModal.addEventListener("click", (e) => {
      if (e.target === googleLoginModal) {
        googleLoginModal.classList.add("hidden");
      }
    });
  }

  if (googleLoginForm) {
    googleLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (googleEmailInput?.value || "").trim();
      if (!email) return;
      signInDirectlyWithGoogle({
        name: formatNameFromEmail(email),
        email,
      });
      googleEmailInput.value = "";
    });
  }

  if (googleLogoutBtn) {
    googleLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem("vidzova_google_user");
      renderGoogleUser();
    });
  }

  // --- Lyrics Generation & Download Handler ---
  const lyricsGenerateBtn = document.getElementById("lyricsGenerateBtn");
  const lyricsDrawer = document.getElementById("lyricsDrawer");
  const lyricsPre = document.getElementById("lyricsPre");
  const lyricsLangTag = document.getElementById("lyricsLangTag");
  const lyricsLineCount = document.getElementById("lyricsLineCount");
  const lyricsBtnText = document.getElementById("lyricsBtnText");
  const lyricsBadge = document.getElementById("lyricsBadge");
  const copyLyricsBtn = document.getElementById("copyLyricsBtn");
  const copyLyricsLabel = document.getElementById("copyLyricsLabel");
  const pasteLyricsBtn = document.getElementById("pasteLyricsBtn");
  const pasteLyricsLabel = document.getElementById("pasteLyricsLabel");
  const lyricsOpenEditorBtn = document.getElementById("lyricsOpenEditorBtn");
  const saveLyricsTxtBtn = document.getElementById("saveLyricsTxtBtn");
  const closeLyricsDrawerBtn = document.getElementById("closeLyricsDrawerBtn");
  const sceneExtractorBtn = document.getElementById("sceneExtractorBtn");

  let currentLyricsData = null;

  function downloadLyricsAsFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "lyrics.txt";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);
  }

  function updateLyricsFromBox(text) {
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const count = lines.length;
    if (lyricsLineCount) {
      lyricsLineCount.textContent = count ? `• ${count} lines` : "";
    }
    const songTitle = (currentVideo && currentVideo.title) || "Song Lyrics";
    const safeTitle = songTitle.replace(/[\\/*?:"<>|]/g, "").trim().slice(0, 50);
    if (!currentLyricsData) {
      currentLyricsData = {
        title: songTitle,
        language: "Original / Custom",
        lyrics: text,
        line_count: count,
        filename: `${safeTitle} - Lyrics.txt`,
      };
    } else {
      currentLyricsData.lyrics = text;
      currentLyricsData.line_count = count;
      if (!currentLyricsData.filename) {
        currentLyricsData.filename = `${safeTitle} - Lyrics.txt`;
      }
    }
  }

  if (lyricsPre) {
    lyricsPre.addEventListener("input", () => {
      updateLyricsFromBox(lyricsPre.value);
    });
  }

  if (lyricsOpenEditorBtn) {
    lyricsOpenEditorBtn.addEventListener("click", () => {
      if (lyricsDrawer) {
        lyricsDrawer.classList.toggle("hidden");
        if (!lyricsDrawer.classList.contains("hidden") && lyricsPre) {
          lyricsPre.focus();
        }
      }
    });
  }

  if (pasteLyricsBtn) {
    pasteLyricsBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim() && lyricsPre) {
          lyricsPre.value = text;
          updateLyricsFromBox(text);
          if (lyricsLangTag) lyricsLangTag.textContent = "Pasted Lyrics (Custom)";
          if (pasteLyricsLabel) pasteLyricsLabel.textContent = "Pasted! ✓";
          setTimeout(() => {
            if (pasteLyricsLabel) pasteLyricsLabel.textContent = "Paste";
          }, 2000);
        } else if (lyricsPre) {
          lyricsPre.focus();
        }
      } catch {
        if (lyricsPre) {
          lyricsPre.focus();
        }
      }
    });
  }

  if (lyricsGenerateBtn) {
    lyricsGenerateBtn.addEventListener("click", async () => {
      const url = videoUrlInput.value.trim() || (currentVideo && currentVideo.webpage_url);
      if (!url) return;

      lyricsGenerateBtn.disabled = true;
      if (lyricsBtnText) lyricsBtnText.textContent = "Analyzing Video & Searching Google Lyrics...";
      if (lyricsBadge) lyricsBadge.textContent = "Searching...";

      const videoTitle = (currentVideo && currentVideo.title) || "";

      try {
        let res = await fetch(`${activeApiBase}/api/lyrics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, title: videoTitle }),
        });
        let data = await res.json();

        const isLocalDev = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        if ((!res.ok || data.error) && isLocalDev && activeApiBase !== "http://127.0.0.1:5000") {
          try {
            const localRes = await fetch("http://127.0.0.1:5000/api/lyrics", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url, title: videoTitle }),
            });
            const localData = await localRes.json();
            if (localRes.ok && !localData.error) {
              res = localRes;
              data = localData;
            }
          } catch {}
        }

        if (!res.ok || data.error || !data.lyrics) {
          throw new Error(data.error || "Lyrics not available in original language for this media.");
        }

        currentLyricsData = data;
        if (lyricsLangTag) lyricsLangTag.textContent = `Original Language (${data.language})`;
        if (lyricsLineCount) lyricsLineCount.textContent = `• ${data.line_count} lines`;
        if (lyricsPre) {
          lyricsPre.value = data.lyrics;
        }
        if (lyricsDrawer) lyricsDrawer.classList.remove("hidden");

        if (lyricsBtnText) lyricsBtnText.textContent = `Lyrics Generated (${data.language}) ✓`;
        if (lyricsBadge) lyricsBadge.textContent = "Downloaded";

        // Auto download .txt file
        downloadLyricsAsFile(data.filename, data.lyrics);
      } catch (err) {
        alert(err.message || "Could not retrieve lyrics for this video. You can paste lyrics into the box manually!");
        if (lyricsDrawer) lyricsDrawer.classList.remove("hidden");
        if (lyricsPre) lyricsPre.focus();
        if (lyricsBtnText) lyricsBtnText.textContent = "Download Lyrics (Same Language)";
        if (lyricsBadge) lyricsBadge.textContent = "Generate";
      } finally {
        lyricsGenerateBtn.disabled = false;
      }
    });
  }

  if (saveLyricsTxtBtn) {
    saveLyricsTxtBtn.addEventListener("click", () => {
      const textToSave = (lyricsPre && lyricsPre.value) || (currentLyricsData && currentLyricsData.lyrics);
      if (textToSave && textToSave.trim()) {
        const songTitle = (currentVideo && currentVideo.title) || (currentLyricsData && currentLyricsData.title) || "Song Lyrics";
        const safeTitle = songTitle.replace(/[\\/*?:"<>|]/g, "").trim().slice(0, 50);
        const langPart = (currentLyricsData && currentLyricsData.language) ? ` (${currentLyricsData.language})` : "";
        const fn = (currentLyricsData && currentLyricsData.filename) || `${safeTitle} - Lyrics${langPart}.txt`;
        downloadLyricsAsFile(fn, textToSave);
      } else {
        alert("Please paste or generate lyrics into the box before saving!");
      }
    });
  }

  if (copyLyricsBtn) {
    copyLyricsBtn.addEventListener("click", async () => {
      const textToCopy = (lyricsPre && lyricsPre.value) || (currentLyricsData && currentLyricsData.lyrics);
      if (textToCopy && textToCopy.trim()) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          if (copyLyricsLabel) copyLyricsLabel.textContent = "Copied! ✓";
          setTimeout(() => {
            if (copyLyricsLabel) copyLyricsLabel.textContent = "Copy";
          }, 2000);
        } catch {
          if (lyricsPre) {
            lyricsPre.select();
            document.execCommand("copy");
            if (copyLyricsLabel) copyLyricsLabel.textContent = "Copied! ✓";
            setTimeout(() => {
              if (copyLyricsLabel) copyLyricsLabel.textContent = "Copy";
            }, 2000);
          }
        }
      }
    });
  }

  if (closeLyricsDrawerBtn) {
    closeLyricsDrawerBtn.addEventListener("click", () => {
      if (lyricsDrawer) lyricsDrawer.classList.add("hidden");
    });
  }

  if (sceneExtractorBtn) {
    sceneExtractorBtn.addEventListener("click", () => {
      const url = videoUrlInput.value.trim() || (currentVideo && (currentVideo.webpage_url || currentVideo.url));
      if (url) {
        window.location.href = `/video-scene-extractor?url=${encodeURIComponent(url)}`;
      } else {
        window.location.href = "/video-scene-extractor";
      }
    });
  }

  
  renderGoogleUser();
});
