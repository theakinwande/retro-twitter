// Old Twitter Mode — Content Script
// Handles: inline style overrides, heart→star, avatar clip-path, hiding modern elements.

(function () {
  // ===== Settings =====
  let settings = {
    hide_grok: true,
    hide_premium: true,
    hide_subscriptions: true,
    hide_bluecheck: true,
    hide_foryou: true,
    hide_videos: true,
  };

  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(null, (items) => {
      if (items) Object.assign(settings, items);
      run();
    });
    chrome.storage.onChanged.addListener((changes) => {
      for (let key in changes) settings[key] = changes[key].newValue;
      run();
    });
  }

  // ===== Utilities =====
  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  // ===== Main =====
  function run() {
    if (!document.body) return;
    document.body.classList.add("old-twitter-mode");
    overrideInlineBackgrounds();
    fixAvatars();
    replaceHeartWithStar();
    hideModernElements();
  }

  // ===== Override inline background-color on key containers =====
  // X.com injects `style="background-color: rgb(0, 0, 0)"` (dark mode)
  // or `style="background-color: rgb(21, 32, 43)"` (dim mode) on containers.
  // CSS !important CAN override inline styles, but X re-applies them via React.
  // So we also set them via JS for good measure.
  function overrideInlineBackgrounds() {
    // The main full-page wrapper inside #react-root
    const reactRoot = document.getElementById("react-root");
    if (reactRoot) {
      reactRoot.style.setProperty("background-color", "#c0deed", "important");
      // The first two children are usually the layout wrappers
      const child1 = reactRoot.firstElementChild;
      if (child1) {
        child1.style.setProperty("background-color", "#c0deed", "important");
        const child2 = child1.firstElementChild;
        if (child2) {
          child2.style.setProperty("background-color", "#c0deed", "important");
        }
      }
    }

    // Primary column (the feed)
    const primary = document.querySelector('[data-testid="primaryColumn"]');
    if (primary) {
      primary.style.setProperty("background-color", "#ffffff", "important");
    }

    // Each tweet article
    document.querySelectorAll("article").forEach((el) => {
      el.style.setProperty("background-color", "#ffffff", "important");
    });

    // Sidebar
    const sidebar = document.querySelector('[data-testid="sidebarColumn"]');
    if (sidebar) {
      sidebar.style.setProperty("background-color", "transparent", "important");
      sidebar.querySelectorAll("section").forEach((s) => {
        s.style.setProperty("background-color", "#ffffff", "important");
      });
    }

    // Header (left nav)
    const header = document.querySelector('header[role="banner"]');
    if (header) {
      header.style.setProperty("background-color", "#ffffff", "important");
    }

    // Force text color on all spans/divs inside tweets to be dark
    document.querySelectorAll('[data-testid="tweetText"] span').forEach((el) => {
      const computed = getComputedStyle(el).color;
      // If the text is white-ish or very light, force it dark
      if (computed === "rgb(255, 255, 255)" || computed === "rgb(231, 233, 234)" || computed === "rgb(247, 249, 249)") {
        el.style.setProperty("color", "#14171a", "important");
      }
    });

    // Force display names and handles to be visible
    document.querySelectorAll('[data-testid="User-Name"] span').forEach((el) => {
      const computed = getComputedStyle(el).color;
      if (computed === "rgb(255, 255, 255)" || computed === "rgb(231, 233, 234)" || computed === "rgb(247, 249, 249)") {
        el.style.setProperty("color", "#14171a", "important");
      }
    });

    // Fix handles (gray) — target the dir="ltr" spans near time
    document.querySelectorAll('[data-testid="User-Name"] div[dir="ltr"] span').forEach((el) => {
      el.style.setProperty("color", "#657786", "important");
    });
    document.querySelectorAll("article time").forEach((el) => {
      el.style.setProperty("color", "#657786", "important");
    });
  }

  // ===== Avatars → Square =====
  function fixAvatars() {
    // Remove clip-path (X uses it for circle avatars)
    document.querySelectorAll('[data-testid="Tweet-User-Avatar"] [style*="clip-path"]').forEach((el) => {
      el.style.clipPath = "none";
      el.style.borderRadius = "4px";
      el.style.overflow = "hidden";
    });
    // Also target the img directly
    document.querySelectorAll('[data-testid="Tweet-User-Avatar"] img').forEach((img) => {
      img.style.borderRadius = "4px";
    });
  }

  // ===== Heart → Star =====
  function replaceHeartWithStar() {
    document.querySelectorAll('[data-testid="like"] svg, [data-testid="unlike"] svg').forEach((svg) => {
      if (!svg.classList.contains("otm-star")) {
        svg.innerHTML = '<polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.63 12,2 9.19,8.63 2,9.24 7.46,13.97 5.82,21" fill="currentColor" stroke="currentColor"/>';
        svg.classList.add("otm-star");
      }
    });
  }

  // ===== Hide Modern Elements =====
  function hideModernElements() {
    if (settings.hide_grok !== false) {
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
      document.querySelectorAll('[data-testid="icon-verified"]').forEach((el) => (el.style.display = "none"));
    }
    if (settings.hide_foryou !== false) {
      if (window.location.pathname === "/home" || window.location.pathname === "/") {
        const tabs = document.querySelectorAll('[role="tablist"] [role="tab"]');
        if (tabs.length >= 2) tabs[0].style.display = "none";
      }
    }
    if (settings.hide_videos !== false) {
      document.querySelectorAll("video").forEach((e) => (e.style.display = "none"));
    }
  }

  function hide(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      const nav = el.closest('a[role="link"]');
      if (nav) nav.style.display = "none";
      else el.style.display = "none";
    });
  }

  // ===== Observer =====
  const debouncedRun = debounce(run, 200);
  const observer = new MutationObserver(debouncedRun);
  observer.observe(document.body, { childList: true, subtree: true });
  run();
})();
