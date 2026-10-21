const HISTORY_LIMIT = 64;

const bankGestures = (gestures, instrument) =>
  gestures.filter((gesture) => gesture.instrument === instrument);

const replaceBank = (gestures, instrument, nextBank) => [
  ...gestures.filter((gesture) => gesture.instrument !== instrument),
  ...nextBank,
];

const historyFor = (state, instrument) =>
  state.history[instrument] || { past: [], future: [] };

function commitBank(state, instrument, nextBank) {
  const current = bankGestures(state.gestures, instrument);
  const unchanged =
    current.length === nextBank.length &&
    current.every((item, index) => item === nextBank[index]);
  if (unchanged) return state;

  const history = historyFor(state, instrument);
  return {
    ...state,
    gestures: replaceBank(state.gestures, instrument, nextBank),
    history: {
      ...state.history,
      [instrument]: {
        past: [...history.past, current].slice(-HISTORY_LIMIT),
        future: [],
      },
    },
  };
}

export function createStudioState(saved = {}) {
  const gestures = Array.isArray(saved.gestures) ? saved.gestures : [];
  const tempo = Number.isInteger(saved.tempo) ? saved.tempo : 96;
  return { gestures, tempo, history: {} };
}

export function studioReducer(state, action) {
  switch (action.type) {
    case "add": {
      const current = bankGestures(state.gestures, action.gesture.instrument);
      if (current.length >= 64) return state;
      return commitBank(state, action.gesture.instrument, [
        ...current,
        action.gesture,
      ]);
    }
    case "clear":
      return commitBank(state, action.instrument, []);
    case "undo": {
      const history = historyFor(state, action.instrument);
      if (!history.past.length) return state;
      const current = bankGestures(state.gestures, action.instrument);
      const previous = history.past.at(-1);
      return {
        ...state,
        gestures: replaceBank(state.gestures, action.instrument, previous),
        history: {
          ...state.history,
          [action.instrument]: {
            past: history.past.slice(0, -1),
            future: [current, ...history.future],
          },
        },
      };
    }
    case "redo": {
      const history = historyFor(state, action.instrument);
      if (!history.future.length) return state;
      const current = bankGestures(state.gestures, action.instrument);
      const next = history.future[0];
      return {
        ...state,
        gestures: replaceBank(state.gestures, action.instrument, next),
        history: {
          ...state.history,
          [action.instrument]: {
            past: [...history.past, current].slice(-HISTORY_LIMIT),
            future: history.future.slice(1),
          },
        },
      };
    }
    case "tempo":
      if (
        !Number.isInteger(action.tempo) ||
        action.tempo < 40 ||
        action.tempo > 180
      )
        return state;
      return { ...state, tempo: action.tempo };
    default:
      return state;
  }
}

export function canUndo(state, instrument) {
  return historyFor(state, instrument).past.length > 0;
}

export function canRedo(state, instrument) {
  return historyFor(state, instrument).future.length > 0;
}
