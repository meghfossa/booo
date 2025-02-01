import { createRoot } from 'react-dom/client';
import './style.css'
import { getBooActivationForDomain, useSettings, BooActivateConfig } from '@src/settings';
import React from 'react';
import { Modal } from './modal';

const getDomainInfo = () => {
  const hostname = window.location.hostname;
  const fullUrl = window.location.href;
  const domain = hostname.replace('www.', '');
  return { hostname, fullUrl, domain };
};

function JumpScare() {
  const { domain } = getDomainInfo();
  const [settings, _] = useSettings();
  const booPreference = getBooActivationForDomain(domain, settings);

  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const [hasTimeElapsed, setHasTimeElapsed] = React.useState(false);
  const isNotBooing = booPreference.activation.type === "no_boo";

  // Preload image and show modal only when loaded
  // Use a single useEffect to manage both image preload and modal state
  React.useEffect(() => {
    const img = new Image();
    img.src = booPreference.image;

    img.onload = () => {
      setIsImageLoaded(true);
    };

  }, [booPreference.image]);

  React.useEffect(() => {
    const time = booPreference.activation.type === "after"
      ? booPreference.activation.value
      : 4_000; // 4s
    setTimeout(() => {
      setHasTimeElapsed(true);
    }, time);
  }, [booPreference.activation]);

  const audio = new Audio(booPreference.sound);
  const playSound = () => {
    audio.play();
  }
  console.log('isModalOpen', isModalOpen);
  return <div>{(isImageLoaded && !isNotBooing && hasTimeElapsed) ? (
    <Modal
      isOpen={isModalOpen}
      sound={booPreference.sound}
      onClose={() => setIsModalOpen(false)}
    >
      <div onLoad={() => playSound()} className="flex grow w-full h-full items-center justify-center">
        <img className="modal-image" src={booPreference.image} alt="Jump scare" />
        <audio autoPlay>
          <source src={booPreference.sound} type="audio/mpeg" />
        </audio>
      </div>

    </Modal>
  ) : (
    <></>
  )}</div>;
}

// Activate Scary

try {
  console.log('content script loaded');
  const div = document.createElement('div');
  div.id = '__scary_tabs';
  document.body.appendChild(div);

  const rootContainer = document.querySelector('#__scary_tabs');
  if (!rootContainer) throw new Error("Can't find Content root element");
  const root = createRoot(rootContainer);
  const key = Date.now();
  root.render(<JumpScare key={key} />);

  // Keep on scaring, every 10 seconds (even if user manually closes the modal)
  const every10Seconds = 10_000;
  setInterval(() => {
    const key = Date.now();
    console.log('re-rendering at:', key);
    root.render(<JumpScare key={key} />);
  }, every10Seconds);

} catch (e) {
  console.error(e);
}