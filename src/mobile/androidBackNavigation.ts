type AndroidBackHandler = () => boolean;

type RegisteredHandler = {
  id: number;
  priority: number;
  handler: AndroidBackHandler;
};

let nextHandlerId = 1;
const handlers = new Map<number, RegisteredHandler>();

export function registerAndroidBackHandler(
  handler: AndroidBackHandler,
  priority = 0,
): () => void {
  const id = nextHandlerId++;
  handlers.set(id, { id, priority, handler });

  return () => {
    handlers.delete(id);
  };
}

export function handleAndroidBackButton(): boolean {
  const modal = document.querySelector<HTMLElement>(
    'dialog[open], [role="dialog"], [aria-modal="true"]',
  );

  if (modal) {
    const escapeEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      bubbles: true,
      cancelable: true,
    });
    modal.dispatchEvent(escapeEvent);
    return true;
  }

  const ordered = Array.from(handlers.values()).sort(
    (a, b) => b.priority - a.priority || b.id - a.id,
  );

  for (const entry of ordered) {
    try {
      if (entry.handler()) return true;
    } catch (error) {
      console.warn("Android back handler failed.", error);
    }
  }

  return false;
}
