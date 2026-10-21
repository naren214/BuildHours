import { Link } from "react-router-dom";
import WorkshopChallenge from "../components/WorkshopChallenge";
const paths = [
  {
    title: "Give it a new voice.",
    subtitle: "Add or modify an instrument",
    file: "src/data/instrumentPresets.js",
    text: "Duplicate a preset, choose a unique id, and tune its attack, decay, and resonance. The selector and collection update automatically.",
    code: "synthesis: {\n  type: 'plucked',\n  attack: 0.01,\n  decay: 1.2,\n  resonance: 0.25\n}",
    extra:
      "For a completely new sound, add a synthesis type in src/audio/instruments.js. Keep gain envelopes and node cleanup.",
  },
  {
    title: "Rewrite the relationship.",
    subtitle: "Change the gesture-to-sound mapping",
    file: "src/utils/gestureMapping.js",
    text: "What if moving right made a sound brighter? Keep normalized coordinates between 0 and 1 and clamp every output.",
    code: "// Try horizontal movement → intensity\nintensity: clamp(avgX, 0.3, 0.95),",
    extra:
      "Add new rules here, then pass their values into the audio voice. Horizontal position already controls stereo pan.",
  },
  {
    title: "Make the sound visible.",
    subtitle: "Create a new colour and animation identity",
    file: "src/data/instrumentPresets.js",
    text: "Choose an accent and a visual type. Change the mark, the motion, or the whole mood.",
    code: "accent: '#35b6a9',\nvisuals: {\n  type: 'ribbons',\n  trailWidth: 5\n}",
    extra:
      "Add a rendering branch in src/utils/canvas.js and a collection motif in src/components/InstrumentMotif.jsx. Respect reduced motion.",
  },
  {
    title: "Invent a musical rule.",
    subtitle: "Add a new scale or musical behaviour",
    file: "src/data/scales.js",
    text: "A scale is a set of semitone offsets from a root note. A small change can open a completely different world.",
    code: "myScale: {\n  name: 'My bright little scale',\n  notes: [0, 2, 5, 7, 9]\n}",
    extra:
      "Try fewer notes, a different root in gestureMapping.js, or a new rhythm. Scale options appear automatically.",
  },
];
export default function ExtendPage() {
  return (
    <div className="page extend-page">
      <div className="page-heading">
        <p className="eyebrow">
          THE WORKSHOP <span>/</span> YOUR NEXT BUILD
        </p>
        <h1>
          The best feature?
          <br />
          <em>You haven’t built it yet.</em>
        </h1>
        <p>This is a starting point. Take it somewhere unexpected.</p>
      </div>
      <section className="extension-paths" aria-label="Customization paths">
        {paths.map((path, i) => (
          <article className="extension-path" key={path.title}>
            <span className="path-number">0{i + 1}</span>
            <div>
              <p className="eyebrow">{path.subtitle}</p>
              <h2>{path.title}</h2>
              <p>{path.text}</p>
              <code className="file-path">{path.file}</code>
              <pre>
                <code>{path.code}</code>
              </pre>
              <p className="path-extra">{path.extra}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="challenge-section">
        <p className="eyebrow">PICK YOUR LEVEL. PUSH IT A LITTLE.</p>
        <h2>
          Small changes. <em>Big possibilities.</em>
        </h2>
        <div className="challenge-grid">
          <WorkshopChallenge
            number="01"
            level="Beginner"
            title="Change the feeling."
          >
            Change one instrument’s colour and scale. Draw the same gesture
            before and after. What feels different?
          </WorkshopChallenge>
          <WorkshopChallenge
            number="02"
            level="Builder"
            title="Make a seventh voice."
          >
            Combine existing synthesis types and invent a visual identity. Give
            your instrument a name and a gesture rule.
          </WorkshopChallenge>
          <WorkshopChallenge
            number="03"
            level="Explorer"
            title="Break your own rules."
          >
            Turn direction changes into rhythm, or horizontal movement into a
            filter sweep. Keep the result musical and the volume safe.
          </WorkshopChallenge>
        </div>
      </section>
      <section className="ai-build">
        <div>
          <p className="eyebrow">A COLLABORATOR IN YOUR CORNER</p>
          <h2>
            Bring your idea.
            <br />
            <em>Build with AI.</em>
          </h2>
          <p>
            Use ChatGPT to clarify the idea and understand the code. Use Codex
            to implement a small change, run the build, test it, and repair what
            breaks. No API key or AI service is needed to run this app.
          </p>
        </div>
        <blockquote>
          “Help me make the Bansuri brighter as I move right. Explain the
          mapping, change one thing at a time, and show me how to test it.”
          <span>A GOOD PROMPT STARTS WITH CURIOSITY.</span>
        </blockquote>
      </section>
      <section className="final-challenge">
        <span aria-hidden="true">✳</span>
        <p className="eyebrow">YOUR FINAL CHALLENGE</p>
        <h2>
          Make the instrument respond
          <br />
          in a way nobody else’s does.
        </h2>
        <Link to="/studio" className="button button-ivory">
          Back to your playground ↗
        </Link>
      </section>
    </div>
  );
}
