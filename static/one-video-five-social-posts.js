/**
 * VidZova — One Video, 5 Social Posts Engine
 * Handles client-side video inspection, platform toggles, context gathering,
 * AI & heuristic post generation, inline editing, multi-format exports,
 * and AI Social Post Image Generation.
 */

(function () {
  "use strict";

  // DOM Elements
  const dropzone = document.getElementById("v5sDropzone");
  const fileInput = document.getElementById("v5sFileInput");
  const filePreviewBox = document.getElementById("v5sFilePreviewBox");
  const miniVideo = document.getElementById("v5sMiniVideo");
  const fileNameEl = document.getElementById("v5sFileName");
  const fileSizeChip = document.getElementById("v5sFileSizeChip");
  const fileDurationChip = document.getElementById("v5sFileDurationChip");
  const fileResChip = document.getElementById("v5sFileResChip");
  const fileFormatChip = document.getElementById("v5sFileFormatChip");
  const removeFileBtn = document.getElementById("v5sRemoveFileBtn");

  const alertBox = document.getElementById("v5sAlert");
  const alertTitle = document.getElementById("v5sAlertTitle");
  const alertMsg = document.getElementById("v5sAlertMsg");
  const alertClose = document.getElementById("v5sAlertClose");

  const platformCards = document.querySelectorAll(".v5s-platform-card");
  const selectAllPlatformsBtn = document.getElementById("v5sSelectAllPlatforms");
  const deselectAllPlatformsBtn = document.getElementById("v5sClearAllPlatforms");

  const toggleContextBtn = document.getElementById("v5sToggleContextBtn");
  const contextForm = document.getElementById("v5sContextForm");
  const topicInput = document.getElementById("v5sTopicInput");
  const audienceInput = document.getElementById("v5sAudienceInput");
  const goalSelect = document.getElementById("v5sGoalSelect");
  const toneSelect = document.getElementById("v5sToneSelect");
  const languageSelect = document.getElementById("v5sLanguageSelect");
  const keywordsInput = document.getElementById("v5sKeywordsInput");
  const ctaInput = document.getElementById("v5sCtaInput");
  const summaryInput = document.getElementById("v5sSummaryInput");
  const autoImagesCheckbox = document.getElementById("v5sAutoImagesCheckbox");

  // Google Auth & Quota DOM Elements
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
  const googleQuotaBox = document.getElementById("v5sGoogleQuotaBox");

  const generateBtn = document.getElementById("v5sGenerateBtn");
  const progressBox = document.getElementById("v5sProgressBox");
  const progressStatus = document.getElementById("v5sProgressStatus");
  const progressBar = document.getElementById("v5sProgressBar");

  const resultsSection = document.getElementById("v5sResultsSection");
  const cardsGrid = document.getElementById("v5sCardsGrid");
  const generateAllImagesBtn = document.getElementById("v5sGenerateAllImagesBtn");
  const copyAllBtn = document.getElementById("v5sCopyAllBtn");
  const downloadTxtBtn = document.getElementById("v5sDownloadTxtBtn");
  const exportJsonBtn = document.getElementById("v5sExportJsonBtn");
  const regenerateAllBtn = document.getElementById("v5sRegenerateAllBtn");
  const clearAllBtn = document.getElementById("v5sClearAllBtn");

  const toastEl = document.getElementById("v5sToast");
  const toastMsg = document.getElementById("v5sToastMsg");

  // Modal Lightbox Elements
  const imgModal = document.getElementById("v5sImgModal");
  const modalImg = document.getElementById("v5sModalImg");
  const imgModalClose = document.getElementById("v5sImgModalClose");
  const modalDownloadLink = document.getElementById("v5sModalDownloadLink");

  // Theme Switcher Button
  const themeToggle = document.getElementById("themeToggle");

  // State Variables
  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit
  let currentFile = null;
  let videoMetadata = {
    filename: "video.mp4",
    duration: 0,
    sizeBytes: 0,
    sizeStr: "0 MB",
    width: 1920,
    height: 1080,
    format: "MP4",
  };
  let generatedPosts = {};
  let generatedImages = {}; // key -> { url, prompt }
  let isGenerating = false;
  let toastTimer = null;

  // Platform Definitions & Icons
  const PLATFORM_CONFIG = {
    instagram: {
      name: "Instagram Reels",
      color: "#e1306c",
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
      defaultFormat: "9:16 Vertical Video (1080x1920) • Under 60s",
    },
    tiktok: {
      name: "TikTok",
      color: "#00f2fe",
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.4a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 3.77.94V6.69z"/></svg>`,
      defaultFormat: "9:16 Full Screen Vertical • High-energy hook",
    },
    youtube_shorts: {
      name: "YouTube Shorts",
      color: "#ff0000",
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
      defaultFormat: "9:16 Vertical (1080x1920) • Loop-friendly",
    },
    facebook: {
      name: "Facebook Reels",
      color: "#1877f2",
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
      defaultFormat: "9:16 or 4:5 with bold captions",
    },
    linkedin: {
      name: "LinkedIn",
      color: "#0a66c2",
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 0-2.9 1.45 1.45 0 0 0 0 2.9M7.86 18.5v-8.37H5.07v8.37h2.79z"/></svg>`,
      defaultFormat: "1:1 Square or 16:9 Landscape Video Post",
    },
  };

  // ============================================================================
  // Theme Setup & Toggle (Dark & Light Mode Support)
  // ============================================================================
  function initTheme() {
    const saved = localStorage.getItem("sf_theme") || localStorage.getItem("theme");
    if (saved === "light") {
      document.body.classList.remove("dark-mode");
    } else {
      document.body.classList.add("dark-mode");
    }
  }

  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-mode");
      const mode = isDark ? "dark" : "light";
      localStorage.setItem("sf_theme", mode);
      localStorage.setItem("theme", mode);
    });
  }

  // ============================================================================
  // Toast & Alert Helpers
  // ============================================================================
  function showToast(msg, duration = 3000) {
    if (!toastEl) return;
    toastMsg.textContent = msg;
    toastEl.classList.remove("hidden");
    toastEl.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("visible");
      setTimeout(() => toastEl.classList.add("hidden"), 200);
    }, duration);
  }

  function showAlert(title, message) {
    if (!alertBox) return;
    alertTitle.textContent = title;
    alertMsg.textContent = message;
    alertBox.classList.remove("hidden");
    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.classList.add("hidden");
  }

  if (alertClose) {
    alertClose.addEventListener("click", hideAlert);
  }

  // ============================================================================
  // Video Upload & Client-Side Validation
  // ============================================================================
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    ["dragleave", "dragend"].forEach((evt) => {
      dropzone.addEventListener(evt, () => dropzone.classList.remove("dragover"));
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    hideAlert();
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const ext = file.name.split(".").pop().toLowerCase();
    const isAllowedExt = ["mp4", "webm", "mov"].includes(ext);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      showAlert(
        "Unsupported File Format",
        `"${file.name}" is not a supported format. Please upload an MP4, MOV, or WebM video.`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showAlert(
        "File Exceeds 100 MB Limit",
        `Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The safe browser processing limit is 100 MB.`
      );
      return;
    }

    currentFile = file;
    videoMetadata.filename = file.name;
    videoMetadata.sizeBytes = file.size;
    videoMetadata.sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    videoMetadata.format = ext.toUpperCase();

    const blobUrl = URL.createObjectURL(file);
    miniVideo.src = blobUrl;
    miniVideo.onloadedmetadata = function () {
      videoMetadata.duration = Math.round(miniVideo.duration || 0);
      videoMetadata.width = miniVideo.videoWidth || 1920;
      videoMetadata.height = miniVideo.videoHeight || 1080;

      fileNameEl.textContent = file.name;
      fileSizeChip.textContent = videoMetadata.sizeStr;
      fileDurationChip.textContent = formatDuration(videoMetadata.duration);
      fileResChip.textContent = `${videoMetadata.width}x${videoMetadata.height}`;
      fileFormatChip.textContent = videoMetadata.format;

      dropzone.classList.add("hidden");
      filePreviewBox.classList.remove("hidden");
      showToast(`Video loaded: ${file.name}`);
    };

    miniVideo.onerror = function () {
      showAlert(
        "Video Decoding Error",
        "Your browser could not decode this video. Ensure it has standard H.264 / AAC or VP9 / Opus encoding."
      );
      removeCurrentFile();
    };
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function removeCurrentFile() {
    currentFile = null;
    if (fileInput) fileInput.value = "";
    if (miniVideo) {
      miniVideo.pause();
      miniVideo.src = "";
    }
    filePreviewBox.classList.add("hidden");
    dropzone.classList.remove("hidden");
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener("click", removeCurrentFile);
  }

  // ============================================================================
  // Target Platform Selection Logic (Fixed Single Select/Deselect Bug)
  // ============================================================================
  platformCards.forEach((card) => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    // Listen to change event on the checkbox (triggered naturally by label clicks)
    checkbox.addEventListener("change", () => {
      card.classList.toggle("active", checkbox.checked);
    });

    // Also support Space and Enter keys for accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        card.classList.toggle("active", checkbox.checked);
      }
    });
  });

  if (selectAllPlatformsBtn) {
    selectAllPlatformsBtn.addEventListener("click", () => {
      platformCards.forEach((card) => {
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = true;
          card.classList.add("active");
        }
      });
    });
  }

  if (deselectAllPlatformsBtn) {
    deselectAllPlatformsBtn.addEventListener("click", () => {
      platformCards.forEach((card) => {
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = false;
          card.classList.remove("active");
        }
      });
    });
  }

  // Toggle Context Form
  if (toggleContextBtn && contextForm) {
    toggleContextBtn.addEventListener("click", () => {
      const isHidden = contextForm.classList.contains("hidden");
      if (isHidden) {
        contextForm.classList.remove("hidden");
        toggleContextBtn.querySelector("span").textContent = "Hide Settings";
        toggleContextBtn.classList.add("expanded");
      } else {
        contextForm.classList.add("hidden");
        toggleContextBtn.querySelector("span").textContent = "Show Settings";
        toggleContextBtn.classList.remove("expanded");
      }
    });
  }

  function getSelectedPlatforms() {
    const selected = [];
    platformCards.forEach((card) => {
      const cb = card.querySelector('input[type="checkbox"]');
      if (cb && cb.checked) {
        selected.push(card.getAttribute("data-platform"));
      }
    });
    return selected;
  }

  function getContextData() {
    return {
      topic: topicInput ? topicInput.value.trim() : "",
      audience: audienceInput ? audienceInput.value.trim() : "",
      goal: goalSelect ? goalSelect.value : "engagement",
      tone: toneSelect ? toneSelect.value : "engaging",
      language: languageSelect ? languageSelect.value : "English",
      keywords: keywordsInput ? keywordsInput.value.trim() : "",
      cta: ctaInput ? ctaInput.value.trim() : "",
      summary: summaryInput ? summaryInput.value.trim() : "",
    };
  }

  // ============================================================================
  // Post Generation Engine
  // ============================================================================
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      hideAlert();

      const loggedUser = getLoggedInGoogleUser();
      if (!loggedUser) {
        showGoogleModal();
        showAlert(
          "Google Sign-In Required",
          "Only Google users can generate social posts. Please sign in with your Google account to get 5 free generations."
        );
        return;
      }

      if (userQuota.remaining <= 0) {
        showAlert(
          "Generation Limit Reached",
          `You have used all 5 free post generations for this Google account (${loggedUser.email}). Please switch to another Google account to continue.`
        );
        return;
      }

      const selectedPlatforms = getSelectedPlatforms();
      if (selectedPlatforms.length === 0) {
        showAlert("No Platform Selected", "Please select at least one social media platform card.");
        return;
      }

      const contextData = getContextData();
      startGeneration(selectedPlatforms, contextData);
    });
  }

  async function startGeneration(selectedPlatforms, contextData) {
    if (isGenerating) return;
    isGenerating = true;

    generateBtn.disabled = true;
    generateBtn.classList.add("loading");
    progressBox.classList.remove("hidden");
    progressBar.style.width = "20%";
    progressStatus.textContent = "Analyzing video metadata & extracting topic context...";

    try {
      await new Promise((r) => setTimeout(r, 450));
      progressBar.style.width = "45%";
      progressStatus.textContent = "Formulating platform angles & scroll-stopping hooks...";

      await new Promise((r) => setTimeout(r, 350));
      progressBar.style.width = "75%";
      progressStatus.textContent = "Writing tailored platform captions & hashtags...";

      const loggedUser = getLoggedInGoogleUser();
      const payload = {
        video_metadata: {
          filename: videoMetadata.filename,
          duration: videoMetadata.duration,
          resolution: `${videoMetadata.width}x${videoMetadata.height}`,
          format: videoMetadata.format,
          size: videoMetadata.sizeStr,
        },
        context: contextData,
        platforms: selectedPlatforms,
        google_user: loggedUser,
      };

      const resp = await fetch("/api/generate-social-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        if (resp.status === 401) {
          showGoogleModal();
          throw new Error(data.error || "Google Sign-In required. Please sign in with your Google account.");
        }
        if (resp.status === 403) {
          userQuota.remaining = 0;
          renderQuotaBox();
          throw new Error(data.error || "You have reached your 5 free post generations limit for this Google account.");
        }
        throw new Error(data.error || `Server responded with status ${resp.status}`);
      }

      if (data.status !== "success" || !data.posts) {
        throw new Error(data.error || "Generation engine returned invalid response.");
      }

      // Sync quota from successful generation response
      if (typeof data.generations_used !== "undefined" && loggedUser) {
        userQuota.used = data.generations_used;
        userQuota.remaining = data.generations_remaining;
        userQuota.limit = data.limit || 5;
        localStorage.setItem(`v5s_gen_count_${loggedUser.email.toLowerCase()}`, String(userQuota.used));
        renderQuotaBox();
      }

      progressBar.style.width = "100%";
      progressStatus.textContent = "Done! Rendering platform posts...";

      generatedPosts = data.posts;
      saveSessionState();

      await new Promise((r) => setTimeout(r, 250));
      progressBox.classList.add("hidden");
      renderResultsCards(generatedPosts);
      resultsSection.classList.remove("hidden");
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

      showToast(`Generated ${selectedPlatforms.length} social posts!`);

      // Auto-trigger image generation if toggle is checked
      if (autoImagesCheckbox && autoImagesCheckbox.checked) {
        generateAllPostImages();
      }
    } catch (err) {
      console.error("Generation error:", err);
      showAlert("Generation Failed", `An error occurred while generating posts: ${err.message}. Please try again.`);
      progressBox.classList.add("hidden");
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.classList.remove("loading");
    }
  }

  // ============================================================================
  // Render Result Cards with AI Post Image Box
  // ============================================================================
  function renderResultsCards(posts) {
    cardsGrid.innerHTML = "";
    const platformKeys = Object.keys(posts);

    if (platformKeys.length === 0) {
      cardsGrid.innerHTML = `<p class="v5s-empty-msg">No posts generated yet. Choose your platforms and click Generate.</p>`;
      return;
    }

    platformKeys.forEach((key) => {
      const post = posts[key];
      const cfg = PLATFORM_CONFIG[key] || {
        name: key.toUpperCase(),
        color: "#ff6a00",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle></svg>`,
        defaultFormat: "Vertical Video",
      };

      const card = document.createElement("div");
      card.className = "v5s-result-card";
      card.setAttribute("data-platform-key", key);

      const hashtagsList = Array.isArray(post.hashtags)
        ? post.hashtags
        : typeof post.hashtags === "string"
        ? post.hashtags.split(" ").filter(Boolean)
        : [];

      const hashtagsHtml = hashtagsList
        .map((tag) => `<span class="v5s-hashtag-pill">${escapeHtml(tag)}</span>`)
        .join("");

      card.innerHTML = `
        <div class="v5s-card-top-bar" style="border-top-color: ${cfg.color}">
          <div class="v5s-card-plat-info">
            <span class="v5s-card-icon" style="color: ${cfg.color}">${cfg.iconSvg}</span>
            <strong class="v5s-card-plat-name">${escapeHtml(cfg.name)}</strong>
          </div>
          <span class="v5s-card-format-badge">${escapeHtml(post.recommended_format || cfg.defaultFormat)}</span>
        </div>

        <div class="v5s-card-body">
          <!-- Hook Section -->
          <div class="v5s-card-section v5s-hook-section">
            <span class="v5s-section-label">Opening Hook</span>
            <div class="v5s-hook-text" contenteditable="false">${escapeHtml(post.hook || "")}</div>
          </div>

          <!-- Title Section -->
          ${
            post.title
              ? `
          <div class="v5s-card-section v5s-title-section">
            <span class="v5s-section-label">Suggested Title</span>
            <div class="v5s-title-text" contenteditable="false">${escapeHtml(post.title)}</div>
          </div>`
              : ""
          }

          <!-- AI Generated Post Image Box -->
          <div class="v5s-card-image-box" id="v5sCardImgBox_${key}">
            ${renderCardImageBoxContent(key, cfg)}
          </div>

          <!-- Caption Section -->
          <div class="v5s-card-section v5s-caption-section">
            <span class="v5s-section-label">Main Caption</span>
            <div class="v5s-caption-text" contenteditable="false">${formatCaptionHtml(post.caption || "")}</div>
          </div>

          <!-- Hashtags Section -->
          <div class="v5s-card-section v5s-hashtags-section">
            <span class="v5s-section-label">Hashtags</span>
            <div class="v5s-hashtags-wrap">${hashtagsHtml}</div>
          </div>

          <!-- Call To Action Section -->
          <div class="v5s-card-section v5s-cta-section">
            <span class="v5s-section-label">Call To Action (CTA)</span>
            <div class="v5s-cta-text" contenteditable="false">${escapeHtml(post.cta || "")}</div>
          </div>
        </div>

        <!-- Card Action Footer -->
        <div class="v5s-card-actions">
          <button type="button" class="v5s-card-btn v5s-copy-post-btn" title="Copy formatted post to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy Post</span>
          </button>
          <button type="button" class="v5s-card-btn v5s-gen-single-img-action" title="Generate or reroll AI image for this platform">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>AI Image</span>
          </button>
          <button type="button" class="v5s-card-btn v5s-edit-post-btn" title="Edit post content inline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>Edit</span>
          </button>
          <button type="button" class="v5s-card-btn v5s-regen-post-btn" title="Regenerate this platform's post copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>Regenerate</span>
          </button>
          <button type="button" class="v5s-card-btn v5s-dl-post-btn" title="Download post as .txt file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>TXT</span>
          </button>
        </div>
      `;

      attachCardEventListeners(card, key);
      cardsGrid.appendChild(card);
    });
  }

  function renderCardImageBoxContent(key, cfg) {
    const imgData = generatedImages[key];
    if (imgData && imgData.url) {
      const dlUrl = `/api/proxy-image?url=${encodeURIComponent(imgData.url)}&filename=${encodeURIComponent(key + '_post_image.png')}`;
      return `
        <div class="v5s-card-img-wrap">
          <img src="${escapeHtml(imgData.url)}" class="v5s-card-img" alt="${escapeHtml(cfg.name)} Visual" loading="lazy" />
          <div class="v5s-img-overlay-bar">
            <span class="v5s-img-tag">AI Visual</span>
            <div class="v5s-img-btns">
              <button type="button" class="v5s-img-btn v5s-img-view-btn" data-key="${key}" title="View Full Resolution">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>View</span>
              </button>
              <a href="${dlUrl}" class="v5s-img-btn v5s-img-dl-btn" title="Download High-Res Image" download="${key}_post_image.png">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Save</span>
              </a>
              <button type="button" class="v5s-img-btn v5s-img-reroll-btn" data-key="${key}" title="Regenerate Image">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <span>Reroll</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="v5s-img-placeholder">
        <div class="v5s-img-placeholder-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <div class="v5s-img-placeholder-title">${escapeHtml(cfg.name)} Post Visual</div>
        <button type="button" class="v5s-generate-single-img-btn" data-key="${key}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Generate Post Image</span>
        </button>
      </div>
    `;
  }

  // ============================================================================
  // AI Post Image Generation Logic (AI)
  // ============================================================================
  async function generatePostImage(key) {
    const box = document.getElementById(`v5sCardImgBox_${key}`);
    const cfg = PLATFORM_CONFIG[key] || { name: key };
    const post = generatedPosts[key] || {};
    const contextData = getContextData();

    if (box) {
      box.innerHTML = `
        <div class="v5s-img-loading">
          <div class="v5s-img-spinner"></div>
          <span class="v5s-img-loading-text">Generating image for ${escapeHtml(cfg.name)}...</span>
        </div>
      `;
    }

    const loggedUser = getLoggedInGoogleUser();
    if (!loggedUser) {
      showGoogleModal();
      showToast("Please sign in with Google to generate post visuals.");
      if (box) box.innerHTML = renderCardImageBoxContent(key, cfg);
      return;
    }

    try {
      const payload = {
        platform: key,
        title: post.title || videoMetadata.filename,
        hook: post.hook || "",
        caption: post.caption || "",
        topic: contextData.topic || videoMetadata.filename,
        google_user: loggedUser,
      };

      const resp = await fetch("/api/generate-post-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok || data.status !== "success" || !data.image_url) {
        throw new Error(data.error || "Image generation failed.");
      }

      generatedImages[key] = {
        url: data.image_url,
        prompt: data.revised_prompt || data.prompt,
      };

      saveSessionState();

      if (box) {
        box.innerHTML = renderCardImageBoxContent(key, cfg);
        attachImageBoxListeners(box, key);
      }

      showToast(`Generated visual for ${cfg.name}!`);
    } catch (err) {
      console.error(`Image generation error for ${key}:`, err);
      if (box) {
        box.innerHTML = `
          <div class="v5s-img-placeholder">
            <div class="v5s-img-placeholder-title" style="color:#f87171;">Image Generation Notice</div>
            <p style="font-size:0.78rem; color:var(--sf-text-muted); margin:0 8px 6px;">${escapeHtml(err.message)}</p>
            <button type="button" class="v5s-generate-single-img-btn" data-key="${key}">
              <span>Try Again</span>
            </button>
          </div>
        `;
        attachImageBoxListeners(box, key);
      }
    }
  }

  async function generateAllPostImages() {
    const platformKeys = Object.keys(generatedPosts);
    if (platformKeys.length === 0) {
      showToast("No posts generated yet.");
      return;
    }

    showToast(`Generating images for ${platformKeys.length} platforms...`, 4000);

    if (generateAllImagesBtn) {
      generateAllImagesBtn.disabled = true;
      generateAllImagesBtn.style.opacity = "0.7";
    }

    try {
      // Execute concurrently
      await Promise.allSettled(platformKeys.map((key) => generatePostImage(key)));
      showToast("Completed image generation for all selected platforms!");
    } finally {
      if (generateAllImagesBtn) {
        generateAllImagesBtn.disabled = false;
        generateAllImagesBtn.style.opacity = "1";
      }
    }
  }

  if (generateAllImagesBtn) {
    generateAllImagesBtn.addEventListener("click", generateAllPostImages);
  }

  function attachImageBoxListeners(box, key) {
    const genBtn = box.querySelector(".v5s-generate-single-img-btn");
    if (genBtn) {
      genBtn.addEventListener("click", () => generatePostImage(key));
    }

    const rerollBtn = box.querySelector(".v5s-img-reroll-btn");
    if (rerollBtn) {
      rerollBtn.addEventListener("click", () => generatePostImage(key));
    }

    const viewBtn = box.querySelector(".v5s-img-view-btn");
    const imgEl = box.querySelector(".v5s-card-img");
    const openModal = () => {
      const imgData = generatedImages[key];
      if (imgData && imgData.url && imgModal && modalImg) {
        modalImg.src = imgData.url;
        if (modalDownloadLink) {
          modalDownloadLink.href = `/api/proxy-image?url=${encodeURIComponent(imgData.url)}&filename=${encodeURIComponent(key + '_post_image.png')}`;
        }
        imgModal.classList.remove("hidden");
      }
    };

    if (viewBtn) viewBtn.addEventListener("click", openModal);
    if (imgEl) imgEl.addEventListener("click", openModal);
  }

  // Lightbox Modal Controls
  if (imgModalClose && imgModal) {
    imgModalClose.addEventListener("click", () => imgModal.classList.add("hidden"));
    imgModal.addEventListener("click", (e) => {
      if (e.target === imgModal) {
        imgModal.classList.add("hidden");
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !imgModal.classList.contains("hidden")) {
        imgModal.classList.add("hidden");
      }
    });
  }

  // ============================================================================
  // Attach Card Specific Listeners
  // ============================================================================
  function attachCardEventListeners(card, key) {
    const copyBtn = card.querySelector(".v5s-copy-post-btn");
    const editBtn = card.querySelector(".v5s-edit-post-btn");
    const regenBtn = card.querySelector(".v5s-regen-post-btn");
    const dlBtn = card.querySelector(".v5s-dl-post-btn");
    const singleImgActionBtn = card.querySelector(".v5s-gen-single-img-action");
    const imgBox = card.querySelector(".v5s-card-image-box");

    if (imgBox) {
      attachImageBoxListeners(imgBox, key);
    }

    if (singleImgActionBtn) {
      singleImgActionBtn.addEventListener("click", () => generatePostImage(key));
    }

    // Copy Single Post
    copyBtn.addEventListener("click", () => {
      const text = buildFormattedPostText(key);
      copyToClipboard(text);
      showToast(`Copied ${PLATFORM_CONFIG[key].name} post!`);
    });

    // Inline Edit Post
    editBtn.addEventListener("click", () => {
      const isEditing = card.classList.contains("editing");
      const editableElements = card.querySelectorAll(".v5s-hook-text, .v5s-title-text, .v5s-caption-text, .v5s-cta-text");

      if (!isEditing) {
        card.classList.add("editing");
        editBtn.querySelector("span").textContent = "Save";
        editBtn.style.color = "#00b956";
        editableElements.forEach((el) => {
          el.setAttribute("contenteditable", "true");
          el.classList.add("is-editable");
        });
        showToast("Edit mode active. Click Save when done.");
      } else {
        card.classList.remove("editing");
        editBtn.querySelector("span").textContent = "Edit";
        editBtn.style.color = "";
        editableElements.forEach((el) => {
          el.setAttribute("contenteditable", "false");
          el.classList.remove("is-editable");
        });

        const hookEl = card.querySelector(".v5s-hook-text");
        const titleEl = card.querySelector(".v5s-title-text");
        const captionEl = card.querySelector(".v5s-caption-text");
        const ctaEl = card.querySelector(".v5s-cta-text");

        if (generatedPosts[key]) {
          if (hookEl) generatedPosts[key].hook = hookEl.textContent.trim();
          if (titleEl) generatedPosts[key].title = titleEl.textContent.trim();
          if (captionEl) generatedPosts[key].caption = captionEl.innerText.trim();
          if (ctaEl) generatedPosts[key].cta = ctaEl.textContent.trim();
          saveSessionState();
        }
        showToast(`Saved edits for ${PLATFORM_CONFIG[key].name}!`);
      }
    });

    // Regenerate Single Post Text
    regenBtn.addEventListener("click", async () => {
      regenBtn.disabled = true;
      regenBtn.style.opacity = "0.6";
      showToast(`Regenerating ${PLATFORM_CONFIG[key].name}...`);

      try {
        const payload = {
          video_metadata: {
            filename: videoMetadata.filename,
            duration: videoMetadata.duration,
            resolution: `${videoMetadata.width}x${videoMetadata.height}`,
            format: videoMetadata.format,
            size: videoMetadata.sizeStr,
          },
          context: getContextData(),
          platforms: [key],
        };

        const resp = await fetch("/api/generate-social-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.posts && data.posts[key]) {
            generatedPosts[key] = data.posts[key];
            saveSessionState();
            renderResultsCards(generatedPosts);
            showToast(`Regenerated ${PLATFORM_CONFIG[key].name} post!`);
          }
        }
      } catch (err) {
        showToast("Regeneration failed. Try again.");
      } finally {
        regenBtn.disabled = false;
        regenBtn.style.opacity = "1";
      }
    });

    // Download Single Post as .txt
    dlBtn.addEventListener("click", () => {
      const text = buildFormattedPostText(key);
      const filename = `${key}_social_post.txt`;
      downloadTextFile(filename, text);
      showToast(`Downloaded ${PLATFORM_CONFIG[key].name} post!`);
    });
  }

  // Build Clean Formatted Text for a Single Platform
  function buildFormattedPostText(key) {
    const post = generatedPosts[key];
    if (!post) return "";
    const cfg = PLATFORM_CONFIG[key] || { name: key };

    const hashtagsList = Array.isArray(post.hashtags)
      ? post.hashtags
      : typeof post.hashtags === "string"
      ? post.hashtags.split(" ").filter(Boolean)
      : [];

    const lines = [];
    lines.push(`========================================`);
    lines.push(`PLATFORM: ${cfg.name.toUpperCase()}`);
    lines.push(`RECOMMENDED FORMAT: ${post.recommended_format || cfg.defaultFormat}`);
    lines.push(`========================================\n`);

    if (post.hook) {
      lines.push(`[OPENING HOOK]`);
      lines.push(`${post.hook}\n`);
    }

    if (post.title) {
      lines.push(`[SUGGESTED TITLE]`);
      lines.push(`${post.title}\n`);
    }

    if (post.caption) {
      lines.push(`[MAIN CAPTION]`);
      lines.push(`${post.caption}\n`);
    }

    if (hashtagsList.length > 0) {
      lines.push(`[HASHTAGS]`);
      lines.push(`${hashtagsList.join(" ")}\n`);
    }

    if (post.cta) {
      lines.push(`[CALL TO ACTION]`);
      lines.push(`${post.cta}\n`);
    }

    if (generatedImages[key] && generatedImages[key].url) {
      lines.push(`[AI POST IMAGE]`);
      lines.push(`${generatedImages[key].url}\n`);
    }

    lines.push(`---`);
    lines.push(`Generated by VidZova One Video, 5 Social Posts Engine`);
    lines.push(`https://vidzova.online/one-video-five-social-posts`);

    return lines.join("\n");
  }

  // ============================================================================
  // Global Actions (Copy All, Download TXT, Export JSON, Regenerate All)
  // ============================================================================
  if (copyAllBtn) {
    copyAllBtn.addEventListener("click", () => {
      const keys = Object.keys(generatedPosts);
      if (keys.length === 0) return;

      const allText = keys.map((k) => buildFormattedPostText(k)).join("\n\n");
      copyToClipboard(allText);
      showToast(`Copied all ${keys.length} posts to clipboard!`);
    });
  }

  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener("click", () => {
      const keys = Object.keys(generatedPosts);
      if (keys.length === 0) return;

      const allText = keys.map((k) => buildFormattedPostText(k)).join("\n\n");
      const filename = `vidzova_5_social_posts_${Date.now()}.txt`;
      downloadTextFile(filename, allText);
      showToast("Downloaded all social posts as .txt!");
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      const exportData = {
        tool: "VidZova One Video, 5 Social Posts",
        generatedAt: new Date().toISOString(),
        video: videoMetadata,
        posts: generatedPosts,
        images: generatedImages,
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      downloadTextFile(
        `vidzova_social_posts_${Date.now()}.json`,
        jsonStr,
        "application/json;charset=utf-8"
      );
      showToast("Exported structured JSON file!");
    });
  }

  if (regenerateAllBtn) {
    regenerateAllBtn.addEventListener("click", () => {
      const platforms = Object.keys(generatedPosts);
      if (platforms.length === 0) return;
      startGeneration(platforms, getContextData());
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear the generated social posts and reset?")) {
        generatedPosts = {};
        generatedImages = {};
        sessionStorage.removeItem("v5s_results");
        sessionStorage.removeItem("v5s_images");
        cardsGrid.innerHTML = "";
        resultsSection.classList.add("hidden");
        showToast("Cleared results session.");
      }
    });
  }

  // Session Storage Persistence
  function saveSessionState() {
    try {
      sessionStorage.setItem("v5s_results", JSON.stringify(generatedPosts));
      sessionStorage.setItem("v5s_images", JSON.stringify(generatedImages));
      sessionStorage.setItem("v5s_meta", JSON.stringify(videoMetadata));
    } catch (e) {
      // Ignore if quota exceeded
    }
  }

  function loadSessionState() {
    try {
      const saved = sessionStorage.getItem("v5s_results");
      const savedImgs = sessionStorage.getItem("v5s_images");
      const savedMeta = sessionStorage.getItem("v5s_meta");

      if (savedImgs) {
        generatedImages = JSON.parse(savedImgs);
      }

      if (saved) {
        generatedPosts = JSON.parse(saved);
        if (savedMeta) {
          videoMetadata = JSON.parse(savedMeta);
        }
        if (Object.keys(generatedPosts).length > 0) {
          renderResultsCards(generatedPosts);
          resultsSection.classList.remove("hidden");
        }
      }
    } catch (e) {
      // Fallback cleanly
    }
  }

  // Clipboard Utility
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(ta);
  }

  // File Download Utility
  function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Formatting Helpers
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatCaptionHtml(caption) {
    return escapeHtml(caption).replace(/\n/g, "<br>");
  }


  // ============================================================================
  // Google User Authentication & 5-Post Quota Management
  // ============================================================================
  let userQuota = {
    isLoggedIn: false,
    email: "",
    name: "",
    used: 0,
    remaining: 5,
    limit: 5,
  };

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

  function getLoggedInGoogleUser() {
    try {
      const saved = JSON.parse(localStorage.getItem("vidzova_google_user") || "null");
      if (saved && saved.email) return saved;
    } catch {}
    return null;
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

  function showGoogleModal() {
    renderAccountChooserList();
    if (googleLoginForm) googleLoginForm.classList.add("hidden");
    if (googleLoginModal) googleLoginModal.classList.remove("hidden");
  }

  function hideGoogleModal() {
    if (googleLoginModal) googleLoginModal.classList.add("hidden");
  }

  function signInDirectlyWithGoogle(account) {
    const email = account.email.trim();
    const name = account.name || formatNameFromEmail(email);
    const userObj = { name, email };
    localStorage.setItem("vidzova_google_user", JSON.stringify(userObj));
    saveGoogleAccountToList(userObj);
    hideGoogleModal();
    syncGoogleUserSession();
    showToast(`Signed in as ${email}`);
  }

  function logoutGoogleUser() {
    localStorage.removeItem("vidzova_google_user");
    syncGoogleUserSession();
    showToast("Signed out of Google account.");
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
          <span class="sf-google-account-name">${escapeHtml(acc.name || formatNameFromEmail(acc.email))}</span>
          <span class="sf-google-account-email">${escapeHtml(acc.email)}</span>
        </span>
      `;
      btn.addEventListener("click", () => {
        signInDirectlyWithGoogle(acc);
      });
      googleAccountList.appendChild(btn);
    });
  }

  async function syncGoogleUserSession() {
    const user = getLoggedInGoogleUser();
    if (!user) {
      userQuota = {
        isLoggedIn: false,
        email: "",
        name: "",
        used: 0,
        remaining: 5,
        limit: 5,
      };
      if (googleLoginBtn) googleLoginBtn.classList.remove("hidden");
      if (userProfileBox) userProfileBox.classList.add("hidden");
      renderQuotaBox();
      return;
    }

    if (googleLoginBtn) googleLoginBtn.classList.add("hidden");
    if (userProfileBox) userProfileBox.classList.remove("hidden");
    const name = user.name || formatNameFromEmail(user.email);
    if (userNameText) userNameText.textContent = name;
    if (userEmailText) userEmailText.textContent = user.email;
    if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();

    // Check cached count in localStorage
    const cachedCountKey = `v5s_gen_count_${user.email.toLowerCase()}`;
    const cachedCount = parseInt(localStorage.getItem(cachedCountKey) || "0", 10);
    userQuota = {
      isLoggedIn: true,
      email: user.email,
      name,
      used: cachedCount,
      remaining: Math.max(0, 5 - cachedCount),
      limit: 5,
    };
    renderQuotaBox();

    // Verify & sync with backend quota endpoint
    try {
      const resp = await fetch(`/api/check-google-quota?email=${encodeURIComponent(user.email)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === "success") {
          userQuota.used = data.generations_used;
          userQuota.remaining = data.generations_remaining;
          userQuota.limit = data.limit || 5;
          localStorage.setItem(cachedCountKey, String(userQuota.used));
          renderQuotaBox();
        }
      }
    } catch {}
  }

  function renderQuotaBox() {
    if (!googleQuotaBox) return;

    if (!userQuota.isLoggedIn) {
      googleQuotaBox.innerHTML = `
        <div class="v5s-login-prompt-banner">
          <div class="v5s-login-prompt-left">
            <div class="v5s-login-prompt-icon">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.25 0-6.01-2.19-7-5.14H1.01v3.14C3.02 21.16 7.21 24 12 24z"/>
                <path fill="#FBBC05" d="M5 14.03c-.25-.74-.4-1.54-.4-2.36s.15-1.62.4-2.36V6.17H1.01C.37 7.45 0 8.89 0 11.67s.37 4.22 1.01 5.5L5 14.03z"/>
                <path fill="#EA4335" d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.5-3.5C18.07 1.14 15.3 0 12 0 7.21 0 3.02 2.84 1.01 6.83L5 9.97c.99-2.95 3.75-5.22 7-5.22z"/>
              </svg>
            </div>
            <div class="v5s-login-prompt-text">
              <h3>Google Sign-In Required</h3>
              <p>Only verified Google users can generate posts. Sign in with Google to get <strong>5 free video-to-post generations</strong>.</p>
            </div>
          </div>
          <button type="button" id="v5sBannerLoginBtn" class="v5s-login-action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.25 0-6.01-2.19-7-5.14H1.01v3.14C3.02 21.16 7.21 24 12 24z"/>
              <path fill="#FBBC05" d="M5 14.03c-.25-.74-.4-1.54-.4-2.36s.15-1.62.4-2.36V6.17H1.01C.37 7.45 0 8.89 0 11.67s.37 4.22 1.01 5.5L5 14.03z"/>
              <path fill="#EA4335" d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.5-3.5C18.07 1.14 15.3 0 12 0 7.21 0 3.02 2.84 1.01 6.83L5 9.97c.99-2.95 3.75-5.22 7-5.22z"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      `;

      const bannerLoginBtn = document.getElementById("v5sBannerLoginBtn");
      if (bannerLoginBtn) {
        bannerLoginBtn.addEventListener("click", showGoogleModal);
      }

      if (generateBtn) {
        generateBtn.classList.remove("limit-reached");
        const btnSpan = generateBtn.querySelector("span");
        if (btnSpan) btnSpan.textContent = "Sign In with Google to Generate";
      }
      return;
    }

    // User is logged in
    const used = userQuota.used || 0;
    const remaining = Math.max(0, 5 - used);
    const limit = userQuota.limit || 5;
    const pct = Math.min(100, Math.round((remaining / limit) * 100));

    let pillClass = "";
    let fillClass = "";
    let pillText = `${remaining} of ${limit} Free Generations Left`;

    if (remaining === 0) {
      pillClass = "limit-reached";
      fillClass = "limit-reached";
      pillText = `0 of ${limit} - Limit Reached`;
    } else if (remaining === 1) {
      pillClass = "warning";
      fillClass = "warning";
    }

    googleQuotaBox.innerHTML = `
      <div class="v5s-quota-top">
        <div class="v5s-quota-user-info">
          <div class="v5s-quota-avatar">${escapeHtml(userQuota.name.charAt(0).toUpperCase())}</div>
          <div class="v5s-quota-user-details">
            <span class="v5s-quota-user-name">${escapeHtml(userQuota.name)}</span>
            <span class="v5s-quota-user-email">${escapeHtml(userQuota.email)}</span>
          </div>
        </div>
        <div class="v5s-quota-badge-group">
          <span class="v5s-quota-pill ${pillClass}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ${pillText}
          </span>
          <button type="button" id="v5sSwitchAccountBtn" class="v5s-switch-acc-btn" title="Use a different Google account">
            Switch Account
          </button>
        </div>
      </div>
      <div class="v5s-quota-progress-wrapper">
        <div class="v5s-quota-bar-bg">
          <div class="v5s-quota-bar-fill ${fillClass}" style="width: ${pct}%"></div>
        </div>
        <div class="v5s-quota-note">
          <span>${used} used • ${remaining} remaining</span>
          <span>Google User Free Tier (5 Posts Limit)</span>
        </div>
      </div>
    `;

    const switchBtn = document.getElementById("v5sSwitchAccountBtn");
    if (switchBtn) {
      switchBtn.addEventListener("click", showGoogleModal);
    }

    if (generateBtn) {
      const btnSpan = generateBtn.querySelector("span");
      if (remaining === 0) {
        generateBtn.disabled = true;
        generateBtn.classList.add("limit-reached");
        if (btnSpan) btnSpan.textContent = "Generation Limit Reached (5/5 Used)";
      } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove("limit-reached");
        if (btnSpan) btnSpan.textContent = `Generate 5 Social Posts (${remaining}/${limit} Left)`;
      }
    }
  }

  // Google Modal Event Listeners
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", showGoogleModal);
  }
  if (closeGoogleModalBtn) {
    closeGoogleModalBtn.addEventListener("click", hideGoogleModal);
  }
  if (googleLoginModal) {
    googleLoginModal.addEventListener("click", (e) => {
      if (e.target === googleLoginModal) hideGoogleModal();
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
    googleLogoutBtn.addEventListener("click", logoutGoogleUser);
  }


  // Initialize on DOM Ready
  window.addEventListener("DOMContentLoaded", () => {
    loadSessionState();
    syncGoogleUserSession();
  });
})();
