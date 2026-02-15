# Old Twitter Mode

A Chrome Extension to revert X (formerly Twitter) to its classic 2012–2015 look.

![Extension Icon](https://raw.githubusercontent.com/ikole/retro-twitter/main/extension/icon128.png)

## Features

- **Classic Design**: Restores the iconic 2012 CSS, featuring the solid blue header (`#0084B4`), light blue background (`#C0DEED`), and square avatars (rounded corners).
- **Retro Interactions**: Replaces the modern "Heart" (Like) with the classic "Star" (Favorite).
- **Clutter Free**: Options to hide modern elements like Grok, Premium, Subscriptions, Blue Checks, and the "For You" tab.
- **Performance Optimized**: Uses efficient observers to apply styles without slowing down your browsing.
- **Privacy Focused**: No tracking, no data collection. All settings are stored locally in your browser.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `extension` folder from this repository.
5. Refresh X/Twitter to see the changes!

## Development

- `content.js`: Main logic for DOM manipulation and style injection.
- `old-twitter.css`: The core stylesheet defining the retro look.
- `popup.html` / `popup.js`: The extension options menu.

## License

MIT
