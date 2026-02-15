// Popup logic for toggles
const options = [
  'grok', 'premium', 'subscriptions', 'bluecheck', 'foryou', 'videos'
];

options.forEach(opt => {
  const checkbox = document.getElementById('toggle-' + opt);
  checkbox.addEventListener('change', () => {
    chrome.storage.sync.set({ ['hide_' + opt]: checkbox.checked });
  });
  chrome.storage.sync.get('hide_' + opt, data => {
    checkbox.checked = data['hide_' + opt] !== false;
  });
});
