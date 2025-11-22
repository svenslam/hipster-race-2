
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Declare global function from script.js to avoid TS errors
declare global {
  interface Window {
    showView: (viewId: string, skipRandom?: boolean) => void;
  }
}

const mountNode = document.getElementById('react-view');

if (mountNode) {
  const root = ReactDOM.createRoot(mountNode);

  const handleExit = () => {
    // Use the global navigation function from script.js
    // Pass 'true' as second argument to SKIP random surprise chance when exiting the mini-games
    if (window.showView) {
      window.showView('main-menu', true);
    } else {
      // Fallback logic if script.js hasn't loaded
      const reactView = document.getElementById('react-view');
      const mainMenu = document.getElementById('main-menu');
      const header = document.getElementById('main-header');

      if (reactView) reactView.classList.add('hidden');
      if (mainMenu) mainMenu.classList.remove('hidden');
      if (header) header.style.display = 'block';
    }
  };

  root.render(
    <React.StrictMode>
      <App onExit={handleExit} />
    </React.StrictMode>
  );
} else {
  console.error("Could not find #react-view element");
}
