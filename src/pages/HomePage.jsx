import { Link } from "react-router-dom";
import HeroField from "../components/HeroField";
export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-sun" aria-hidden="true">
              ✳
            </span>{" "}
            OPENAI STUDENT COLLECTIVE <span>·</span> buildHours
          </p>
          <h1>
            Turn
            <br />
            movement
            <br />
            into <em>music.</em>
          </h1>
          <p className="hero-description">
            Draw with your trackpad. Shape a sound.
            <br />
            Build an instrument that is entirely yours.
          </p>
          <div className="hero-actions">
            <Link to="/studio" className="button button-ivory">
              Enter the Studio <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/instruments" className="text-link">
              Explore Instruments <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="hero-note">
            <span className="status-dot" /> NO EXPERIENCE NEEDED. JUST A
            TRACKPAD.
          </p>
        </div>
        <HeroField />
      </section>
      <div className="workshop-attribution">
        <span className="eyebrow">A buildHours EXPERIENCE</span>
        <p>
          Microsoft Innovation Club <span>×</span>
          <br className="mobile-break" /> VIT Chennai Office of Student Welfare
        </p>
        <span className="attribution-mark" aria-hidden="true">
          ↗
        </span>
      </div>
      <section className="home-discover">
        <div>
          <p className="eyebrow">LESS THEORY. MORE FEELING.</p>
          <h2>
            You already have
            <br />
            an instrument.
            <br />
            <em>You’re touching it.</em>
          </h2>
        </div>
        <div className="discover-content">
          <p>
            Your trackpad is a blank score. A line becomes a melody. A tap
            becomes a beat. A small experiment becomes something only you could
            make.
          </p>
          <div className="home-steps">
            <div>
              <b>01</b>
              <span>
                Choose a voice
                <small>Six personalities. Endless possibilities.</small>
              </span>
            </div>
            <div>
              <b>02</b>
              <span>
                Make a movement
                <small>Draw, tap, sweep. Trust your curiosity.</small>
              </span>
            </div>
            <div>
              <b>03</b>
              <span>
                Make it yours<small>Open the code. Change the rules.</small>
              </span>
            </div>
          </div>
          <Link to="/instruments" className="text-link">
            Meet your instruments ↗
          </Link>
        </div>
      </section>
      <div className="home-ribbon">
        <span>DRAW.</span>
        <span>LISTEN.</span>
        <span>CHANGE THE RULES.</span>
        <span aria-hidden="true">✳</span>
      </div>
    </div>
  );
}
