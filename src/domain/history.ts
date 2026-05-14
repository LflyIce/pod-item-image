import type { DesignProject } from './types';

export interface HistoryState {
  past: DesignProject[];
  present: DesignProject;
  future: DesignProject[];
}

export function createHistory(initial: DesignProject): HistoryState {
  return { past: [], present: initial, future: [] };
}

export function pushState(history: HistoryState, next: DesignProject): HistoryState {
  return {
    past: [...history.past, history.present].slice(-50),
    present: next,
    future: []
  };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future]
  };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1)
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}
