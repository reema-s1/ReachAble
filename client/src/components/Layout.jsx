import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SkipLink from './SkipLink.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

// APG guidance + WCAG 2.4.3 (Focus Order): on every route change, move focus
// to the new page's main landmark so screen reader users land on new content
// instead of keeping focus on a now-stale nav link (the classic SPA bug).
export default function Layout({ children }) {
  const mainRef = useRef(null);
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (location.state && location.state.background) return;
    const main = mainRef.current;
    if (!main) return;
    const heading = main.querySelector('h1');
    const target = heading || main;
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus();
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <SkipLink />
      <Header />
      <main id="main-content" ref={mainRef}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
