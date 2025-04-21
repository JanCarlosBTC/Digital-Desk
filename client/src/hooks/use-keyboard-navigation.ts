import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onNavigate?: (direction: 'next' | 'prev') => void;
  onSelect?: () => void;
  onEscape?: () => void;
  focusableSelector?: string;
  scrollIntoView?: boolean;
  scrollOptions?: ScrollIntoViewOptions;
}

export const useKeyboardNavigation = ({
  onNavigate,
  onSelect,
  onEscape,
  focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  scrollIntoView = true,
  scrollOptions = { behavior: 'smooth', block: 'nearest' },
}: KeyboardNavigationOptions = {}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;
    focusableElementsRef.current = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    );
  }, [focusableSelector]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current || focusableElementsRef.current.length === 0) return;

      const activeElement = document.activeElement;
      const currentIndex = focusableElementsRef.current.indexOf(activeElement as HTMLElement);

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableElementsRef.current.length;
          const nextElement = focusableElementsRef.current[nextIndex];
          nextElement.focus();
          if (scrollIntoView) {
            nextElement.scrollIntoView(scrollOptions);
          }
          onNavigate?.('next');
          break;
        }

        case 'ArrowUp':
        case 'ArrowLeft': {
          event.preventDefault();
          const prevIndex =
            currentIndex === -1
              ? focusableElementsRef.current.length - 1
              : (currentIndex - 1 + focusableElementsRef.current.length) %
                focusableElementsRef.current.length;
          const prevElement = focusableElementsRef.current[prevIndex];
          prevElement.focus();
          if (scrollIntoView) {
            prevElement.scrollIntoView(scrollOptions);
          }
          onNavigate?.('prev');
          break;
        }

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeElement && focusableElementsRef.current.includes(activeElement as HTMLElement)) {
            onSelect?.();
          }
          break;

        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
      }
    },
    [onNavigate, onSelect, onEscape, scrollIntoView, scrollOptions]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateFocusableElements();
    container.addEventListener('keydown', handleKeyDown);

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'hidden'],
    });

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [handleKeyDown, updateFocusableElements]);

  const focusFirst = useCallback(() => {
    if (focusableElementsRef.current.length > 0) {
      focusableElementsRef.current[0].focus();
      if (scrollIntoView) {
        focusableElementsRef.current[0].scrollIntoView(scrollOptions);
      }
    }
  }, [scrollIntoView, scrollOptions]);

  const focusLast = useCallback(() => {
    if (focusableElementsRef.current.length > 0) {
      const lastElement = focusableElementsRef.current[focusableElementsRef.current.length - 1];
      lastElement.focus();
      if (scrollIntoView) {
        lastElement.scrollIntoView(scrollOptions);
      }
    }
  }, [scrollIntoView, scrollOptions]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    updateFocusableElements,
  };
}; 