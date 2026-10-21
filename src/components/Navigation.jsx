import { NavLink, Link } from "react-router-dom";
import AudioStatus from "./AudioStatus";
export default function Navigation() {
  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label="Unheard home">
        <span className="brand-icon" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        UNHEARD
      </Link>
      <nav aria-label="Main navigation">
        {[
          ["/", "Home"],
          ["/instruments", "Instruments"],
          ["/studio", "Studio"],
          ["/extend", "Extend"],
        ].map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/"}>
            {label}
          </NavLink>
        ))}
      </nav>
      <AudioStatus />
    </header>
  );
}
