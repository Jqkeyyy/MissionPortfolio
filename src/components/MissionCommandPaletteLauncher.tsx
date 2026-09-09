import { lazy, Suspense, useEffect, useState } from 'react';
import { RadioTower } from 'lucide-react';

const MissionCommandPalette = lazy(() => import('./MissionCommandPalette').then((module) => ({ default: module.MissionCommandPalette })));

export const MissionCommandPaletteLauncher = () => {
  const [loaded, setLoaded] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpenOnLoad(true);
        setLoaded(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loaded]);

  if (loaded) {
    return (
      <Suspense fallback={null}>
        <MissionCommandPalette initialOpen={openOnLoad} />
      </Suspense>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setOpenOnLoad(true);
        setLoaded(true);
      }}
      className="fixed bottom-4 left-4 z-[1100] hidden min-h-11 items-center gap-2 rounded-md border border-cyan-200/25 bg-[#06111a]/95 px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-cyan-100 shadow-xl backdrop-blur hover:border-cyan-200/55 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:inline-flex"
      aria-label="Open mission command palette"
    >
      <RadioTower aria-hidden="true" className="h-4 w-4" />
      Navigate
      <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-white/45">Ctrl K</kbd>
    </button>
  );
};
