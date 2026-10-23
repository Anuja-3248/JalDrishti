import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard">(() => {
    if (
      window.location.hash.includes("dashboard") ||
      window.location.pathname.startsWith("/dashboard")
    ) {
      return "dashboard";
    }
    return "landing";
  });

  useEffect(() => {
    function handleHashChange() {
      if (
        window.location.hash.includes("dashboard") ||
        window.location.pathname.startsWith("/dashboard")
      ) {
        setView("dashboard");
      } else {
        setView("landing");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  function handleNavigateToDashboard() {
    setView("dashboard");
    window.location.hash = "dashboard";
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleNavigateToHome() {
    setView("landing");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <>
      {view === "landing" ? (
        <LandingPage onLaunchDashboard={handleNavigateToDashboard} />
      ) : (
        <Dashboard onNavigateHome={handleNavigateToHome} />
      )}
    </>
  );
}
