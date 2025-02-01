import { useEffect, useState } from 'react';
import cover from '@assets/img/cover.png';
import { isPredefinedSite, useSettings, defaultSettings } from '@src/settings';
import Toggle from './Toggle';

export default function Popup() {
  const [domain, setDomain] = useState<string>("");
  const [settings, setSettings] = useSettings();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const url = tabs[0].url;
      if (!url) return;

      try {
        const domainName = new URL(url).hostname;
        setDomain(domainName);
      } catch (error) {
        console.error("Invalid URL:", error);
      }
    });
  }, []);

  const isUserSpecifiable = !isPredefinedSite(domain);
  const isUserSpecified = settings.userSpecified[domain] || false;
  const countOfUserSpecified = Object.keys(settings.userSpecified).filter(key => settings.userSpecified[key]).length;

  const setSocialWebsite = (checked: boolean) => {
    setSettings({
      ...settings,
      socialWebsite: checked
    });
  }

  const setNewsWebsite = (checked: boolean) => {
    setSettings({
      ...settings,
      newsWebsite: checked
    });
  }

  const setBooWithSound = (checked: boolean) => {
    setSettings({
      ...settings,
      booWithSound: checked
    });
  }

  const setCustomSites = (checked: boolean) => {
    setSettings({
      ...settings,
      customSites: checked
    });
  }

  const toggleUserSpecified = (isActive: boolean) => {
    setSettings({
      ...settings,
      userSpecified: {
        ...settings.userSpecified,
        [domain]: isActive
      }
    });
  }

  const resetSettings = () => {
    setSettings(defaultSettings);
  }

  const scareText = isUserSpecified ? `Don't scare on ${domain}` : `Scare on ${domain}`;
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center bg-black text-white rounded-lg">
      <header className="flex flex-col items-center justify-center text-white grow">
        <img src={cover} className="w-48 pointer-events-none" alt="logo" />
        {
          isUserSpecifiable ?
            (
              <a
                href="#"
                className="text-blue-400 py-2 underline text-sm"
                onClick={() => toggleUserSpecified(!isUserSpecified)}>
                {scareText}
              </a>
            )
            : <></>
        }
        <h2 className="text-[40px] creepster-regular horror-text">Scray tabs</h2>
        <div className="flex flex-col p-2 w-full gap mt grow">
          <div className="text-lg text-black flex grow flex-col gap p-2 rounded-lg solid border-2 border-white bubblegum-sans-regular wiggly-box text-lg">
            <Toggle text="Social Media" checked={settings.socialWebsite} onChange={setSocialWebsite} />
            <Toggle text="News Media" checked={settings.newsWebsite} onChange={setNewsWebsite} />
            <h4 className="underline text-indigo-900">{`+ (${countOfUserSpecified}) Sites specified`}</h4>
          </div>

          <div className="text-lg text-black flex flex-col gap-2 pt-2 rounded-lg solid border-2 border-white bubblegum-sans-regular wiggly-box mt-2">
            <Toggle
              text={(
                <div>
                  <span>Sound on</span>
                  <a className="text-md pl-1 underline" href="https://developer.chrome.com/blog/autoplay">(?)</a>
                </div>
              )}
              checked={settings.booWithSound}
              onChange={setBooWithSound} />
          </div>
        </div>
      </header>
      <footer className="flex flex-row justify-between px-2 pb-1">
        <a className="text-white underline" href="#" onClick={resetSettings}>Reset everything!</a>
        <a className="text-white underline" href="https://github.com/meghfossa/booo">Code</a>
      </footer>
    </div>
  );
}
