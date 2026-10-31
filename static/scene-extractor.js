/**
 * VidZova - Video Scene Extractor Engine
 * 100% Client-Side Hardware-Accelerated Video Frame Extraction & Scene Detection
 */

(function () {
  "use strict";

  // State Management
  let currentFile = null;
  let currentVideoUrl = null;
  let videoDuration = 0;
  let videoWidth = 0;
  let videoHeight = 0;
  let isAnalyzing = false;
  let cancelRequested = false;
  let extractedFrames = []; // Array of { id, sceneNum, time, timestampStr, dataUrl, width, height, brightness, sharpness, selected }
  let selectedFrameIndex = 0;
  let activeTab = "upload";
  let isCompactView = false;

  // DOM Elements
  const tabUploadBtn = document.getElementById("tabUploadBtn");
  const tabUrlBtn = document.getElementById("tabUrlBtn");
  const tabUploadContent = document.getElementById("tabUploadContent");
  const tabUrlContent = document.getElementById("tabUrlContent");
  const dropZone = document.getElementById("dropZone");
  const videoFileInput = document.getElementById("videoFileInput");
  const fileInfoChip = document.getElementById("fileInfoChip");
  const chipFilename = document.getElementById("chipFilename");
  const chipFileMeta = document.getElementById("chipFileMeta");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const videoUrlInput = document.getElementById("videoUrlInput");
  const loadUrlBtn = document.getElementById("loadUrlBtn");

  const vseErrorBox = document.getElementById("vseErrorBox");
  const vseErrorTitle = document.getElementById("vseErrorTitle");
  const vseErrorText = document.getElementById("vseErrorText");

  const vseWorkspace = document.getElementById("vseWorkspace");
  const videoPlayer = document.getElementById("videoPlayer");
  const analysisCanvas = document.getElementById("analysisCanvas");
  const highResCanvas = document.getElementById("highResCanvas");
  const analysisCtx = analysisCanvas ? analysisCanvas.getContext("2d", { willReadFrequently: true }) : null;
  const highResCtx = highResCanvas ? highResCanvas.getContext("2d") : null;

  const playerMetaBadge = document.getElementById("playerMetaBadge");
  const videoScrubber = document.getElementById("videoScrubber");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playIcon = document.getElementById("playIcon");
  const pauseIcon = document.getElementById("pauseIcon");
  const timeDisplay = document.getElementById("timeDisplay");
  const playbackRateSelect = document.getElementById("playbackRateSelect");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  const analysisMode = document.getElementById("analysisMode");
  const fixedIntervalGroup = document.getElementById("fixedIntervalGroup");
  const fixedIntervalSelect = document.getElementById("fixedIntervalSelect");
  const customIntervalGroup = document.getElementById("customIntervalGroup");
  const customIntervalInput = document.getElementById("customIntervalInput");
  const sensitivityGroup = document.getElementById("sensitivityGroup");
  const sensitivitySelect = document.getElementById("sensitivitySelect");
  const maxFramesInput = document.getElementById("maxFramesInput");
  const minGapInput = document.getElementById("minGapInput");
  const skipBlackFramesCheck = document.getElementById("skipBlackFramesCheck");
  const skipDuplicatesCheck = document.getElementById("skipDuplicatesCheck");

  const startAnalysisBtn = document.getElementById("startAnalysisBtn");
  const cancelAnalysisBtn = document.getElementById("cancelAnalysisBtn");
  const vseProgressBox = document.getElementById("vseProgressBox");
  const vseProgressStatus = document.getElementById("vseProgressStatus");
  const vseProgressPercent = document.getElementById("vseProgressPercent");
  const vseProgressBar = document.getElementById("vseProgressBar");

  const vseSummaryBox = document.getElementById("vseSummaryBox");
  const sumDuration = document.getElementById("sumDuration");
  const sumScenes = document.getElementById("sumScenes");
  const sumFrames = document.getElementById("sumFrames");
  const sumTime = document.getElementById("sumTime");
  const sumResolution = document.getElementById("sumResolution");

  const vseTimelineSection = document.getElementById("vseTimelineSection");
  const timelineScroll = document.getElementById("timelineScroll");
  const timelineCountBadge = document.getElementById("timelineCountBadge");

  const vseGallerySection = document.getElementById("vseGallerySection");
  const framesGrid = document.getElementById("framesGrid");
  const selectedCountBadge = document.getElementById("selectedCountBadge");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const deselectAllBtn = document.getElementById("deselectAllBtn");
  const invertSelectionBtn = document.getElementById("invertSelectionBtn");
  const viewToggleBtn = document.getElementById("viewToggleBtn");
  const viewToggleLabel = document.getElementById("viewToggleLabel");
  const gallerySearchInput = document.getElementById("gallerySearchInput");

  const exportFormatSelect = document.getElementById("exportFormatSelect");
  const exportResolutionSelect = document.getElementById("exportResolutionSelect");
  const qualityOptGroup = document.getElementById("qualityOptGroup");
  const qualityRangeInput = document.getElementById("qualityRangeInput");
  const qualityValText = document.getElementById("qualityValText");
  const downloadSelectedBtn = document.getElementById("downloadSelectedBtn");
  const downloadAllZipBtn = document.getElementById("downloadAllZipBtn");
  const downloadCsvBtn = document.getElementById("downloadCsvBtn");
  const aiAnalyzeBtn = document.getElementById("aiAnalyzeBtn");

  const aiResultsSection = document.getElementById("aiResultsSection");
  const aiCardsContainer = document.getElementById("aiCardsContainer");

  const vseModal = document.getElementById("vseModal");
  const modalImg = document.getElementById("modalImg");
  const modalSceneTitle = document.getElementById("modalSceneTitle");
  const modalTimestamp = document.getElementById("modalTimestamp");
  const modalRes = document.getElementById("modalRes");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const prevModalBtn = document.getElementById("prevModalBtn");
  const nextModalBtn = document.getElementById("nextModalBtn");
  const modalSeekVideoBtn = document.getElementById("modalSeekVideoBtn");
  const modalDownloadBtn = document.getElementById("modalDownloadBtn");

  const themeToggle = document.getElementById("themeToggle");

  // Utilities
  function formatTimestamp(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    const mmm = String(ms).padStart(3, "0");
    return `${hh}:${mm}:${ss}.${mmm}`;
  }

  function formatDurationShort(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function sanitizeFilename(name) {
    return (name || "video")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_\-]/g, "_")
      .slice(0, 40);
  }

  function showError(title, msg) {
    if (vseErrorTitle) vseErrorTitle.textContent = title;
    if (vseErrorText) vseErrorText.textContent = msg;
    if (vseErrorBox) vseErrorBox.classList.remove("hidden");
  }

  function clearError() {
    if (vseErrorBox) vseErrorBox.classList.add("hidden");
  }

  // Tab Switching
  if (tabUploadBtn && tabUrlBtn) {
    tabUploadBtn.addEventListener("click", () => {
      activeTab = "upload";
      tabUploadBtn.classList.add("active");
      tabUrlBtn.classList.remove("active");
      tabUploadContent.classList.remove("hidden");
      tabUrlContent.classList.add("hidden");
    });

    tabUrlBtn.addEventListener("click", () => {
      activeTab = "url";
      tabUrlBtn.classList.add("active");
      tabUploadBtn.classList.remove("active");
      tabUrlContent.classList.remove("hidden");
      tabUploadContent.classList.add("hidden");
      if (videoUrlInput) videoUrlInput.focus();
    });
  }

  // Drag and Drop
  if (dropZone && videoFileInput) {
    dropZone.addEventListener("click", () => videoFileInput.click());

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("drag-over");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    videoFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    clearError();
    if (!file) return;

    // Check size limit: 500 MB
    const maxSizeBytes = 500 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showError("File Too Large", `Selected video is ${formatBytes(file.size)}. Maximum allowed upload size is 500 MB.`);
      return;
    }

    // Supported video types
    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!file.type.startsWith("video/") && !["mp4", "webm", "mov", "mkv", "ogg"].includes(ext)) {
      showError("Unsupported Video Format", "Please upload a supported video format (MP4, WebM, MOV, or MKV).");
      return;
    }

    currentFile = file;

    // Show chip
    if (chipFilename) chipFilename.textContent = file.name;
    if (chipFileMeta) chipFileMeta.textContent = `${formatBytes(file.size)} • ${ext.toUpperCase()}`;
    if (fileInfoChip) fileInfoChip.classList.remove("hidden");
    if (dropZone) dropZone.classList.add("hidden");

    // Load file into video player
    const objectUrl = URL.createObjectURL(file);
    loadVideoSource(objectUrl, file.name);
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener("click", () => {
      currentFile = null;
      if (videoFileInput) videoFileInput.value = "";
      if (fileInfoChip) fileInfoChip.classList.add("hidden");
      if (dropZone) dropZone.classList.remove("hidden");
      if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.removeAttribute("src");
        videoPlayer.load();
      }
      if (vseWorkspace) vseWorkspace.classList.add("hidden");
      resetExtractedResults();
    });
  }

  // URL Loader
  if (loadUrlBtn && videoUrlInput) {
    loadUrlBtn.addEventListener("click", () => {
      const url = videoUrlInput.value.trim();
      if (!url) {
        showError("Invalid URL", "Please enter a valid video link.");
        return;
      }
      handleUrlSelection(url);
    });

    videoUrlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        loadUrlBtn.click();
      }
    });
  }

  async function handleUrlSelection(url) {
    clearError();
    loadUrlBtn.disabled = true;
    loadUrlBtn.innerHTML = `<span>Loading...</span>`;

    try {
      // 1. If it's a direct mp4/webm link, load it directly
      if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
        loadVideoSource(url, "online_video.mp4");
        return;
      }

      // 2. Fetch stream from VidZova backend /api/info
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Could not retrieve video stream from URL.");
      }

      // Find best direct playable stream
      let directUrl = null;
      const combined = (data.formats && data.formats.combined) || [];
      const videoOnly = (data.formats && data.formats.video_only) || [];

      // 1. Try combined formats (e.g. 720p or 360p) with audio+video
      for (const f of combined) {
        const u = f.direct_url || f.url;
        if (u) {
          directUrl = u;
          break;
        }
      }

      // 2. Fall back to video_only formats if no combined format
      if (!directUrl) {
        for (const f of videoOnly) {
          const u = f.direct_url || f.url;
          if (u) {
            directUrl = u;
            break;
          }
        }
      }

      const title = data.title || "video";
      if (directUrl) {
        // If direct stream is external (e.g. googlevideo, cdn, tiktok), proxy it through VidZova with CORS headers
        // so HTML5 canvas can read and export keyframes without cross-origin security restrictions
        const playableUrl = directUrl.startsWith("http")
          ? `/api/proxy-video?url=${encodeURIComponent(directUrl)}`
          : directUrl;
        loadVideoSource(playableUrl, title);
      } else {
        showError("Stream Not Available", "Could not resolve a playable stream for this video. Please download the video with VidZova, then drag & drop it here for complete 60fps scene extraction!");
      }
    } catch (err) {
      showError("Link Extraction Error", err.message || "Failed to load video from link.");
    } finally {
      loadUrlBtn.disabled = false;
      loadUrlBtn.innerHTML = `<span>Load Video</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    }
  }

  // Load Video Element
  function loadVideoSource(src, filename) {
    currentVideoUrl = src;
    clearError();
    resetExtractedResults();

    videoPlayer.crossOrigin = "anonymous";
    videoPlayer.src = src;
    videoPlayer.load();

    videoPlayer.onloadedmetadata = () => {
      videoDuration = videoPlayer.duration || 0;
      videoWidth = videoPlayer.videoWidth || 1920;
      videoHeight = videoPlayer.videoHeight || 1080;

      // Update resolution canvases
      analysisCanvas.width = 320;
      analysisCanvas.height = Math.round((320 * videoHeight) / videoWidth);

      highResCanvas.width = videoWidth;
      highResCanvas.height = videoHeight;

      if (playerMetaBadge) {
        playerMetaBadge.textContent = `${videoWidth}x${videoHeight} • ${formatDurationShort(videoDuration)}`;
      }
      if (timeDisplay) {
        timeDisplay.textContent = `00:00.00 / ${formatDurationShort(videoDuration)}`;
      }
      if (vseWorkspace) {
        vseWorkspace.classList.remove("hidden");
        vseWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    videoPlayer.onerror = () => {
      showError("Video Loading Error", "Browser could not decode this video stream. Please ensure the file is an H.264/AAC MP4 or WebM video.");
    };
  }

  // Video Player Controls
  if (playPauseBtn && videoPlayer) {
    playPauseBtn.addEventListener("click", () => {
      if (videoPlayer.paused || videoPlayer.ended) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    });

    videoPlayer.addEventListener("play", () => {
      if (playIcon) playIcon.classList.add("hidden");
      if (pauseIcon) pauseIcon.classList.remove("hidden");
    });

    videoPlayer.addEventListener("pause", () => {
      if (playIcon) playIcon.classList.remove("hidden");
      if (pauseIcon) pauseIcon.classList.add("hidden");
    });

    videoPlayer.addEventListener("timeupdate", () => {
      if (!isAnalyzing && videoDuration > 0) {
        const pct = (videoPlayer.currentTime / videoDuration) * 100;
        if (videoScrubber) videoScrubber.value = pct;
        if (timeDisplay) {
          timeDisplay.textContent = `${formatTimestamp(videoPlayer.currentTime).slice(3, 11)} / ${formatDurationShort(videoDuration)}`;
        }
      }
    });

    if (videoScrubber) {
      videoScrubber.addEventListener("input", (e) => {
        if (videoDuration > 0) {
          const seekTo = (e.target.value / 100) * videoDuration;
          videoPlayer.currentTime = seekTo;
        }
      });
    }

    if (playbackRateSelect) {
      playbackRateSelect.addEventListener("change", (e) => {
        videoPlayer.playbackRate = parseFloat(e.target.value);
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          videoPlayer.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  // Detection Mode Settings Handlers
  if (analysisMode) {
    analysisMode.addEventListener("change", (e) => {
      const mode = e.target.value;
      if (mode === "smart") {
        if (fixedIntervalGroup) fixedIntervalGroup.classList.add("hidden");
        if (customIntervalGroup) customIntervalGroup.classList.add("hidden");
        if (sensitivityGroup) sensitivityGroup.classList.remove("hidden");
      } else if (mode === "fixed") {
        if (fixedIntervalGroup) fixedIntervalGroup.classList.remove("hidden");
        if (customIntervalGroup) customIntervalGroup.classList.add("hidden");
        if (sensitivityGroup) sensitivityGroup.classList.add("hidden");
      } else if (mode === "custom") {
        if (fixedIntervalGroup) fixedIntervalGroup.classList.add("hidden");
        if (customIntervalGroup) customIntervalGroup.classList.remove("hidden");
        if (sensitivityGroup) sensitivityGroup.classList.add("hidden");
      }
    });
  }

  // Quality Slider Handler
  if (qualityRangeInput && qualityValText) {
    qualityRangeInput.addEventListener("input", (e) => {
      qualityValText.textContent = e.target.value + "%";
    });
  }

  if (exportFormatSelect && qualityOptGroup) {
    exportFormatSelect.addEventListener("change", (e) => {
      if (e.target.value === "image/png") {
        qualityOptGroup.classList.add("hidden");
      } else {
        qualityOptGroup.classList.remove("hidden");
      }
    });
  }

  // Reset Results
  function resetExtractedResults() {
    extractedFrames = [];
    if (timelineScroll) timelineScroll.innerHTML = "";
    if (framesGrid) framesGrid.innerHTML = "";
    if (vseTimelineSection) vseTimelineSection.classList.add("hidden");
    if (vseGallerySection) vseGallerySection.classList.add("hidden");
    if (vseSummaryBox) vseSummaryBox.classList.add("hidden");
    if (vseProgressBox) vseProgressBox.classList.add("hidden");
    if (aiResultsSection) aiResultsSection.classList.add("hidden");
    if (aiCardsContainer) aiCardsContainer.innerHTML = "";
    updateSelectedCount();
  }

  // Real Frame Quality Evaluation: Brightness & Sharpness
  function evaluateFrameQuality(ctx, w, h) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    let totalBrightness = 0;
    const len = data.length;
    const pixelCount = len / 4;

    // 1. Calculate Average Brightness
    for (let i = 0; i < len; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = totalBrightness / pixelCount;

    // 2. Approximate Sharpness via Discrete Horizontal Difference (Laplacian Gradient Proxy)
    let totalDiff = 0;
    const step = 4 * 4; // Sample every 4th pixel for speed
    for (let i = 0; i < len - step; i += step) {
      const g1 = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const g2 = (data[i + step] + data[i + step + 1] + data[i + step + 2]) / 3;
      totalDiff += Math.abs(g1 - g2);
    }
    const sharpness = totalDiff / (pixelCount / 4);

    return { brightness: avgBrightness, sharpness: sharpness, rawData: imgData };
  }

  // Calculate Frame Difference (Mean Absolute Difference of Grayscale Pixels)
  function calculateFrameDiff(dataA, dataB) {
    if (!dataA || !dataB) return 1.0;
    const a = dataA.data;
    const b = dataB.data;
    const len = Math.min(a.length, b.length);
    let diff = 0;
    const sampleStep = 4 * 3; // sample every 3rd pixel
    let samples = 0;

    for (let i = 0; i < len; i += sampleStep) {
      const grayA = (a[i] + a[i + 1] + a[i + 2]) / 3;
      const grayB = (b[i] + b[i + 1] + b[i + 2]) / 3;
      diff += Math.abs(grayA - grayB);
      samples++;
    }

    return diff / (samples * 255);
  }

  // Core Scene Analysis Execution
  if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener("click", () => {
      if (!videoPlayer.src || videoDuration <= 0) {
        showError("No Video Loaded", "Please select or load a valid video before starting analysis.");
        return;
      }
      runSceneAnalysis();
    });
  }

  if (cancelAnalysisBtn) {
    cancelAnalysisBtn.addEventListener("click", () => {
      cancelRequested = true;
      if (vseProgressStatus) vseProgressStatus.textContent = "Cancelling analysis...";
    });
  }

  async function seekToPromise(targetTime) {
    return new Promise((resolve) => {
      const onSeeked = () => {
        videoPlayer.removeEventListener("seeked", onSeeked);
        resolve();
      };
      videoPlayer.addEventListener("seeked", onSeeked);
      videoPlayer.currentTime = Math.min(Math.max(0, targetTime), videoDuration);
    });
  }

  async function runSceneAnalysis() {
    isAnalyzing = true;
    cancelRequested = false;
    clearError();
    resetExtractedResults();

    videoPlayer.pause();
    startAnalysisBtn.disabled = true;
    cancelAnalysisBtn.classList.remove("hidden");
    vseProgressBox.classList.remove("hidden");

    const startTime = performance.now();
    const mode = analysisMode.value;
    const maxFrames = parseInt(maxFramesInput.value, 10) || 50;
    const minGap = parseFloat(minGapInput.value) || 1.0;
    const skipBlack = skipBlackFramesCheck.checked;
    const skipDups = skipDuplicatesCheck.checked;

    // Threshold by sensitivity
    let threshold = 0.28;
    if (sensitivitySelect.value === "low") threshold = 0.42;
    if (sensitivitySelect.value === "high") threshold = 0.18;

    let targetInterval = 5.0;
    if (mode === "fixed") {
      targetInterval = parseFloat(fixedIntervalSelect.value) || 5.0;
    } else if (mode === "custom") {
      targetInterval = parseFloat(customIntervalInput.value) || 3.0;
    }

    let detectedTimestamps = [];
    const analysisW = analysisCanvas.width;
    const analysisH = analysisCanvas.height;

    try {
      if (mode === "fixed" || mode === "custom") {
        // FIXED / CUSTOM INTERVAL MODE
        let currentTime = 0;
        while (currentTime < videoDuration && !cancelRequested) {
          detectedTimestamps.push(currentTime);
          if (detectedTimestamps.length >= maxFrames) break;
          currentTime += targetInterval;
        }
      } else {
        // SMART SCENE DETECTION MODE
        // Step size for rapid scanning (sample 3 to 4 times per second)
        const sampleStep = Math.max(0.25, Math.min(0.5, videoDuration / 300));
        let lastSceneTime = -999;
        let prevFrameData = null;

        let currentTime = 0;
        // Always include initial frame if not black
        detectedTimestamps.push(0);
        lastSceneTime = 0;

        while (currentTime < videoDuration && !cancelRequested) {
          currentTime += sampleStep;
          if (currentTime >= videoDuration) break;

          // Update Progress
          const pct = Math.min(99, Math.round((currentTime / videoDuration) * 100));
          if (vseProgressPercent) vseProgressPercent.textContent = pct + "%";
          if (vseProgressBar) vseProgressBar.style.width = pct + "%";
          if (vseProgressStatus) {
            vseProgressStatus.textContent = `Scanning video at ${formatDurationShort(currentTime)} (${detectedTimestamps.length} scenes detected)...`;
          }

          await seekToPromise(currentTime);

          // Draw to low-res analysis canvas
          analysisCtx.drawImage(videoPlayer, 0, 0, analysisW, analysisH);
          const quality = evaluateFrameQuality(analysisCtx, analysisW, analysisH);

          // Skip completely dark frames if requested
          if (skipBlack && quality.brightness < 12) {
            continue;
          }

          if (prevFrameData) {
            const diff = calculateFrameDiff(prevFrameData, quality.rawData);
            if (diff >= threshold && currentTime - lastSceneTime >= minGap) {
              detectedTimestamps.push(currentTime);
              lastSceneTime = currentTime;
              if (detectedTimestamps.length >= maxFrames) {
                break;
              }
            }
          }

          prevFrameData = quality.rawData;
        }
      }

      // Now capture High-Resolution Frames at Detected Timestamps
      if (vseProgressStatus) vseProgressStatus.textContent = "Extracting high-resolution keyframes...";
      let sceneCounter = 1;
      let prevCapturedData = null;

      for (let i = 0; i < detectedTimestamps.length; i++) {
        if (cancelRequested) break;
        const t = detectedTimestamps[i];

        const pct = Math.round(((i + 1) / detectedTimestamps.length) * 100);
        if (vseProgressPercent) vseProgressPercent.textContent = pct + "%";
        if (vseProgressBar) vseProgressBar.style.width = pct + "%";
        if (vseProgressStatus) vseProgressStatus.textContent = `Capturing scene #${sceneCounter} at ${formatDurationShort(t)}...`;

        await seekToPromise(t);

        // Draw to high-resolution canvas
        highResCanvas.width = videoPlayer.videoWidth || 1920;
        highResCanvas.height = videoPlayer.videoHeight || 1080;
        highResCtx.drawImage(videoPlayer, 0, 0, highResCanvas.width, highResCanvas.height);

        // Quick low-res duplicate check against previous captured frame
        analysisCtx.drawImage(videoPlayer, 0, 0, analysisW, analysisH);
        const evalResult = evaluateFrameQuality(analysisCtx, analysisW, analysisH);

        if (skipBlack && evalResult.brightness < 10 && i > 0) {
          continue;
        }

        if (skipDups && prevCapturedData) {
          const dupDiff = calculateFrameDiff(prevCapturedData, evalResult.rawData);
          if (dupDiff < 0.08) {
            // Near-duplicate, skip
            continue;
          }
        }
        prevCapturedData = evalResult.rawData;

        // Generate DataURL
        const dataUrl = highResCanvas.toDataURL("image/jpeg", 0.92);
        const frameObj = {
          id: "frame_" + Date.now() + "_" + i,
          sceneNum: sceneCounter++,
          time: t,
          timestampStr: formatTimestamp(t),
          dataUrl: dataUrl,
          width: highResCanvas.width,
          height: highResCanvas.height,
          brightness: Math.round(evalResult.brightness),
          sharpness: Math.round(evalResult.sharpness),
          selected: true,
        };

        extractedFrames.push(frameObj);
        appendTimelineChip(frameObj);
        appendGalleryCard(frameObj);
      }

      // Finalize
      const totalElapsed = ((performance.now() - startTime) / 1000).toFixed(1);

      if (sumDuration) sumDuration.textContent = formatDurationShort(videoDuration);
      if (sumScenes) sumScenes.textContent = String(extractedFrames.length);
      if (sumFrames) sumFrames.textContent = String(extractedFrames.length);
      if (sumTime) sumTime.textContent = totalElapsed + "s";
      if (sumResolution) sumResolution.textContent = `${highResCanvas.width}x${highResCanvas.height}`;

      if (vseSummaryBox) vseSummaryBox.classList.remove("hidden");
      if (vseTimelineSection) vseTimelineSection.classList.remove("hidden");
      if (vseGallerySection) vseGallerySection.classList.remove("hidden");

      if (vseProgressPercent) vseProgressPercent.textContent = "100%";
      if (vseProgressBar) vseProgressBar.style.width = "100%";
      if (vseProgressStatus) vseProgressStatus.textContent = `Completed! Extracted ${extractedFrames.length} keyframes in ${totalElapsed}s.`;

      updateSelectedCount();
    } catch (err) {
      showError("Analysis Interrupted", err.message || "An error occurred during scene extraction.");
    } finally {
      isAnalyzing = false;
      startAnalysisBtn.disabled = false;
      cancelAnalysisBtn.classList.add("hidden");
      setTimeout(() => {
        if (!isAnalyzing && vseProgressBox) vseProgressBox.classList.add("hidden");
      }, 3000);
    }
  }

  // Append Scene Chip to Visual Timeline
  function appendTimelineChip(frame) {
    if (!timelineScroll) return;
    if (timelineCountBadge) timelineCountBadge.textContent = `${extractedFrames.length} Scenes`;

    const chip = document.createElement("div");
    chip.className = "vse-timeline-chip";
    chip.title = `Click to seek video to Scene #${frame.sceneNum} (${frame.timestampStr})`;
    chip.innerHTML = `
      <div class="vse-chip-thumb">
        <img src="${frame.dataUrl}" alt="Scene #${frame.sceneNum}" loading="lazy" />
        <span class="vse-chip-num">#${frame.sceneNum}</span>
      </div>
      <span class="vse-chip-time">${frame.timestampStr.slice(3, 11)}</span>
    `;

    chip.addEventListener("click", () => {
      videoPlayer.currentTime = frame.time;
      videoPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    timelineScroll.appendChild(chip);
  }

  // Append Frame Card to Gallery Grid
  function appendGalleryCard(frame) {
    if (!framesGrid) return;

    const card = document.createElement("div");
    card.className = "vse-frame-card";
    card.id = frame.id;
    card.dataset.scene = frame.sceneNum;
    card.dataset.time = frame.time;

    card.innerHTML = `
      <div class="vse-card-img-wrap">
        <img src="${frame.dataUrl}" alt="Scene #${frame.sceneNum} at ${frame.timestampStr}" class="vse-frame-img" loading="lazy" />
        <span class="vse-scene-tag">Scene #${frame.sceneNum}</span>
        <button type="button" class="vse-zoom-btn" title="View Fullscreen" aria-label="Zoom preview">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
      <div class="vse-card-footer">
        <div class="vse-card-info">
          <label class="vse-card-select-label">
            <input type="checkbox" class="vse-frame-checkbox" checked />
            <span class="vse-time-stamp">${frame.timestampStr}</span>
          </label>
          <span class="vse-res-stamp">${frame.width}x${frame.height}</span>
        </div>
        <button type="button" class="vse-card-dl-btn" title="Download this frame">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Save
        </button>
      </div>
    `;

    // Events
    const checkbox = card.querySelector(".vse-frame-checkbox");
    checkbox.addEventListener("change", (e) => {
      frame.selected = e.target.checked;
      card.classList.toggle("deselected", !frame.selected);
      updateSelectedCount();
    });

    const zoomBtn = card.querySelector(".vse-zoom-btn");
    zoomBtn.addEventListener("click", () => {
      openLightbox(frame);
    });

    const dlBtn = card.querySelector(".vse-card-dl-btn");
    dlBtn.addEventListener("click", () => {
      downloadSingleFrame(frame);
    });

    framesGrid.appendChild(card);
  }

  // Gallery Toolbar Handlers
  function updateSelectedCount() {
    const selected = extractedFrames.filter((f) => f.selected);
    if (selectedCountBadge) {
      selectedCountBadge.textContent = `${selected.length} of ${extractedFrames.length} selected`;
    }
    if (downloadSelectedBtn) {
      downloadSelectedBtn.disabled = selected.length === 0;
      downloadSelectedBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Download Selected (${selected.length})</span>
      `;
    }
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      extractedFrames.forEach((f) => (f.selected = true));
      document.querySelectorAll(".vse-frame-checkbox").forEach((cb) => (cb.checked = true));
      document.querySelectorAll(".vse-frame-card").forEach((c) => c.classList.remove("deselected"));
      updateSelectedCount();
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", () => {
      extractedFrames.forEach((f) => (f.selected = false));
      document.querySelectorAll(".vse-frame-checkbox").forEach((cb) => (cb.checked = false));
      document.querySelectorAll(".vse-frame-card").forEach((c) => c.classList.add("deselected"));
      updateSelectedCount();
    });
  }

  if (invertSelectionBtn) {
    invertSelectionBtn.addEventListener("click", () => {
      extractedFrames.forEach((f) => {
        f.selected = !f.selected;
        const card = document.getElementById(f.id);
        if (card) {
          const cb = card.querySelector(".vse-frame-checkbox");
          if (cb) cb.checked = f.selected;
          card.classList.toggle("deselected", !f.selected);
        }
      });
      updateSelectedCount();
    });
  }

  if (viewToggleBtn && framesGrid) {
    viewToggleBtn.addEventListener("click", () => {
      isCompactView = !isCompactView;
      framesGrid.classList.toggle("compact-view", isCompactView);
      if (viewToggleLabel) viewToggleLabel.textContent = isCompactView ? "Compact" : "Grid";
    });
  }

  if (gallerySearchInput) {
    gallerySearchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll(".vse-frame-card").forEach((card) => {
        const sceneNum = card.dataset.scene || "";
        const timeVal = card.querySelector(".vse-time-stamp") ? card.querySelector(".vse-time-stamp").textContent.toLowerCase() : "";
        const match = sceneNum.includes(q) || timeVal.includes(q);
        card.style.display = match ? "" : "none";
      });
    });
  }

  // Lightbox Modal
  function openLightbox(frame) {
    selectedFrameIndex = extractedFrames.findIndex((f) => f.id === frame.id);
    updateLightboxContent();
    if (vseModal) vseModal.classList.remove("hidden");
  }

  function updateLightboxContent() {
    const frame = extractedFrames[selectedFrameIndex];
    if (!frame) return;

    if (modalImg) modalImg.src = frame.dataUrl;
    if (modalSceneTitle) modalSceneTitle.textContent = `Scene #${frame.sceneNum}`;
    if (modalTimestamp) modalTimestamp.textContent = frame.timestampStr;
    if (modalRes) modalRes.textContent = `${frame.width}x${frame.height}`;

    if (prevModalBtn) prevModalBtn.disabled = selectedFrameIndex <= 0;
    if (nextModalBtn) nextModalBtn.disabled = selectedFrameIndex >= extractedFrames.length - 1;
  }

  if (closeModalBtn && vseModal) {
    closeModalBtn.addEventListener("click", () => vseModal.classList.add("hidden"));
    vseModal.addEventListener("click", (e) => {
      if (e.target === vseModal) vseModal.classList.add("hidden");
    });
  }

  if (prevModalBtn) {
    prevModalBtn.addEventListener("click", () => {
      if (selectedFrameIndex > 0) {
        selectedFrameIndex--;
        updateLightboxContent();
      }
    });
  }

  if (nextModalBtn) {
    nextModalBtn.addEventListener("click", () => {
      if (selectedFrameIndex < extractedFrames.length - 1) {
        selectedFrameIndex++;
        updateLightboxContent();
      }
    });
  }

  if (modalSeekVideoBtn) {
    modalSeekVideoBtn.addEventListener("click", () => {
      const frame = extractedFrames[selectedFrameIndex];
      if (frame && videoPlayer) {
        videoPlayer.currentTime = frame.time;
        if (vseModal) vseModal.classList.add("hidden");
        videoPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener("click", () => {
      const frame = extractedFrames[selectedFrameIndex];
      if (frame) downloadSingleFrame(frame);
    });
  }

  // Image Conversion & Rescaling Canvas Helper
  async function convertFrameToExportBlob(frame, targetFormat, maxDimension, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;

        if (maxDimension && maxDimension !== "original") {
          const maxDim = parseInt(maxDimension, 10);
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
        }

        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const ctx = offscreen.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const mime = targetFormat || "image/jpeg";
        const q = (parseInt(quality, 10) || 92) / 100;
        offscreen.toBlob(
          (blob) => {
            resolve(blob);
          },
          mime,
          q
        );
      };
      img.src = frame.dataUrl;
    });
  }

  function getFileExtension(mime) {
    if (mime === "image/png") return "png";
    if (mime === "image/webp") return "webp";
    return "jpg";
  }

  function makeFrameFilename(frame, baseName, mime) {
    const ext = getFileExtension(mime);
    const timeFormatted = frame.timestampStr.replace(/:/g, "-").replace(/\./g, "-");
    const scenePadded = String(frame.sceneNum).padStart(3, "0");
    return `${baseName}_scene-${scenePadded}_${timeFormatted}.${ext}`;
  }

  // 1. Download Single Frame
  async function downloadSingleFrame(frame) {
    const format = exportFormatSelect ? exportFormatSelect.value : "image/jpeg";
    const resOpt = exportResolutionSelect ? exportResolutionSelect.value : "original";
    const quality = qualityRangeInput ? qualityRangeInput.value : 92;
    const baseName = sanitizeFilename(currentFile ? currentFile.name : "video_scenes");

    const blob = await convertFrameToExportBlob(frame, format, resOpt, quality);
    const filename = makeFrameFilename(frame, baseName, format);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 200);
  }

  // 2. Download Selected Frames in ZIP
  if (downloadSelectedBtn) {
    downloadSelectedBtn.addEventListener("click", () => {
      const selected = extractedFrames.filter((f) => f.selected);
      if (selected.length === 0) {
        showError("No Frames Selected", "Please select at least one frame to export.");
        return;
      }
      exportFramesAsZip(selected);
    });
  }

  // 3. Download All Frames in ZIP
  if (downloadAllZipBtn) {
    downloadAllZipBtn.addEventListener("click", () => {
      if (extractedFrames.length === 0) {
        showError("No Frames Available", "Please extract scene frames before downloading.");
        return;
      }
      exportFramesAsZip(extractedFrames);
    });
  }

  async function exportFramesAsZip(framesToExport) {
    if (typeof JSZip === "undefined") {
      showError("ZIP Library Error", "ZIP compression engine is loading. Please try again in a few seconds.");
      return;
    }

    const zip = new JSZip();
    const format = exportFormatSelect ? exportFormatSelect.value : "image/jpeg";
    const resOpt = exportResolutionSelect ? exportResolutionSelect.value : "original";
    const quality = qualityRangeInput ? qualityRangeInput.value : 92;
    const baseName = sanitizeFilename(currentFile ? currentFile.name : "video_scenes");

    downloadSelectedBtn.disabled = true;
    downloadAllZipBtn.disabled = true;
    const origText = downloadAllZipBtn.textContent;
    downloadAllZipBtn.textContent = "Packaging ZIP...";

    try {
      const manifestList = [];

      for (let i = 0; i < framesToExport.length; i++) {
        const frame = framesToExport[i];
        const blob = await convertFrameToExportBlob(frame, format, resOpt, quality);
        const filename = makeFrameFilename(frame, baseName, format);
        zip.file(filename, blob);

        manifestList.push({
          scene: frame.sceneNum,
          timestamp: frame.timestampStr,
          seconds: frame.time.toFixed(3),
          filename: filename,
          resolution: `${frame.width}x${frame.height}`,
        });
      }

      // Add manifest.json
      const manifestJson = {
        video: currentFile ? currentFile.name : "video",
        exported_at: new Date().toISOString(),
        total_frames: framesToExport.length,
        format: format,
        scenes: manifestList,
      };
      zip.file("manifest.json", JSON.stringify(manifestJson, null, 2));

      // Add manifest.txt
      let manifestTxt = `====================================================\nVIDZOVA VIDEO SCENE EXTRACTOR MANIFEST\nVideo: ${currentFile ? currentFile.name : "video"}\nTotal Scenes Extracted: ${framesToExport.length}\nDate: ${new Date().toLocaleString()}\n====================================================\n\n`;
      manifestList.forEach((m) => {
        manifestTxt += `Scene #${String(m.scene).padStart(3, "0")} | ${m.timestamp} | ${m.resolution} | ${m.filename}\n`;
      });
      zip.file("manifest.txt", manifestTxt);

      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${baseName}_scenes_keyframes.zip`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 500);
    } catch (err) {
      showError("ZIP Creation Error", err.message || "Failed to package frames into ZIP archive.");
    } finally {
      downloadSelectedBtn.disabled = false;
      downloadAllZipBtn.disabled = false;
      downloadAllZipBtn.textContent = origText;
    }
  }

  // 4. Download CSV Manifest
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener("click", () => {
      if (extractedFrames.length === 0) {
        showError("No Frames Available", "Please extract scene frames before exporting CSV.");
        return;
      }

      const format = exportFormatSelect ? exportFormatSelect.value : "image/jpeg";
      const baseName = sanitizeFilename(currentFile ? currentFile.name : "video_scenes");

      let csv = "Scene Number,Timestamp (HH:MM:SS.mmm),Seconds,Filename,Resolution,Brightness,Sharpness\r\n";
      extractedFrames.forEach((f) => {
        const fn = makeFrameFilename(f, baseName, format);
        csv += `${f.sceneNum},"${f.timestampStr}",${f.time.toFixed(3)},"${fn}","${f.width}x${f.height}",${f.brightness},${f.sharpness}\r\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${baseName}_scenes_manifest.csv`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 200);
    });
  }

  // 5. Optional AI Vision Analysis
  if (aiAnalyzeBtn) {
    aiAnalyzeBtn.addEventListener("click", async () => {
      const selected = extractedFrames.filter((f) => f.selected);
      if (selected.length === 0) {
        showError("No Frames Selected", "Please select at least one frame for AI analysis.");
        return;
      }

      const framesToAnalyze = selected.slice(0, 5); // analyze up to 5 frames per batch to avoid rate limits
      aiAnalyzeBtn.disabled = true;
      aiAnalyzeBtn.textContent = `Analyzing ${framesToAnalyze.length} frames with AI...`;

      try {
        if (aiResultsSection) aiResultsSection.classList.remove("hidden");
        if (aiCardsContainer) aiCardsContainer.innerHTML = "";

        for (const frame of framesToAnalyze) {
          const res = await fetch("/api/ai-analyze-frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_data: frame.dataUrl,
              scene_number: frame.sceneNum,
              timestamp: frame.timestampStr,
            }),
          });
          const data = await res.json();

          const card = document.createElement("div");
          card.className = "vse-ai-card";
          card.innerHTML = `
            <div class="vse-ai-card-thumb">
              <img src="${frame.dataUrl}" alt="Scene #${frame.sceneNum}" />
              <span class="vse-ai-time">Scene #${frame.sceneNum} (${frame.timestampStr})</span>
            </div>
            <div class="vse-ai-card-details">
              <h4>${data.title || `Scene #${frame.sceneNum} Visual Summary`}</h4>
              <p class="vse-ai-desc">${data.description || "AI analysis completed."}</p>
              ${data.tags ? `<div class="vse-ai-tags">${data.tags.map((t) => `<span>#${t}</span>`).join(" ")}</div>` : ""}
              ${data.use_case ? `<div class="vse-ai-use"><strong>Suggested Use Case:</strong> ${data.use_case}</div>` : ""}
            </div>
          `;
          if (aiCardsContainer) aiCardsContainer.appendChild(card);
        }

        aiResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        showError("AI Analysis Notice", err.message || "AI Vision requires an OPENAI_API_KEY on the server. You can configure it in environment variables.");
      } finally {
        aiAnalyzeBtn.disabled = false;
        aiAnalyzeBtn.textContent = "✨ Analyze Scenes with AI";
      }
    });
  }

  // Theme Toggle Support
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });
  }

  // Auto-Prefill from URL Parameter ?url=...
  window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const prefillUrl = params.get("url");
    if (prefillUrl) {
      if (tabUrlBtn) tabUrlBtn.click();
      if (videoUrlInput) videoUrlInput.value = prefillUrl;
      handleUrlSelection(prefillUrl);
    }
  });
})();
