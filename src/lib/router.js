import { useEffect, useState } from 'react';

const DEFAULT_ROUTE = 'accueil';

function readRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  return raw || DEFAULT_ROUTE;
}

export function navigate(path) {
  const target = `#/${path}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
