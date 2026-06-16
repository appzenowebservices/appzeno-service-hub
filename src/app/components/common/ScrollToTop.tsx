// src/components/common/ScrollToTop.tsx
// Har route change par page top pe scroll karta hai automatically.
// Usage: App.tsx mein <BrowserRouter> ke andar sirf ek baar add karo.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Browser ke automatic scroll restoration ko disable karo
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Har route change par top pe jaao
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
