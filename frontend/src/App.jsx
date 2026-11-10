import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import StudyList from './components/StudyList';
import Viewer from './components/Viewer';
import AnalysisPanel from './components/AnalysisPanel';
import { useStore } from './lib/store';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('medos-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('medos-theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const study = useStore((s) => s.studies.find((x) => x.id === s.selectedId) || null);
  const loadSample = useStore((s) => s.loadSample);
  const [highlight, setHighlight] = useState(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('sample')) loadSample();
  }, [loadSample]);

  return (
    <div className="flex h-full flex-col">
      <TopBar theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex min-h-0 flex-1">
        <StudyList />
        <Viewer key={study?.id ?? 'none'} study={study} highlight={highlight} />
        <AnalysisPanel study={study} highlight={highlight} onHighlight={setHighlight} />
      </main>
    </div>
  );
}
