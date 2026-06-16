import { useCallback } from "react";

/**
 * Scrolls the page to the first form field that has an error.
 *
 * Usage:
 *   Add `data-field-id="fieldName"` to each form field wrapper div.
 *   Call `scrollToFirstError(errors)` after setting errors.
 */
export function useScrollToError() {
  const scrollToFirstError = useCallback((errors: Record<string, string>) => {
    const keys = Object.keys(errors);
    if (keys.length === 0) return;

    for (const key of keys) {
      const el = document.querySelector(`[data-field-id="${key}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Try to focus the first input/select/textarea inside
        const input = el.querySelector<HTMLElement>("input, select, textarea");
        if (input) setTimeout(() => input.focus(), 400);
        return;
      }
    }
  }, []);

  return { scrollToFirstError };
}
