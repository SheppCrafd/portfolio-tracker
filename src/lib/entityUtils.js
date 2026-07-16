// Small generic helpers shared across the entity hooks and destructive UI actions.

export function excludeSoftDeleted(items = []) {
  return items.filter((item) => !item.deleted_at);
}

export function confirmThen(message, action) {
  if (window.confirm(message)) action();
}
