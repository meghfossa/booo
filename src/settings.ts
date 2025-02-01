import { Dispatch, SetStateAction } from "react";
import { useStorage } from "./useStorage";

export const STORAGE_KEY = "userSettings";

export type Settings = {
  booActivation: BooActivateConfig;
  booWithSound: boolean;
  userSpecified: { [key: string]: boolean };
  customSites: boolean;
  newsWebsite: boolean;
  socialWebsite: boolean;
};

export type BooActivateConfig = { type: "no_boo" } | { type: "boo" };

export const defaultSettings: Settings = {
  userSpecified: {},
  booWithSound: true,
  booActivation: { type: "boo" },
  customSites: true,
  newsWebsite: true,
  socialWebsite: true,
};

const NoBoo: BooActivateConfig = { type: "no_boo" };

/**
 * Returns a stateful settings value from sync storage, and a function to update it.
 */
export function useSettings(): [Settings, Dispatch<SetStateAction<Settings>>] {
  return useStorage<Settings>(STORAGE_KEY, defaultSettings, "local");
}

export async function getBooActivationForDomain(
  domain: string,
  settings: Settings,
) {
  const isSocialMedia = settings.socialWebsite && SocialMediaSites.has(domain);
  const isNewsMedia = settings.newsWebsite && NewsMediaSites.has(domain);
  const isUserSpecified =
    settings.customSites && (settings.userSpecified[domain] || false);

  const booActivation =
    isSocialMedia || isNewsMedia || isUserSpecified
      ? settings.booActivation
      : NoBoo;

  if (booActivation.type === "no_boo") {
    return {
      activation: booActivation,
      sound: null,
      image: null,
    };
  }

  const sound = await getScarySound();
  const image = await getScaryImage();

  return {
    sound,
    activation: booActivation,
    image,
  };
}

const SocialMediaSites = new Set([
  "facebook.com",
  "twitter.com",
  "instagram.com",
  "linkedin.com",
  "pinterest.com",
  "reddit.com",
]);

const NewsMediaSites = new Set([
  "nytimes.com",
  "wsj.com",
  "bbc.com",
  "cnn.com",
  "foxnews.com",
]);

export const isPredefinedSite = (domain: string) => {
  return isSocialMediaSite(domain) || isNewsMediaSite(domain);
};

export const isSocialMediaSite = (domain: string) => {
  const rootDomain = getRootDomain(domain);
  return SocialMediaSites.has(rootDomain) || SocialMediaSites.has(domain);
};

export const isNewsMediaSite = (domain: string) => {
  const rootDomain = getRootDomain(domain);
  return NewsMediaSites.has(rootDomain) || NewsMediaSites.has(domain);
};

// Also update - web_accessible_resources in manifest.json
const scaryImages = [
  "src/assets/scary_media/imgs/creepy_4chan_smile.jpeg",
  "src/assets/scary_media/imgs/creepy_4chan_wtf.jpeg",
  "src/assets/scary_media/imgs/creepy_pinterest_3.jpg",
  "src/assets/scary_media/imgs/creepy_pinterest_2.jpg",
  "src/assets/scary_media/imgs/creepy_pinterest_1.jpg",
  "src/assets/scary_media/imgs/creepy_pinterest_4.jpg",
  "src/assets/scary_media/imgs/scary_clown_1.jpg",
];

// Also update - web_accessible_resources in manifest.json
const scarySounds = [
  "src/assets/scary_media/audio/man_scream_1.mp3",
  "src/assets/scary_media/audio/man_scream_2.mp3",
  "src/assets/scary_media/audio/woman_scream_1.mp3",
];

// Get a Blob URL for a local resource
const getLocalBlobUrl = (resourcePath: string) => {
  const url = chrome.runtime.getURL(resourcePath);
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => URL.createObjectURL(blob))
    .catch((error) => {
      console.error("Failed to fetch media:", error);
      return null;
    });
};

// Get a random scary image as Blob URL (using local resources)
const getScaryImage = async () => {
  const url = scaryImages[Math.floor(Math.random() * scaryImages.length)];
  return await getLocalBlobUrl(url);
};

// Get a random scary sound as Blob URL (using local resources)
const getScarySound = async () => {
  const url = scarySounds[Math.floor(Math.random() * scarySounds.length)];
  return await getLocalBlobUrl(url);
};

export const getRootDomain = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    if (parts.length > 2) {
      return parts.slice(-2).join("."); // Keep only the last two parts
    }
    return hostname; // Already a root domain
  } catch (e) {
    console.error("Error getting root domain for url:", url, e);
    return url;
  }
};
