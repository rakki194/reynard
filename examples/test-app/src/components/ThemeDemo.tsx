import { Button, Card } from "reynard-components";
import { useTheme } from "reynard-core";

export function ThemeDemo() {
  const { theme, setTheme, nextTheme } = useTheme();

  return (
    <Card class="theme-demo-card">
      <h3 class="theme-demo-title">Theme Demo Component</h3>
      <p class="theme-demo-description">
        Current theme: <strong class="theme-demo-accent">{theme()}</strong>
      </p>
      <div class="theme-demo-buttons">
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={() => setTheme("gray")}>Gray</Button>
        <Button onClick={() => setTheme("banana")}>Banana</Button>
        <Button onClick={() => setTheme("strawberry")}>Strawberry</Button>
        <Button onClick={() => setTheme("peanut")}>Peanut</Button>
      </div>
      <Button onClick={nextTheme} class="theme-demo-next-button">Next Theme</Button>
    </Card>
  );
}
