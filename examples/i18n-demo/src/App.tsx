import { Component, createSignal, createEffect } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "./translations";
import AppHeader from "./components/AppHeader";
import IntroSection from "./components/IntroSection";
import TranslationDemo from "./components/TranslationDemo";
import StatusSection from "./components/StatusSection";
import FeaturesSection from "./components/FeaturesSection";
import "./App.css";

const App: Component = () => {
  const { isRTL, locale } = useI18n();
  const [currentTime, setCurrentTime] = createSignal(new Date());

  // Update time every second
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div class="app" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader />

      <main class="main">
        <IntroSection />
        <TranslationDemo />
        <StatusSection currentTime={currentTime()} />
        <FeaturesSection />
      </main>

      <footer class="footer">
        <p>{getDemoTranslation(locale, "footer")}</p>
      </footer>
    </div>
  );
};

export default App;
