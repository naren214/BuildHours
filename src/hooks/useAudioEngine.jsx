import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
const Context = createContext(null);
export function AudioProvider({ children }) {
  const ref = useRef(null);
  if (!ref.current) ref.current = new AudioEngine();
  const engine = ref.current;
  const [enabled, setEnabled] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const sync = () => setEnabled(engine.enabled);
    const unsubscribe = engine.subscribe(sync);
    return () => {
      unsubscribe();
      engine.dispose();
    };
  }, [engine]);
  const enable = async () => {
    try {
      await engine.enable();
      setEnabled(true);
      setError("");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  return (
    <Context.Provider
      value={{
        engine,
        enabled,
        error,
        enable,
        reportError: (err) => setError(err.message || String(err)),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAudioEngine = () => useContext(Context);
