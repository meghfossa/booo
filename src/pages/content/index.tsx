import './style.css'
import { createRoot } from 'react-dom/client';
import { getBooActivationForDomain, getRootDomain, Settings, STORAGE_KEY } from '@src/settings';
import { useEffect, useState } from 'react';
import { Modal } from './modal';
import { useStopwatch } from 'react-timer-hook';

const getDomainInfo = () => {
  const fullUrl = window.location.href;
  const domain = getRootDomain(fullUrl);
  return { fullUrl, domain };
};

function JumpScare() {
  const { domain } = getDomainInfo();
  const [storedSettings, setStoredSettings] = useState<Settings | null>(null);
  const [booPreference, setBooPreference] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    seconds,
    reset,
    pause,
    isRunning,
  } = useStopwatch({ autoStart: true });

  // Get stored settings
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      setStoredSettings(result.userSettings as Settings);
    })
  }, []);

  // Listen for changes in stored settings
  useEffect(() => {
    const listener = () => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        reset();
        setStoredSettings(result.userSettings as Settings);
      })
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  // Get boo per stored settings
  useEffect(() => {
    if (!storedSettings) return;
    const fetchBooPreference = async () => {
      const preference = await getBooActivationForDomain(domain, storedSettings);
      setBooPreference(preference);
      console.debug('booo: fetched booPreference', preference, storedSettings);
    };
    fetchBooPreference();
  }, [storedSettings]);

  // Trigger boo
  useEffect(() => {
    if (!booPreference) return;
    if (booPreference.activation.type !== 'no_boo') {
      const lowSecond = randomBetween(5, 60);
      const highSecond = randomBetween(lowSecond, 60);
      const randomBreak = randomBetween(5, 10) * 1000;
      const shouldBoo = seconds > lowSecond && seconds < highSecond;
      if (shouldBoo && !isModalOpen && isRunning) {
        setIsModalOpen(true);
        pause();
        setTimeout(() => {
          reset();
        }, randomBreak);
      }
    }
  }, [booPreference, seconds]);

  // Modal content conditionally rendered based on state
  const playSound = () => {
    const audio = new Audio(booPreference?.sound || '');
    audio.play();
  };

  const isBooing = booPreference !== null && booPreference.activation.type !== 'no_boo';

  return (
    <div>
      {isBooing && isModalOpen ? (
        <Modal
          isOpen={isModalOpen}
          sound={booPreference.sound}
          onClose={() => setIsModalOpen(false)}
        >
          <div onLoad={() => playSound()} className="flex grow w-full h-full items-center justify-center">
            <img className="modal-image" src={booPreference.image || ''} alt="Jump scare" />
            <audio autoPlay>
              <source src={booPreference.sound || ''} type="audio/mpeg" />
            </audio>
          </div>
        </Modal>
      ) : (
        <></>
      )}
    </div>
  );
}


// Activate Scary
try {
  console.debug('content script loaded for scary tabs');
  const div = document.createElement('div');
  div.id = '__scary_tabs';
  document.body.appendChild(div);

  const rootContainer = document.querySelector('#__scary_tabs');
  if (!rootContainer) throw new Error("Can't find Content root element");
  const root = createRoot(rootContainer);
  const key = Date.now();
  root.render(<JumpScare key={key} />);
} catch (e) {
  console.error(e);
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
