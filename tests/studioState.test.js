import test from "node:test";
import assert from "node:assert/strict";
import {
  canRedo,
  canUndo,
  createStudioState,
  studioReducer,
} from "../src/utils/studioState.js";
import {
  loadStudioComposition,
  saveStudioComposition,
  STUDIO_STORAGE_KEY,
} from "../src/utils/studioPersistence.js";

const gesture = (id, instrument = "sitar") => ({
  id,
  instrument,
  scale: "majorPentatonic",
  pitch: 60,
  duration: 1,
  intensity: 0.5,
  pan: 0,
  voice: "dayan",
  roll: false,
  createdAt: 1000,
  points: [{ x: 0.5, y: 0.5, time: 0, velocity: 0 }],
});

const bank = (state, instrument) =>
  state.gestures.filter((item) => item.instrument === instrument);

test("undo and redo restore draw and clear edits independently per instrument", () => {
  let state = createStudioState();
  state = studioReducer(state, { type: "add", gesture: gesture("sitar-1") });
  state = studioReducer(state, {
    type: "add",
    gesture: gesture("guitar-1", "guitar"),
  });
  assert.equal(canUndo(state, "sitar"), true);
  assert.equal(canUndo(state, "guitar"), true);

  state = studioReducer(state, { type: "clear", instrument: "sitar" });
  assert.deepEqual(bank(state, "sitar"), []);
  assert.deepEqual(bank(state, "guitar").map(({ id }) => id), ["guitar-1"]);
  state = studioReducer(state, { type: "undo", instrument: "sitar" });
  assert.deepEqual(bank(state, "sitar").map(({ id }) => id), ["sitar-1"]);
  state = studioReducer(state, { type: "redo", instrument: "sitar" });
  assert.deepEqual(bank(state, "sitar"), []);
  assert.equal(canRedo(state, "sitar"), false);
  assert.equal(canUndo(state, "guitar"), true);
});

test("a new edit after undo clears only that instrument's redo history", () => {
  let state = createStudioState();
  state = studioReducer(state, { type: "add", gesture: gesture("one") });
  state = studioReducer(state, { type: "undo", instrument: "sitar" });
  assert.equal(canRedo(state, "sitar"), true);
  state = studioReducer(state, { type: "add", gesture: gesture("two") });
  assert.equal(canRedo(state, "sitar"), false);
  assert.deepEqual(bank(state, "sitar").map(({ id }) => id), ["two"]);
});

test("history is bounded to 64 edits and tempo stays within the Studio range", () => {
  let state = createStudioState();
  for (let i = 0; i < 66; i++)
    state = studioReducer(state, { type: "add", gesture: gesture(`g-${i}`) });
  assert.equal(state.history.sitar.past.length, 64);
  state = studioReducer(state, { type: "tempo", tempo: 132 });
  assert.equal(state.tempo, 132);
  assert.equal(studioReducer(state, { type: "tempo", tempo: 200 }).tempo, 132);
});

test("composition saves and restores gesture banks and tempo", () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const composition = {
    gestures: [gesture("sitar-1"), gesture("tabla-1", "tabla")],
    tempo: 123,
  };
  assert.equal(saveStudioComposition(composition, storage), true);
  assert.deepEqual(loadStudioComposition(storage), {
    ...composition,
    status: "restored",
  });
  assert.equal(JSON.parse(data.get(STUDIO_STORAGE_KEY)).version, 1);
});

test("invalid or unavailable saved data falls back to an empty composition", () => {
  const invalidStorage = {
    getItem: () => "{not json",
    setItem: () => {},
  };
  assert.deepEqual(loadStudioComposition(invalidStorage), {
    gestures: [],
    tempo: 96,
    status: "invalid",
  });

  const unavailableStorage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  assert.deepEqual(loadStudioComposition(unavailableStorage), {
    gestures: [],
    tempo: 96,
    status: "unavailable",
  });
  assert.equal(
    saveStudioComposition({ gestures: [], tempo: 96 }, unavailableStorage),
    false,
  );
});

test("malformed gesture payloads are rejected instead of entering the Studio", () => {
  const storage = {
    getItem: () => JSON.stringify({
      version: 1,
      tempo: 96,
      gestures: [
        {
          ...gesture("broken"),
          points: [{ x: 4, y: 0.5, time: 0, velocity: 0 }],
        },
      ],
    }),
  };
  assert.equal(loadStudioComposition(storage).status, "invalid");
});
