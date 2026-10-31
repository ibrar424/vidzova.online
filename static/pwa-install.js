/**
 * Vidzova Progressive Web App (PWA) Install Controller
 * Enables the mobile Chrome install pop-up, handles beforeinstallprompt,
 * and provides 1-tap installation on Android, Chrome, and iOS.
 */
(function () {
  'use strict';

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Check for updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content available.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // State
  let deferredPrompt = null;
  const DISMISS_KEY = 'vidzova_pwa_dismissed_until';
  const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    // Already installed as app
    return;
  }

  // Device detection
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || /Mobi|Tablet/i.test(ua);

  // Inject CSS styles for the PWA pop-up & button
  function injectStyles() {
    if (document.getElementById('vidzova-pwa-styles')) return;
    const style = document.createElement('style');
    style.id = 'vidzova-pwa-styles';
    style.textContent = `
      /* Mobile Install Banner / Popup */
      .vz-pwa-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 999998;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .vz-pwa-overlay.vz-show {
        opacity: 1;
        pointer-events: auto;
      }
      @media (min-width: 640px) {
        .vz-pwa-overlay {
          align-items: center;
          padding: 20px;
        }
      }

      .vz-pwa-card {
        background: linear-gradient(145deg, #1e293b, #0f172a);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px 20px 0 0;
        width: 100%;
        max-width: 440px;
        padding: 24px 20px 28px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 185, 86, 0.25);
        color: #ffffff;
        transform: translateY(100%);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      }
      @media (min-width: 640px) {
        .vz-pwa-card {
          border-radius: 20px;
          transform: scale(0.92);
        }
      }
      .vz-pwa-overlay.vz-show .vz-pwa-card {
        transform: translateY(0);
      }
      @media (min-width: 640px) {
        .vz-pwa-overlay.vz-show .vz-pwa-card {
          transform: scale(1);
        }
      }

      .vz-pwa-close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
      }
      .vz-pwa-close-btn:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
      }

      .vz-pwa-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 14px;
      }
      .vz-pwa-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: #0f172a;
        padding: 4px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        flex-shrink: 0;
        border: 1px solid rgba(0, 185, 86, 0.4);
      }
      .vz-pwa-title-wrap {
        flex: 1;
        min-width: 0;
      }
      .vz-pwa-app-name {
        font-size: 1.15rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .vz-pwa-badge {
        background: rgba(0, 185, 86, 0.2);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.35);
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .vz-pwa-meta {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 2px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .vz-pwa-stars {
        color: #f59e0b;
        font-size: 0.85rem;
      }

      .vz-pwa-body {
        margin-bottom: 18px;
        font-size: 0.9rem;
        line-height: 1.45;
        color: #cbd5e1;
      }

      .vz-pwa-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 20px;
      }
      .vz-pwa-feat-item {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 8px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .vz-pwa-feat-item svg {
        color: #10b981;
        flex-shrink: 0;
      }

      .vz-pwa-actions {
        display: flex;
        gap: 10px;
      }
      .vz-pwa-btn-later {
        flex: 1;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        font-weight: 600;
        font-size: 0.92rem;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
      }
      .vz-pwa-btn-later:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
      }
      .vz-pwa-btn-install {
        flex: 2;
        padding: 12px 16px;
        border-radius: 12px;
        background: linear-gradient(135deg, #00b956, #059669);
        border: none;
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 8px 20px rgba(0, 185, 86, 0.35);
        transition: transform 0.15s, box-shadow 0.2s;
      }
      .vz-pwa-btn-install:active {
        transform: scale(0.98);
      }

      /* Floating Header / Top Banner Button on Mobile */
      .vz-pwa-header-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(0, 185, 86, 0.18), rgba(5, 150, 105, 0.25));
        border: 1px solid rgba(0, 185, 86, 0.45);
        color: #10b981;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        user-select: none;
      }
      .vz-pwa-header-pill:hover {
        background: linear-gradient(135deg, #00b956, #059669);
        color: #fff;
        border-color: #00b956;
        box-shadow: 0 4px 12px rgba(0, 185, 86, 0.3);
      }
      .vz-pwa-header-pill svg {
        transition: transform 0.2s;
      }
      .vz-pwa-header-pill:hover svg {
        transform: translateY(1px);
      }

      /* Floating Bottom Quick Install Bar on Mobile */
      .vz-pwa-bottom-bar {
        position: fixed;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%) translateY(120%);
        width: calc(100% - 28px);
        max-width: 420px;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 185, 86, 0.35);
        border-radius: 16px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        z-index: 99999;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .vz-pwa-bottom-bar.vz-bar-visible {
        transform: translateX(-50%) translateY(0);
      }
      .vz-pwa-bar-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .vz-pwa-bar-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #0f172a;
        padding: 2px;
      }
      .vz-pwa-bar-text {
        font-size: 0.82rem;
        line-height: 1.25;
      }
      .vz-pwa-bar-title {
        font-weight: 700;
        color: #fff;
      }
      .vz-pwa-bar-sub {
        font-size: 0.72rem;
        color: #94a3b8;
      }
      .vz-pwa-bar-btn {
        background: linear-gradient(135deg, #00b956, #059669);
        color: #fff;
        font-size: 0.8rem;
        font-weight: 700;
        border: none;
        border-radius: 10px;
        padding: 8px 14px;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 185, 86, 0.3);
      }
      .vz-pwa-bar-close {
        background: transparent;
        border: none;
        color: #64748b;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      /* Manual Instructions Modal (for iOS or fallback) */
      .vz-pwa-guide-modal {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(6px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .vz-pwa-guide-modal.vz-show {
        opacity: 1;
        pointer-events: auto;
      }
      .vz-pwa-guide-content {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        max-width: 400px;
        width: 100%;
        padding: 22px;
        color: #fff;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
        position: relative;
      }
      .vz-pwa-guide-step {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin: 14px 0;
        font-size: 0.88rem;
        color: #cbd5e1;
        line-height: 1.4;
      }
      .vz-pwa-guide-num {
        background: #00b956;
        color: #fff;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-weight: 700;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Create & Inject HTML elements
  function injectElements() {
    // 1. Bottom Sheet / Full Popup Modal
    const overlay = document.createElement('div');
    overlay.id = 'vzPwaOverlay';
    overlay.className = 'vz-pwa-overlay';
    overlay.innerHTML = `
      <div class="vz-pwa-card" role="dialog" aria-modal="true" aria-labelledby="vzPwaTitle">
        <button class="vz-pwa-close-btn" id="vzPwaCloseBtn" aria-label="Close install prompt">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="vz-pwa-header">
          <img src="/android-chrome-192x192.png" alt="Vidzova App" class="vz-pwa-icon" />
          <div class="vz-pwa-title-wrap">
            <div class="vz-pwa-app-name" id="vzPwaTitle">
              Vidzova App
              <span class="vz-pwa-badge">Fast &amp; Free</span>
            </div>
            <div class="vz-pwa-meta">
              <span class="vz-pwa-stars">★★★★★</span>
              <span>4.9 • Official Web App</span>
            </div>
          </div>
        </div>

        <div class="vz-pwa-body">
          Install Vidzova on your phone for instant, 1-click video and audio downloads directly from your home screen.
        </div>

        <div class="vz-pwa-features">
          <div class="vz-pwa-feat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>No pop-up ads</span>
          </div>
          <div class="vz-pwa-feat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>1080p MP4 &amp; MP3</span>
          </div>
          <div class="vz-pwa-feat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>1-Click Launch</span>
          </div>
          <div class="vz-pwa-feat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Zero storage used</span>
          </div>
        </div>

        <div class="vz-pwa-actions">
          <button class="vz-pwa-btn-later" id="vzPwaLaterBtn">Not Now</button>
          <button class="vz-pwa-btn-install" id="vzPwaInstallBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Install App
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // 2. Manual Installation Guide Modal (iOS / fallback)
    const guide = document.createElement('div');
    guide.id = 'vzPwaGuideModal';
    guide.className = 'vz-pwa-guide-modal';
    guide.innerHTML = `
      <div class="vz-pwa-guide-content">
        <button class="vz-pwa-close-btn" id="vzPwaGuideCloseBtn" aria-label="Close guide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div style="font-weight:800; font-size:1.15rem; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
          <img src="/android-chrome-192x192.png" style="width:28px;height:28px;border-radius:6px;" alt="Logo" />
          Install Vidzova on ${isIOS ? 'iPhone / iPad' : 'Chrome'}
        </div>
        <p style="font-size:0.84rem; color:#94a3b8; margin-bottom:16px;">
          Follow these quick steps to add Vidzova to your phone screen:
        </p>

        ${isIOS ? `
          <div class="vz-pwa-guide-step">
            <div class="vz-pwa-guide-num">1</div>
            <div>Tap the <strong>Share</strong> button <svg style="display:inline;vertical-align:middle;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> at the bottom of Safari.</div>
          </div>
          <div class="vz-pwa-guide-step">
            <div class="vz-pwa-guide-num">2</div>
            <div>Scroll down and select <strong>"Add to Home Screen"</strong>.</div>
          </div>
          <div class="vz-pwa-guide-step">
            <div class="vz-pwa-guide-num">3</div>
            <div>Tap <strong>"Add"</strong> in the top-right corner. Enjoy 1-click downloads!</div>
          </div>
        ` : `
          <div class="vz-pwa-guide-step">
            <div class="vz-pwa-guide-num">1</div>
            <div>Tap Chrome's <strong>Menu (⋮)</strong> at the top right of your browser.</div>
          </div>
          <div class="vz-pwa-guide-step">
            <div class="vz-pwa-guide-num">2</div>
            <div>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
          </div>
          <div class="vz-pwa-guide-step">
            <div class="vz-pwa-guide-num">3</div>
            <div>Tap <strong>"Install"</strong> to add the app icon to your phone screen!</div>
          </div>
        `}
        <button id="vzPwaGuideDoneBtn" style="width:100%; margin-top:14px; padding:11px; background:#00b956; color:#fff; border:none; border-radius:12px; font-weight:700; cursor:pointer;">
          Got it!
        </button>
      </div>
    `;
    document.body.appendChild(guide);

    // 3. Floating Bottom Mini Bar on Mobile (shows after popup dismissed or as a quiet reminder)
    const bottomBar = document.createElement('div');
    bottomBar.id = 'vzPwaBottomBar';
    bottomBar.className = 'vz-pwa-bottom-bar';
    bottomBar.innerHTML = `
      <div class="vz-pwa-bar-info">
        <img src="/android-chrome-192x192.png" alt="Vidzova" class="vz-pwa-bar-icon" />
        <div class="vz-pwa-bar-text">
          <div class="vz-pwa-bar-title">Vidzova App</div>
          <div class="vz-pwa-bar-sub">Install for faster access</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <button class="vz-pwa-bar-btn" id="vzPwaBarInstallBtn">Install</button>
        <button class="vz-pwa-bar-close" id="vzPwaBarCloseBtn" aria-label="Dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(bottomBar);

    // 4. Inject "Install App" pill in Header nav if exists
    const navRight = document.querySelector('.sf-header-actions') || document.querySelector('.sf-nav-actions');
    if (navRight && !document.getElementById('vzPwaHeaderPill')) {
      const pill = document.createElement('button');
      pill.id = 'vzPwaHeaderPill';
      pill.className = 'vz-pwa-header-pill';
      pill.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Install App</span>
      `;
      pill.addEventListener('click', triggerInstallFlow);
      navRight.prepend(pill);
    }

    // Attach Event Listeners
    document.getElementById('vzPwaCloseBtn')?.addEventListener('click', dismissPopup);
    document.getElementById('vzPwaLaterBtn')?.addEventListener('click', dismissPopup);
    document.getElementById('vzPwaInstallBtn')?.addEventListener('click', triggerInstallFlow);

    document.getElementById('vzPwaGuideCloseBtn')?.addEventListener('click', hideGuide);
    document.getElementById('vzPwaGuideDoneBtn')?.addEventListener('click', hideGuide);

    document.getElementById('vzPwaBarCloseBtn')?.addEventListener('click', () => {
      bottomBar.classList.remove('vz-bar-visible');
      localStorage.setItem(DISMISS_KEY, (Date.now() + DISMISS_DURATION_MS).toString());
    });
    document.getElementById('vzPwaBarInstallBtn')?.addEventListener('click', triggerInstallFlow);
  }

  function showPopup() {
    const overlay = document.getElementById('vzPwaOverlay');
    if (overlay) {
      overlay.classList.add('vz-show');
    }
  }

  function hidePopup() {
    const overlay = document.getElementById('vzPwaOverlay');
    if (overlay) {
      overlay.classList.remove('vz-show');
    }
  }

  function dismissPopup() {
    hidePopup();
    localStorage.setItem(DISMISS_KEY, (Date.now() + DISMISS_DURATION_MS).toString());
    // Show quiet bottom bar after 15 seconds if on mobile
    if (isMobile) {
      setTimeout(() => {
        const bottomBar = document.getElementById('vzPwaBottomBar');
        if (bottomBar && !isStandalone) {
          bottomBar.classList.add('vz-bar-visible');
        }
      }, 15000);
    }
  }

  function showGuide() {
    const guide = document.getElementById('vzPwaGuideModal');
    if (guide) {
      guide.classList.add('vz-show');
    }
  }

  function hideGuide() {
    const guide = document.getElementById('vzPwaGuideModal');
    if (guide) {
      guide.classList.remove('vz-show');
    }
  }

  async function triggerInstallFlow() {
    hidePopup();
    const bottomBar = document.getElementById('vzPwaBottomBar');
    if (bottomBar) bottomBar.classList.remove('vz-bar-visible');

    if (deferredPrompt) {
      // Native Chrome PWA Install Prompt!
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          console.log('[PWA] User accepted installation prompt.');
          localStorage.setItem(DISMISS_KEY, (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
          const pill = document.getElementById('vzPwaHeaderPill');
          if (pill) pill.remove();
        }
        deferredPrompt = null;
      } catch (err) {
        console.warn('[PWA] Error launching prompt:', err);
        showGuide();
      }
    } else {
      // Fallback instructions modal (for Safari, or if beforeinstallprompt already fired)
      showGuide();
    }
  }

  // Intercept Chrome beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured!');

    // Check if user dismissed recently
    const dismissedUntil = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    const now = Date.now();

    if (now > dismissedUntil) {
      // On mobile devices, show the prompt smoothly after 2 seconds
      setTimeout(() => {
        showPopup();
      }, 2000);
    } else {
      // Show subtle bottom bar if on mobile
      if (isMobile) {
        setTimeout(() => {
          const bottomBar = document.getElementById('vzPwaBottomBar');
          if (bottomBar) bottomBar.classList.add('vz-bar-visible');
        }, 5000);
      }
    }
  });

  // Listen for successful install
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Vidzova was successfully installed!');
    hidePopup();
    hideGuide();
    const bottomBar = document.getElementById('vzPwaBottomBar');
    if (bottomBar) bottomBar.classList.remove('vz-bar-visible');
    const pill = document.getElementById('vzPwaHeaderPill');
    if (pill) pill.remove();
    deferredPrompt = null;
    localStorage.setItem(DISMISS_KEY, (Date.now() + 365 * 24 * 60 * 60 * 1000).toString());
  });

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectStyles();
      injectElements();
    });
  } else {
    injectStyles();
    injectElements();
  }

  // Fallback for mobile Chrome/Safari when beforeinstallprompt is not supported or delayed
  window.addEventListener('load', () => {
    if (isMobile && !deferredPrompt && !isStandalone) {
      const dismissedUntil = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      if (Date.now() > dismissedUntil) {
        setTimeout(() => {
          if (!deferredPrompt && !isStandalone) {
            // Show bottom bar reminder on mobile
            const bottomBar = document.getElementById('vzPwaBottomBar');
            if (bottomBar) bottomBar.classList.add('vz-bar-visible');
          }
        }, 3500);
      }
    }
  });
})();
