import { createSignal, createEffect, For } from "solid-js";
import { Button, Card, TextField } from "reynard-components";
import { 
  useLocalStorage, 
  useDebounce, 
  useMediaQuery,
  formatDateTime,
  formatNumber,
  formatCurrency,
  isValidEmail,
  isValidUrl
} from "reynard-core";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

export function CoreDemo() {
  const { theme, setTheme } = useTheme();
  
  // LocalStorage demo
  const [counter, setCounter, removeCounter] = useLocalStorage("demo-counter", { defaultValue: 0 });
  const [userName, setUserName] = useLocalStorage("demo-username", { defaultValue: "" });
  const [preferences, setPreferences] = useLocalStorage("demo-preferences", {
    defaultValue: {
      notifications: true,
      theme: "light",
      language: "en"
    }
  });

  // Debounce demo
  const [searchTerm, setSearchTerm] = createSignal("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Media query demo
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  // Validation demo
  const [email, setEmail] = createSignal("");
  const [url, setUrl] = createSignal("");
  const [emailError, setEmailError] = createSignal("");
  const [urlError, setUrlError] = createSignal("");

  // Formatting demo
  const [number, setNumber] = createSignal(1234.56);
  const [currency, setCurrency] = createSignal(99.99);

  // Create effect for validation
  createEffect(() => {
    const emailValue = email();
    if (emailValue && !isValidEmail(emailValue)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  });

  createEffect(() => {
    const urlValue = url();
    if (urlValue && !isValidUrl(urlValue)) {
      setUrlError("Please enter a valid URL");
    } else {
      setUrlError("");
    }
  });


  return (
    <div class="core-demo">
      <Card class="demo-section">
        <h3>Theme Management</h3>
        <p>Demonstrates the theme system with reactive theme switching.</p>
        
        <div class="demo-subsection">
          <h4>Current Theme: {theme}</h4>
          <div class="theme-grid">
            <For each={getAvailableThemes()}>
              {(themeConfig) => (
                <Button 
                  variant={themeConfig.name === theme ? "primary" : "secondary"}
                  onClick={() => setTheme(themeConfig.name as ThemeName)}
                >
                  {themeConfig.displayName}
                </Button>
              )}
            </For>
          </div>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>LocalStorage Integration</h3>
        <p>Demonstrates reactive localStorage with automatic persistence.</p>
        
        <div class="demo-subsection">
          <h4>Counter (Persistent)</h4>
          <div class="counter-demo">
            <Button onClick={() => setCounter(counter() + 1)}>
              Increment: {counter()}
            </Button>
            <Button onClick={() => setCounter(counter() - 1)}>
              Decrement
            </Button>
            <Button onClick={removeCounter} variant="danger">
              Reset
            </Button>
          </div>
        </div>

        <div class="demo-subsection">
          <h4>User Preferences (Object Storage)</h4>
          <div class="preferences-demo">
            <TextField
              label="Username"
              value={userName()}
              onInput={(e) => setUserName(e.currentTarget.value)}
              placeholder="Enter your name"
            />
            <div class="preference-controls">
              <label>
                <input 
                  type="checkbox" 
                  checked={preferences().notifications}
                  onChange={(e) => setPreferences({
                    ...preferences(),
                    notifications: e.currentTarget.checked
                  })}
                />
                Enable Notifications
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={preferences().language === "es"}
                  onChange={(e) => setPreferences({
                    ...preferences(),
                    language: e.currentTarget.checked ? "es" : "en"
                  })}
                />
                Spanish Language
              </label>
            </div>
            <div class="preferences-display">
              <strong>Current Preferences:</strong>
              <pre>{JSON.stringify(preferences(), null, 2)}</pre>
            </div>
          </div>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Debounced Values</h3>
        <p>Demonstrates debounced reactive values for performance optimization.</p>
        
        <div class="demo-subsection">
          <TextField
            label="Search Term"
            placeholder="Type to search..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            helperText="Search is debounced by 500ms"
          />
          <div class="search-results">
            <p><strong>Current Input:</strong> {searchTerm()}</p>
            <p><strong>Debounced Value:</strong> {debouncedSearchTerm()}</p>
            <p><strong>Search Results:</strong> {debouncedSearchTerm() ? `Found results for "${debouncedSearchTerm()}"` : "No search term"}</p>
          </div>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Media Query Detection</h3>
        <p>Demonstrates responsive breakpoint detection.</p>
        
        <div class="media-query-demo">
          <div class="breakpoint-indicators">
            <div class={`indicator ${isMobile() ? 'active' : ''}`}>
              Mobile: {isMobile() ? 'Active' : 'Inactive'}
            </div>
            <div class={`indicator ${isTablet() && !isMobile() ? 'active' : ''}`}>
              Tablet: {isTablet() && !isMobile() ? 'Active' : 'Inactive'}
            </div>
            <div class={`indicator ${isDesktop() ? 'active' : ''}`}>
              Desktop: {isDesktop() ? 'Active' : 'Inactive'}
            </div>
          </div>
          <p>Resize your browser window to see the breakpoints change.</p>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Validation Utilities</h3>
        <p>Demonstrates built-in validation functions.</p>
        
        <div class="validation-demo">
          <TextField
            label="Email Validation"
            type="email"
            placeholder="Enter an email address"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            error={!!emailError()}
            errorMessage={emailError()}
            helperText="Email will be validated in real-time"
          />
          
          <TextField
            label="URL Validation"
            type="url"
            placeholder="Enter a URL"
            value={url()}
            onInput={(e) => setUrl(e.currentTarget.value)}
            error={!!urlError()}
            errorMessage={urlError()}
            helperText="URL will be validated in real-time"
          />
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Formatting Utilities</h3>
        <p>Demonstrates built-in formatting functions.</p>
        
        <div class="formatting-demo">
          <div class="format-controls">
            <TextField
              label="Number"
              type="number"
              value={number()}
              onInput={(e) => setNumber(parseFloat(e.currentTarget.value) || 0)}
            />
            <TextField
              label="Currency"
              type="number"
              step="0.01"
              value={currency()}
              onInput={(e) => setCurrency(parseFloat(e.currentTarget.value) || 0)}
            />
          </div>
          
          <div class="format-results">
            <div class="format-item">
              <strong>Date (Current):</strong> {formatDateTime(new Date())}
            </div>
            <div class="format-item">
              <strong>Number:</strong> {formatNumber(number())}
            </div>
            <div class="format-item">
              <strong>Currency (USD):</strong> {formatCurrency(currency(), 'USD')}
            </div>
            <div class="format-item">
              <strong>Currency (EUR):</strong> {formatCurrency(currency(), 'EUR')}
            </div>
            <div class="format-item">
              <strong>Currency (GBP):</strong> {formatCurrency(currency(), 'GBP')}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
