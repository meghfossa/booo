import { useState, useEffect, useRef } from "react";

export type StorageArea = "sync" | "local";

/**
 * Custom hook to read and write JSON to chrome storage (local or sync).
 * Ensures that the stored value is used once it's fetched.
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  area: StorageArea = "local",
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T | null>(null); // Initialize as null
  const isFirstRender = useRef(true); // Keep track of first render

  // Read from storage when the component mounts
  useEffect(() => {
    const getStoredValue = async () => {
      try {
        const result = await chrome.storage[area].get(key);
        if (result && result[key] !== undefined) {
          setStoredValue(result[key]); // Update state with stored value
        } else {
          setStoredValue(defaultValue); // Fallback to default if nothing is stored
        }
      } catch (error) {
        console.warn(`Error reading storage for key "${key}":`, error);
        setStoredValue(defaultValue); // Fallback to default on error
      }
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      getStoredValue(); // Only read from storage once on first render
    }
  }, [key, area, defaultValue]);

  // Function to update the value in both state and storage
  const setValue = (value: T) => {
    setStoredValue(value);
    chrome.storage[area].set({ [key]: value }).catch((error) => {
      console.warn(`Error setting storage for key "${key}":`, error);
    });
  };

  // Return the stored value or fallback to default only if not yet loaded
  return [storedValue ?? defaultValue, setValue];
}
