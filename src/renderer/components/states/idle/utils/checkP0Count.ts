export function checkP0Count(): number {
  try {
    const raw = localStorage.getItem('eIsland_todos');
    if (!raw) return 0;
    const todos = JSON.parse(raw) as { done?: boolean; priority?: string }[];
    return todos.filter(t => !t.done && t.priority === 'P0').length;
  } catch { return 0; }
}
