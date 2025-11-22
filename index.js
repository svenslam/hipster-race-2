
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

const mountNode = document.getElementById('react-view');

if (mountNode) {
  try {
    const root = ReactDOM.createRoot(mountNode);

    const handleExit = () => {
      // Use the global navigation function from script.js
      if (window.showView) {
        window.showView('main-menu', true);
      } else {
        // Fallback logic
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
    console.log("React App Mounted Successfully");
  } catch (e) {
    console.error("React Render Error:", e);
    if (mountNode) mountNode.innerHTML = `<div style="color:white; padding:20px;">Er is een fout opgetreden bij het laden van de minigames.<br><small>${e.message}</small></div>`;
  }
} else {
  console.error("Could not find #react-view element");
}
