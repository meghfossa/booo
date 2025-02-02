console.debug("background script loaded for scary tabs");

import { STORAGE_KEY, defaultSettings } from "@src/settings";

// Listen for extension installation
// This is used to initialize the storage with default settings
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.set({ [STORAGE_KEY]: defaultSettings }, () => {
      console.debug("Default settings initialized:", defaultSettings);
    });
  }
});
