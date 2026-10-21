import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getInstrument } from "../data/instrumentPresets";
import { scales } from "../data/scales";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { mapGesture } from "../utils/gestureMapping";
import { instrumentGestures } from "../utils/instrumentMusic";
import { noteName } from "../utils/music";
import InstrumentSelector from "../components/InstrumentSelector";
import ScaleSelector from "../components/ScaleSelector";
import TempoControl from "../components/TempoControl";
import TransportControls from "../components/TransportControls";
import TrackpadCanvas from "../components/TrackpadCanvas";
import ReactiveVisualizer from "../components/ReactiveVisualizer";
export default function StudioPage() {
  const [search, setSearch] = useSearchParams();
  const instrument = getInstrument(search.get("instrument"));
  const scale = scales[search.get("scale")]
    ? search.get("scale")
    : instrument.scale;
  const [tempo, setTempo] = useState(96),
    [allGestures, setGestures] = useState([]),
    [playing, setPlaying] = useState(false),
    [activeId, setActiveId] = useState(null),
    [dismissed, setDismissed] = useState(false),
    [message, setMessage] = useState("");
  const gestures = instrumentGestures(allGestures, instrument.id);
  const { engine, enabled, enable, reportError } = useAudioEngine();
  const previousId = useRef(instrument.id);
  const stop = () => {
    engine.stop();
    setPlaying(false);
    setActiveId(null);
  };
  useEffect(() => {
    if (previousId.current !== instrument.id) {
      stop();
      setMessage(
        `${instrument.name} selected. Playback uses only its own gestures.`,
      );
      previousId.current = instrument.id;
    }
  }, [instrument]);
  useEffect(() => () => engine.stop(), [engine]);
  useEffect(() => {
    if (!enabled && playing) {
      engine.stop();
      setPlaying(false);
      setActiveId(null);
    }
  }, [enabled, playing, engine]);
  const capture = (points) => {
    if (gestures.length >= 64) {
      setMessage(
        "Your field has 64 gestures. Clear it to start a new composition.",
      );
      return;
    }
    const event = mapGesture(points, instrument.id, scale);
    if (!event) return;
    setGestures((old) => [...old, event]);
    if (engine.enabled) {
      try {
        engine.sound(event);
        if (event.roll) {
          engine.later(() => engine.sound(event), 100);
          engine.later(() => engine.sound(event), 200);
        }
      } catch (err) {
        reportError(err);
      }
    }
    setMessage(
      enabled ? "" : "Gesture saved. Enable Audio, then press Play to hear it.",
    );
  };
  const play = () => {
    if (!enabled || !gestures.length) {
      setMessage(
        !enabled ? "Enable Audio before playback." : "Draw a gesture first.",
      );
      return;
    }
    setMessage("");
    setPlaying(
      engine.play(gestures, tempo, setActiveId, () => setPlaying(false)),
    );
  };
  const clear = () => {
    stop();
    setGestures((old) => old.filter((g) => g.instrument !== instrument.id));
    setDismissed(false);
    setMessage("Canvas cleared. A fresh beginning.");
  };
  const active = gestures.find((g) => g.id === activeId) || gestures.at(-1);
  return (
    <div className="page studio-page" style={{ "--accent": instrument.accent }}>
      <div className="page-heading studio-heading">
        <div>
          <p className="eyebrow">
            THE STUDIO <span> / </span> YOUR MUSICAL PLAYGROUND
          </p>
          <h1>
            Find your <em>frequency.</em>
          </h1>
        </div>
        <div className="studio-live">
          <span className="status-dot" /> ALL YOU NEED IS A LITTLE CURIOSITY
        </div>
      </div>
      <div className="studio-audio-check">
        <div>
          <strong>{enabled ? "Audio is on" : "Start with sound"}</strong>
          <p>
            {enabled
              ? "Use Test sound to check your speakers. Draw, then release to hear each stroke."
              : "Enable audio and listen for three notes before you draw."}
          </p>
        </div>
        <button
          className="button button-accent"
          onClick={async () => {
            if (await enable()) {
              try {
                engine.preview(instrument.id, scale);
                setMessage(
                  "Playing three test notes. If silent, check the browser tab’s mute setting and your output device.",
                );
              } catch (err) {
                reportError(err);
              }
            }
          }}
        >
          {enabled ? "Test sound" : "Enable Audio"}{" "}
          <span aria-hidden="true">♪</span>
        </button>
      </div>
      <InstrumentSelector
        value={instrument.id}
        onChange={(id) => {
          stop();
          setSearch({ instrument: id });
        }}
      />
      <div className="studio-workspace">
        <section className="studio-main" aria-label="Gesture instrument">
          <div className="studio-toolbar">
            <div className="selected-voice">
              <span className="instrument-dot" />
              <strong>{instrument.name}</strong>
              <span>{instrument.category}</span>
            </div>
            <div className="note-display" aria-live="polite">
              {active
                ? active.instrument === "tabla"
                  ? active.voice.toUpperCase()
                  : noteName(active.pitch)
                : "—"}
              <small>CURRENT SOUND</small>
            </div>
            <ReactiveVisualizer />
          </div>
          <TrackpadCanvas
            gestures={gestures}
            instrument={instrument}
            activeId={activeId}
            onGesture={capture}
            onDrawStart={stop}
            enabled={enabled}
            dismissed={dismissed}
            onDismiss={() => setDismissed(true)}
          />
          <div className="studio-bottom">
            <TransportControls
              playing={playing}
              onPlay={play}
              onStop={stop}
              onClear={clear}
              hasGestures={!!gestures.length}
              enabled={enabled}
            />
            <span className="gesture-count">
              {String(gestures.length).padStart(2, "0")} <span>GESTURES</span>
            </span>
          </div>
        </section>
        <aside className="studio-settings">
          <p className="eyebrow">MAKE IT YOURS</p>
          <ScaleSelector
            value={scale}
            onChange={(value) =>
              setSearch({ instrument: instrument.id, scale: value })
            }
          />
          {scale === "indianPentatonic" && (
            <p className="scale-note">{scales[scale].description}</p>
          )}
          <TempoControl value={tempo} onChange={setTempo} />
          <div className="how-to">
            <span className="eyebrow">A LITTLE DIRECTION</span>
            <p>{instrument.gesture}</p>
            <dl>
              <div>
                <dt>Height</dt>
                <dd>Pitch ↕</dd>
              </div>
              <div>
                <dt>Length</dt>
                <dd>Duration ↔</dd>
              </div>
              <div>
                <dt>Speed</dt>
                <dd>Expression ↗</dd>
              </div>
            </dl>
          </div>
          <p className="settings-note">
            {instrument.id === "tabla"
              ? "Fixed low, high, and rim voices. "
              : `${noteName(instrument.tuning.min)}–${noteName(instrument.tuning.max)} · A4 = 440 Hz. `}
            Each instrument has its own strokes. New scale settings shape your
            next gesture.
          </p>
        </aside>
      </div>
      <div id="canvas-guidance" className="studio-guidance">
        <span>↗</span>
        <p>
          Draw a line. Its height becomes pitch, its length becomes time, and
          its movement becomes expression.
        </p>
      </div>
      <p className="studio-message" role="status">
        {message ||
          (playing
            ? "Playing your gestures in drawing order."
            : !enabled
              ? "Audio is off. Enable Audio above to listen; you can already draw."
              : "Sound is on. Draw a gesture or play your composition.")}
      </p>
    </div>
  );
}
