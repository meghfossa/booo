import { Dispatch, SetStateAction } from "react";
import { useStorage } from "./useStorage";

type Settings = {
  booActivation: BooActivateConfig;
  booWithSound: boolean;
  userSpecified: { [key: string]: boolean };
  customSites: boolean;
  newsWebsite: boolean;
  socialWebsite: boolean;
};

export type BooActivateConfig =
  | { type: "no_boo" }
  | { type: "after"; value: number }
  | { type: "random" }
  | { type: "dial"; value: "very_fast" | "fast" | "slowly" | "very_slowly" };

export const defaultSettings: Settings = {
  userSpecified: {},
  booWithSound: true,
  booActivation: { type: "after", value: 4_000 },
  customSites: true,
  newsWebsite: true,
  socialWebsite: true,
};

const NoBoo: BooActivateConfig = { type: "no_boo" };

/**
 * Returns a stateful settings value from sync storage, and a function to update it.
 */
export function useSettings(): [Settings, Dispatch<SetStateAction<Settings>>] {
  return useStorage<Settings>("userSettings", defaultSettings, "sync");
}

export function getBooActivationForDomain(domain: string, settings: Settings) {
  const isSocialMedia = SocialMediaSites.has(domain);
  const isNewsMedia = NewsMediaSites.has(domain);
  const isUserSpecified = settings.userSpecified[domain] || false;

  const booActivation =
    isSocialMedia || isNewsMedia || isUserSpecified
      ? settings.booActivation
      : NoBoo;

  return {
    sound: getScarySound(),
    activation: booActivation,
    image: getScaryImage(),
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
  return SocialMediaSites.has(domain) || NewsMediaSites.has(domain);
};

const scaryImages = [
  "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=3537&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const scarySounds = [
  "https://cdn.freesound.org/previews/518/518756_8278798-lq.mp3",
];

const getScaryImage = () => {
  return scaryImages[Math.floor(Math.random() * scaryImages.length)];
};

const getScarySound = () => {
  return scarySounds[Math.floor(Math.random() * scarySounds.length)];
};
