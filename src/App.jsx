import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AudioProvider } from "./hooks/useAudioEngine";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import InstrumentsPage from "./pages/InstrumentsPage";
import StudioPage from "./pages/StudioPage";
import ExtendPage from "./pages/ExtendPage";
export default function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="instruments" element={<InstrumentsPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="extend" element={<ExtendPage />} />
            <Route
              path="*"
              element={
                <div className="page not-found">
                  <p className="eyebrow">OFF THE SCORE / 404</p>
                  <h1>
                    A little lost
                    <br />
                    in the music.
                  </h1>
                  <Link className="button button-ivory" to="/">
                    Return home ↗
                  </Link>
                </div>
              }
            />
          </Route>
        </Routes>
      </AudioProvider>
    </BrowserRouter>
  );
}
