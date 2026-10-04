import { useEffect, useRef } from "react";

/**
 * Keyboard behaviour for custom dialogs.
 *
 * Covers the four things a hand-rolled modal usually misses:
 *  1. Escape closes the dialog (WCAG 2.1.1 / 2.1.2).
 *  2. Focus moves into the dialog when it opens, so keyboard users are not
 *     left tabbing through the page behind it.
 *  3. Focus returns to the element that opened it on close.
 *  4. Background scroll is locked while the dialog is open.
 *
 * Pass the dialog container ref so focus has somewhere to land.
 */
export function useModalKeyboard<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  panelRef?: React.RefObject<T | null>,
) {
  // Remembers whatever had focus before the dialog opened.
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // Callers almost always pass an inline arrow (`onClose={() => setOpen(false)}`),
  // which is a NEW function identity on every render. Keeping it in a ref means
  // the effect depends only on `open`, so the effect does not re-run (and re-steal
  // focus) on every unrelated re-render of the parent.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog. Prefer an explicitly marked control
    // (e.g. the close button); otherwise focus the panel itself.
    const panel = panelRef?.current ?? null;
    const preferred = panel?.querySelector<HTMLElement>("[data-autofocus]");
    const fallback = panel?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (preferred ?? fallback ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Return focus to the trigger so keyboard users don't lose their place.
      restoreFocusRef.current?.focus?.();
    };
    // panelRef is a stable ref object; only `open` should re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

/** True when the event target is (or is inside) the panel — for backdrop clicks. */
export function isOutsideTarget(target: EventTarget | null, panel: HTMLElement | null): boolean {
  if (!panel || !(target instanceof Node)) return false;
  return !panel.contains(target);
}
