import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

/**
 * Keyboard behaviour for custom dialogs.
 *
 * Covers what a hand-rolled modal usually gets wrong:
 *  1. Escape closes the dialog (WCAG 2.1.1).
 *  2. Focus moves into the dialog on open.
 *  3. Focus is TRAPPED inside the dialog — Tab and Shift+Tab cycle within it,
 *     so keyboard users cannot tab into the inert page behind and lose their
 *     place (WCAG 2.4.3, 2.4.7).
 *  4. Focus returns to the triggering element on close.
 *  5. Background scroll is locked.
 *  6. A dialog containing no focusable elements at all still traps focus on
 *     itself, rather than silently releasing the user to the page behind.
 *
 * Pass the dialog panel ref so the trap has a boundary to work within.
 */
export function useModalKeyboard<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  panelRef?: React.RefObject<T | null>,
) {
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // Callers almost always pass an inline arrow, which is a new function
  // identity every render. Keeping it in a ref means the effect depends only
  // on `open`, so focus is not stolen on every unrelated re-render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef?.current ?? null;

    // Move focus in. Prefer an explicitly marked control, else the first
    // focusable descendant, else the panel itself.
    const preferred = panel?.querySelector<HTMLElement>("[data-autofocus]");
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (preferred ?? firstFocusable ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab") return;

      const container = panelRef?.current;
      // No boundary known, or nothing focusable inside: keep focus on the
      // dialog rather than letting it escape to the page behind.
      if (!container) return;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (el) =>
          el.offsetParent !== null ||
          el === document.activeElement, // offsetParent is null for fixed/hidden edge cases
      );

      if (items.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        // Shift+Tab on the first item wraps to the last.
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        // Tab on the last item wraps to the first.
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
    // panelRef is a stable ref object; only `open` should re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
