import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

// Minimize button
document
.getElementById('titlebar-minimize')
?.addEventListener('click', () => appWindow.minimize());

// Maximize button
document
.getElementById('titlebar-maximize')
?.addEventListener('click', () => appWindow.toggleMaximize());



// Close button
document
.getElementById('titlebar-close')
?.addEventListener('click', () => appWindow.close());

// Handle titlebar dragging and maximize on double-click
document.getElementById('titlebar')?.addEventListener('mousedown', (e) => {
  if (e.buttons === 1) { // Left button
    e.detail === 2
    ? appWindow.toggleMaximize() // Maximize on double-click
    : appWindow.startDragging(); // Start dragging
  }
});

import { useEffect } from "react";
export function Touch() {
  useEffect(() => {
    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();
    };
    
    document.addEventListener("contextmenu", handleRightClick);
    
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);
  
  return null; // or return any UI you'd like to render
}
