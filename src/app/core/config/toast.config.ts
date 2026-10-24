import { provideHotToastConfig } from '@ngxpert/hot-toast';

// Urban Thread look: white card, red text and accent bar (same red as the form errors),
// slides in from the bottom, with a visible close button.
// Needs --ut-error from styles.css (the fallback value is used if it is missing).
export const urbanThreadToast = provideHotToastConfig({
  position: 'bottom-center',        // appears from the lower edge of the screen
  dismissible: true,                // shows the close (x) button
  className: 'ut-toast',            // hook for extra CSS in styles.css if you want it
  style: {
    background: '#fff',
    color: 'var(--ut-error, #D92D20)',
    borderLeft: '4px solid var(--ut-error, #D92D20)',
    borderRight: '4px solid var(--ut-error, #D92D20)',
    borderRadius: '0.5rem',
    padding: '0.875rem 1rem',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '0.8125rem',
    fontWeight: '500',
    letterSpacing: '0.02em',
    boxShadow: '0 8px 24px rgba(13, 13, 13, 0.18)',
  },
  closeStyle: {
    color: 'var(--ut-error, #D92D20)',
    cursor: 'pointer',
  },
});