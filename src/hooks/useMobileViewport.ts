import { useEffect } from 'react';

// VisualViewport changes when many mobile browsers open the on-screen keyboard.
// Keep native page scrolling and zoom; only move the navigation out of the way.
export function useMobileViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty('--visible-viewport-height', `${height}px`);
      const active = document.activeElement;
      const editing = active instanceof HTMLElement && active.matches(
        'textarea, [contenteditable="true"], input:not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])'
      );
      const keyboard = Boolean(editing && viewport && viewport.scale <= 1.05 && window.innerHeight - height > 120);
      root.dataset.keyboardOpen = String(keyboard);
      if (keyboard && active instanceof HTMLElement) active.scrollIntoView({ block: 'nearest' });
    };
    const schedule = () => {cancelAnimationFrame(frame);frame = requestAnimationFrame(update);};
    update();
    viewport?.addEventListener('resize', schedule);
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      delete root.dataset.keyboardOpen;
      root.style.removeProperty('--visible-viewport-height');
    };
  }, []);
}
