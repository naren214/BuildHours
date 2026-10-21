import { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import Navigation from "./Navigation";
import { useAudioEngine } from "../hooks/useAudioEngine";
export default function AppShell() {
  const { pathname } = useLocation(),
    { engine, error } = useAudioEngine();
  useEffect(() => {
    engine.stop();
    window.scrollTo(0, 0);
  }, [pathname, engine]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navigation />
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      <main id="main" key={pathname}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>
          OPENAI STUDENT COLLECTIVE <b>·</b> buildHours
        </span>
        <span>Made to be played. Built to be changed.</span>
        <Link to="/extend">Your next idea starts here ↗</Link>
      </footer>
    </>
  );
}
