import { useEffect, useState } from 'react';
import { ALL_PAGES, NAV_ITEMS } from './lib/constants';
import { useRoute } from './lib/router';
import { useApp } from './store';
import Onboarding from './components/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Schedule from './pages/Schedule.jsx';
import Emotions from './pages/Emotions.jsx';
import Communication from './pages/Communication.jsx';
import Calm from './pages/Calm.jsx';
import Progress from './pages/Progress.jsx';
import Goals from './pages/Goals.jsx';
import Meals from './pages/Meals.jsx';
import Sleep from './pages/Sleep.jsx';
import Settings from './pages/Settings.jsx';

const ROUTES = {
  accueil: Dashboard,
  programme: Schedule,
  emotions: Emotions,
  communication: Communication,
  calme: Calm,
  progres: Progress,
  objectifs: Goals,
  repas: Meals,
  sommeil: Sleep,
  parametres: Settings,
};

function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return 'unavailable';
    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch {
      return 'unavailable';
    }
  };

  return { canInstall: Boolean(promptEvent), installed, install };
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-emoji" aria-hidden="true">
        🌈
      </span>
      <div>
        <div className="brand-name">AutiColor</div>
        <div className="brand-tag">Mon quotidien en douceur</div>
      </div>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const { settings, updateSettings, feedback, profile } = useApp();
  const installState = useInstallPrompt();
  const Page = ROUTES[route] || Dashboard;
  const current = ALL_PAGES.find((page) => page.path === route) || ALL_PAGES[0];
  const isHome = route === 'accueil';

  useEffect(() => {
    document.title = isHome ? 'AutiColor 🌈 — mon quotidien en douceur' : `${current.label} · AutiColor`;
  }, [isHome, current.label]);

  return (
    <div className="app">
      <nav className="sidebar" aria-label="Navigation principale">
        <Brand />
        {ALL_PAGES.map((item) => (
          <a
            key={item.path}
            className={`nav-link ${route === item.path ? 'active' : ''}`}
            href={`#/${item.path}`}
            aria-current={route === item.path ? 'page' : undefined}
          >
            <span className="nav-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            {item.label}
          </a>
        ))}
        <p className="tiny" style={{ marginTop: 'auto', padding: '0 0.5rem' }}>
          Tes données restent sur ton appareil 🔒
        </p>
      </nav>

      <div className="app-main">
        <header className="topbar">
          {isHome ? (
            <span className="icon-btn" aria-hidden="true">
              🌈
            </span>
          ) : (
            <a className="icon-btn" href="#/accueil" aria-label="Retour à l'accueil">
              ⬅️
            </a>
          )}
          <div className="topbar-title">
            <strong>{isHome ? 'AutiColor' : current.label}</strong>
            <span>{isHome ? 'Mon quotidien en douceur' : 'AutiColor'}</span>
          </div>
          <button
            type="button"
            className={`icon-btn ${settings.calmMode ? 'active' : ''}`}
            onClick={() => {
              updateSettings({ calmMode: !settings.calmMode });
              feedback('soft');
            }}
            aria-pressed={settings.calmMode}
            title={settings.calmMode ? 'Désactiver le mode calme' : 'Activer le mode calme'}
            aria-label={settings.calmMode ? 'Désactiver le mode calme' : 'Activer le mode calme'}
          >
            🧸
          </button>
          <a
            className={`icon-btn ${route === 'parametres' ? 'active' : ''}`}
            href="#/parametres"
            aria-label="Paramètres"
            title="Paramètres"
          >
            ⚙️
          </a>
        </header>

        <main className="page" key={route}>
          <Page installState={installState} />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Navigation rapide">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.path}
            href={`#/${item.path}`}
            className={route === item.path ? 'active' : ''}
            aria-current={route === item.path ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.emoji}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {profile?.onboarded ? null : <Onboarding />}
    </div>
  );
}
