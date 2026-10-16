/**
 * Global Scroll to Top Utility
 * Ensures that whenever navigating between screens, opening forms, 
 * saving check-ins, creating quotes, or viewing sales on mobile devices,
 * the viewport resets to the very top instead of staying stuck at the bottom.
 */
export function scrollToTop() {
  if (typeof window === 'undefined') return;

  // Immediate reset
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Reset all scrollable main containers
    const containers = document.querySelectorAll('main, [data-scroll-container], #root');
    containers.forEach((el) => {
      el.scrollTop = 0;
    });
  } catch (err) {
    // Fallback
    window.scrollTo(0, 0);
  }

  // Double check after next microtask / frame to beat any browser auto-scroll restoration
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  });
}
