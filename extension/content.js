// Old Twitter Mode Content Script

(function () {
  // Default settings
  let settings = {
    hide_grok: true,
    hide_premium: true,
    hide_subscriptions: true,
    hide_bluecheck: true,
    hide_foryou: true,
    hide_videos: true,
  };

  // Initialize settings
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(null, (items) => {
      // Merge defaults with stored items
      // Note: stored items might be undefined for keys never toggled,
      // check if key exists or if logic requires strict check
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

  // Utility: Wait for element (kept for future use if needed)
  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }
      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Utility: Debounce function
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Apply old Twitter styles
  function applyOldTwitterStyles() {
    if (!document.body) return;
    document.body.classList.add('old-twitter-mode');
    
    // Header specific class
    const header = document.querySelector('header[role="banner"]');
    if (header && !header.classList.contains('old-twitter-header')) {
        header.classList.add('old-twitter-header');
    }

    replaceHeartWithStar();
    hideModernElements();
    adjustTweetCards();
  }

  // Replace heart icon with star
  function replaceHeartWithStar() {
    // 1. Replace the SVG icon
    document.querySelectorAll('svg[data-testid="like"], svg[data-testid="unlike"]').forEach(svg => {
      if (!svg.classList.contains('old-twitter-star')) {
        svg.innerHTML = '<polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.63 12,2 9.19,8.63 2,9.24 7.46,13.97 5.82,21" fill="#FFD700" stroke="#FFD700"/>';
        svg.classList.add('old-twitter-star');
      }
    });

    // 2. Update tooltip/aria-label if present (optional but good for accessibility)
    // We can't easily translate "Favorite" to user's language without an i18n map.
    // For now, we will perform a generic update only if it likely matches the like button structure.
    // Instead of text matching, we target the container button.
    document.querySelectorAll('[data-testid="like"], [data-testid="unlike"]').forEach(btn => {
      // If we really want to change the tooltip text, we need a reliable way.
      // However, changing aria-label from "Like" to "Favorite" English-only might be weird for non-English users.
      // Better to leave the native localized tooltip or just update the icon.
      // If you MUST change it to "Favorite", do it here, but be aware it forces English.
      // The previous code forced "Favorite" in aria-label, which is an accessibility regression for non-English.
      // We will SKIP forcing English text to preserve localization, only changing the icon.
      
      // If the user *really* wants "Favorite" text, we'd need a language map. 
      // For this refactor, we remove the fragile text check and binding.
    });
  }

  // Hide modern elements based on cached settings
  function hideModernElements() {
    if (settings.hide_grok !== false) {
      document.querySelectorAll('[data-testid="GrokDrawer"]').forEach(e => e.style.display = 'none');
      // Also hide the G in the nav bar if possible
      document.querySelectorAll('[data-testid="AppTabBar_Grok_Icon"]').forEach(e => e.style.display = 'none');
    }
    if (settings.hide_premium !== false) {
      document.querySelectorAll('[data-testid="AppTabBar_Premium_Icon"]').forEach(e => e.style.display = 'none');
    }
    if (settings.hide_subscriptions !== false) {
      // Robust check using href instead of data-testid wildcards if convenient, 
      // but data-testid="AppTabBar_More_Menu" often contains it. 
      // Direct Navigation item:
      document.querySelector('a[href="/i/monetization"]')?.closest('div')?.style.setProperty('display', 'none', 'important');
    }
    if (settings.hide_bluecheck !== false) {
      document.querySelectorAll('svg[data-testid="icon-verified"]').forEach(e => e.style.display = 'none');
    }
    if (settings.hide_foryou !== false) {
      // The "For You" tab is usually the first tab in the home timeline.
      // It has role="tab" and often href="/home".
      // The "Following" tab is href="/home" (but active state differs) or technically they toggle via JS.
      // Reliable way: Check the tab list in the timeline header.
      // "For you" is usually index 0. "Following" is index 1.
      const tabs = document.querySelectorAll('[role="tablist"] [role="tab"]');
      if (tabs.length >= 2) {
         // Heuristic: The one corresponding to "For You" usually doesn't have a specific distinct href from "Following" 
         // in the DOM state sometimes, but usually Presentation is: [For You, Following]
         // Let's hide the first one IF we are on the home page.
         if (window.location.pathname === '/home' || window.location.pathname === '/') {
             // We can tries to guess based on standard order. 
             // A safer check: does it have specific react internal props or structure? Hard from content script.
             // We will assume Standard Order: 1st is For You.
             // (This is still a heuristic, but better than text matching)
             tabs[0].style.display = 'none';
             
             // If we hide the first tab, we should ensure the second one (Following) is clicked/active if not already?
             // We can't click it easily without user interaction rules, but we can hide the tab button.
         }
      }
    }
    if (settings.hide_videos !== false) {
      document.querySelectorAll('video').forEach(e => e.style.display = 'none');
    }
  }

  // Adjust tweet card design
  function adjustTweetCards() {
    document.querySelectorAll("article").forEach((card) => {
      card.style.borderRadius = "0px";
      card.style.boxShadow = "none";
      card.style.background = "#fff";
      // Smaller profile images
      card.querySelectorAll("img").forEach((img) => {
        // Heuristic: profile images are usually small-ish, but larger than icons
        // Original logic: > 40
        if (
          img.width > 40 &&
          !img.classList.contains("old-twitter-profile-adjusted")
        ) {
          img.style.width = "36px";
          img.classList.add("old-twitter-profile-adjusted");
        }
      });
    });
  }

  // Observe DOM changes
  // Use debounce to prevent performance killer on scroll/hover
  const observer = new MutationObserver(
    debounce(() => {
      applyOldTwitterStyles();
    }, 100),
  );

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial application with defaults
  applyOldTwitterStyles();
})();
