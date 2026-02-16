// Old Twitter Mode — Content Script
// Handles dynamic DOM changes that CSS alone can't cover.

(function () {
  // ===== Settings (cached) =====
  let settings = {
    hide_grok: true,
    hide_premium: true,
    hide_subscriptions: true,
    hide_bluecheck: true,
    hide_foryou: true,
    hide_videos: true,
  };

  // Load settings once, then listen for changes
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(null, (items) => {
      if (items) {
        Object.keys(items).forEach((key) => {
          settings[key] = items[key];
        });
      }
      applyOldTwitterStyles();
    });

    chrome.storage.onChanged.addListener((changes) => {
      for (let key in changes) {
        settings[key] = changes[key].newValue;
      }
      applyOldTwitterStyles();
    });
  }

  // ===== Utilities =====
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // ===== Main Entry =====
  function applyOldTwitterStyles() {
    if (!document.body) return;
    document.body.classList.add("old-twitter-mode");

    replaceHeartWithStar();
    fixAvatarClipPaths();
    hideModernElements();
  }

  // ===== Heart → Star =====
  function replaceHeartWithStar() {
    // Target the like button SVGs specifically
    document
      .querySelectorAll(
        '[data-testid="like"] svg, [data-testid="unlike"] svg'
      )
      .forEach((svg) => {
        if (!svg.classList.contains("old-twitter-star")) {
          svg.innerHTML =
            '<polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.63 12,2 9.19,8.63 2,9.24 7.46,13.97 5.82,21" fill="currentColor" stroke="currentColor"/>';
          svg.classList.add("old-twitter-star");
        }
      });
  }

  // ===== Fix Avatar Clip Paths =====
  // X uses `clip-path: url(...)` on avatar containers to make them circles.
  // CSS can't always override inline clip-path, so we remove it via JS.
  function fixAvatarClipPaths() {
    document
      .querySelectorAll('[data-testid="Tweet-User-Avatar"] [style*="clip-path"]')
      .forEach((el) => {
        el.style.clipPath = "none";
        el.style.webkitClipPath = "none";
        el.style.borderRadius = "4px";
        el.style.overflow = "hidden";
      });
  }

  // ===== Hide Modern Elements =====
  function hideModernElements() {
    if (settings.hide_grok !== false) {
      // Grok nav item & drawer
      hide('[data-testid="AppTabBar_Grok_Icon"]');
      hide('[data-testid="GrokDrawer"]');
      hide('a[href="/i/grok"]');
    }

    if (settings.hide_premium !== false) {
      hide('[data-testid="AppTabBar_Premium_Icon"]');
      hide('a[href="/i/premium_sign_up"]');
      hide('a[href="/i/verified-choose"]');
    }

    if (settings.hide_subscriptions !== false) {
      hide('a[href="/i/monetization"]');
    }

    if (settings.hide_bluecheck !== false) {
      document
        .querySelectorAll('[data-testid="icon-verified"]')
        .forEach((el) => (el.style.display = "none"));
    }

    if (settings.hide_foryou !== false) {
      // Hide "For You" tab (first tab on the home page)
      if (
        window.location.pathname === "/home" ||
        window.location.pathname === "/"
      ) {
        const tabs = document.querySelectorAll(
          '[role="tablist"] [role="tab"]'
        );
        if (tabs.length >= 2) {
          tabs[0].style.display = "none";
        }
      }
    }

    if (settings.hide_videos !== false) {
      document
        .querySelectorAll("video")
        .forEach((e) => (e.style.display = "none"));
    }
  }

  // Helper: hide an element and its closest navigable parent
  function hide(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      // Try to hide the parent nav item cell for cleaner results
      const navItem = el.closest('nav a, a[role="link"]');
      if (navItem) {
        navItem.style.display = "none";
      } else {
        el.style.display = "none";
      }
    });
  }

  // ===== Observer =====
  const debouncedApply = debounce(applyOldTwitterStyles, 150);

  const observer = new MutationObserver(debouncedApply);
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run
  applyOldTwitterStyles();
})();
