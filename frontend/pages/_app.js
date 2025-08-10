import '../styles/globals.css';
import { useState, useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(true);
  useEffect(()=> {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);
  return (
    <div className={dark? 'dark bg-neutral-950 min-h-screen' : 'bg-white min-h-screen'}>
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <h1 className="text-2xl font-bold text-brand">LiveStreamX</h1>
        <div className="flex items-center gap-3">
          <button onClick={()=>setDark(!dark)} className="px-3 py-1 rounded bg-neutral-800 text-sm hover:bg-neutral-700">{dark? 'Light':'Dark'} Mode</button>
        </div>
      </header>
      <main className="p-6">
        <Component {...pageProps} />
      </main>
      <footer className="text-center text-xs py-4 text-neutral-500">&copy; 2025 LiveStreamX</footer>
    </div>
  );
}
