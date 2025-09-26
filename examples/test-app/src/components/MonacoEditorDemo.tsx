import { Component, createSignal, createEffect, For, Show } from "solid-js";
import {
  MonacoEditor,
  MonacoDiffEditor,
  CodeEditor,
  useLanguageDetection,
  useReynardMonaco,
  getMonacoLanguageFromName,
} from "reynard-monaco";
import { useTheme } from "reynard-themes";
import "./MonacoEditorDemo.css";

interface LanguageOption {
  value: string;
  label: string;
  sample: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    value: "javascript",
    label: "JavaScript",
    sample: `// JavaScript Sample
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci of 10:', result);

// ES6+ features
const asyncFunction = async () => {
  const data = await fetch('/api/data');
  return data.json();
};

class Calculator {
  constructor() {
    this.history = [];
  }
  
  add(a, b) {
    const result = a + b;
    this.history.push(\`\${a} + \${b} = \${result}\`);
    return result;
  }
}`,
  },
  {
    value: "typescript",
    label: "TypeScript",
    sample: `// TypeScript Sample
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];
  
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: Date.now(),
      ...userData
    };
    
    this.users.push(newUser);
    return newUser;
  }
  
  findUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}

// Generic function
function processData<T>(data: T[]): T[] {
  return data.filter(item => item !== null);
}

// Type guards
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}`,
  },
  {
    value: "python",
    label: "Python",
    sample: `# Python Sample
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
import asyncio
import json

@dataclass
class User:
    id: int
    name: str
    email: str
    is_active: bool = True

class UserService:
    def __init__(self):
        self.users: List[User] = []
    
    async def create_user(self, user_data: Dict[str, Any]) -> User:
        new_user = User(
            id=len(self.users) + 1,
            **user_data
        )
        self.users.append(new_user)
        return new_user
    
    def find_user_by_id(self, user_id: int) -> Optional[User]:
        return next((user for user in self.users if user.id == user_id), None)

# Async context manager
async def process_users():
    async with aiohttp.ClientSession() as session:
        async with session.get('/api/users') as response:
            data = await response.json()
            return [User(**user) for user in data]

# List comprehension with filtering
active_users = [user for user in users if user.is_active]
user_emails = {user.id: user.email for user in users}`,
  },
  {
    value: "rust",
    label: "Rust",
    sample: `// Rust Sample
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
    is_active: bool,
}

impl User {
    fn new(id: u32, name: String, email: String) -> Self {
        Self {
            id,
            name,
            email,
            is_active: true,
        }
    }
    
    fn deactivate(&mut self) {
        self.is_active = false;
    }
}

struct UserService {
    users: HashMap<u32, User>,
}

impl UserService {
    fn new() -> Self {
        Self {
            users: HashMap::new(),
        }
    }
    
    fn create_user(&mut self, name: String, email: String) -> u32 {
        let id = self.users.len() as u32 + 1;
        let user = User::new(id, name, email);
        self.users.insert(id, user);
        id
    }
    
    fn get_user(&self, id: u32) -> Option<&User> {
        self.users.get(&id)
    }
}

// Async function with Result
async fn fetch_user_data(id: u32) -> Result<User, Box<dyn std::error::Error>> {
    let response = reqwest::get(&format!("/api/users/{}", id)).await?;
    let user: User = response.json().await?;
    Ok(user)
}`,
  },
  {
    value: "go",
    label: "Go",
    sample: `// Go Sample
package main

import (
import { Slider } from "reynard-primitives";
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type User struct {
    ID       int    \`json:"id"\`
    Name     string \`json:"name"\`
    Email    string \`json:"email"\`
    IsActive bool   \`json:"is_active"\`
}

type UserService struct {
    users map[int]*User
}

func NewUserService() *UserService {
    return &UserService{
        users: make(map[int]*User),
    }
}

func (s *UserService) CreateUser(name, email string) *User {
    id := len(s.users) + 1
    user := &User{
        ID:       id,
        Name:     name,
        Email:    email,
        IsActive: true,
    }
    s.users[id] = user
    return user
}

func (s *UserService) GetUser(id int) (*User, bool) {
    user, exists := s.users[id]
    return user, exists
}

// Goroutine with channel
func processUsers(users <-chan *User, results chan<- string) {
    for user := range users {
        result := fmt.Sprintf("Processed user: %s", user.Name)
        results <- result
    }
}

// Context with timeout
func fetchUserData(ctx context.Context, id int) (*User, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    // Simulate API call
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    case <-time.After(1 * time.Second):
        return &User{ID: id, Name: "John Doe"}, nil
    }
}`,
  },
  {
    value: "json",
    label: "JSON",
    sample: `{
  "name": "Monaco Editor Demo",
  "version": "1.0.0",
  "description": "A comprehensive test of reynard-monaco",
  "features": {
    "syntax_highlighting": true,
    "auto_completion": true,
    "error_detection": true,
    "multi_language_support": true,
    "themes": ["vs", "vs-dark", "hc-black"]
  },
  "languages": [
    "javascript",
    "typescript", 
    "python",
    "rust",
    "go",
    "json",
    "yaml",
    "markdown"
  ],
  "settings": {
    "font_size": 14,
    "tab_size": 2,
    "word_wrap": "on",
    "minimap": true,
    "line_numbers": true
  },
  "user": {
    "id": 12345,
    "name": "Developer",
    "email": "dev@example.com",
    "preferences": {
      "theme": "vs-dark",
      "language": "typescript"
    }
  }
}`,
  },
  {
    value: "yaml",
    label: "YAML",
    sample: `# YAML Configuration Sample
name: Monaco Editor Demo
version: 1.0.0
description: A comprehensive test of reynard-monaco

features:
  syntax_highlighting: true
  auto_completion: true
  error_detection: true
  multi_language_support: true
  themes:
    - vs
    - vs-dark
    - hc-black

languages:
  - javascript
  - typescript
  - python
  - rust
  - go
  - json
  - yaml
  - markdown

settings:
  font_size: 14
  tab_size: 2
  word_wrap: on
  minimap: true
  line_numbers: true

user:
  id: 12345
  name: Developer
  email: dev@example.com
  preferences:
    theme: vs-dark
    language: typescript

# Environment-specific configs
environments:
  development:
    debug: true
    log_level: debug
  staging:
    debug: false
    log_level: info
  production:
    debug: false
    log_level: error`,
  },
  {
    value: "markdown",
    label: "Markdown",
    sample: `# Monaco Editor Demo

A comprehensive test of the **reynard-monaco** package with forked solid-monaco components.

## Features

- ✅ **Syntax Highlighting** - Full language support
- ✅ **Auto Completion** - Intelligent code suggestions  
- ✅ **Error Detection** - Real-time error highlighting
- ✅ **Multi-language Support** - 8+ programming languages
- ✅ **Theme Support** - Multiple built-in themes

## Supported Languages

| Language | Status | Features |
|----------|--------|----------|
| JavaScript | ✅ | Full support |
| TypeScript | ✅ | Full support |
| Python | ✅ | Full support |
| Rust | ✅ | Full support |
| Go | ✅ | Full support |
| JSON | ✅ | Full support |
| YAML | ✅ | Full support |
| Markdown | ✅ | Full support |

## Code Examples

### JavaScript
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### TypeScript
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}
\`\`\`

## Configuration

The editor supports various configuration options:

- **Font Size**: Adjustable from 10px to 24px
- **Tab Size**: Configurable indentation
- **Word Wrap**: Enable/disable line wrapping
- **Minimap**: Show/hide code overview
- **Line Numbers**: Toggle line number display

## Getting Started

1. Select a language from the dropdown
2. Choose your preferred theme
3. Start coding with full Monaco Editor features!

---

*Built with ❤️ using SolidJS and Monaco Editor*
`,
  },
];

export const MonacoEditorDemo: Component = () => {
  const [selectedLanguage, setSelectedLanguage] = createSignal("typescript");
  const { theme: currentReynardTheme } = useTheme();
  const [editorValue, setEditorValue] = createSignal("");
  const [diffValue1, setDiffValue1] = createSignal("");
  const [diffValue2, setDiffValue2] = createSignal("");
  const [showDiffEditor, setShowDiffEditor] = createSignal(false);
  const [fontSize, setFontSize] = createSignal(14);
  const [showLineNumbers, setShowLineNumbers] = createSignal(true);
  const [wordWrap, setWordWrap] = createSignal("on");
  const [showMinimap, setShowMinimap] = createSignal(true);
  const [readOnly, setReadOnly] = createSignal(false);
  const [editorType, setEditorType] = createSignal<"monaco" | "code">("monaco");

  // Language detection
  const languageDetection = useLanguageDetection();

  // Reynard Monaco integration with theme sync
  const reynardMonaco = useReynardMonaco({
    reynardTheme: currentReynardTheme,
    lang: selectedLanguage(),
    enableShikiHighlighting: true,
  });

  // Initialize with sample code
  createEffect(() => {
    const language = selectedLanguage();
    const sample = LANGUAGES.find(lang => lang.value === language)?.sample || "";
    setEditorValue(sample);

    // Set diff values for comparison
    if (language === "typescript") {
      setDiffValue1(`// Original TypeScript code
interface User {
  id: number;
  name: string;
}`);

      setDiffValue2(`// Updated TypeScript code
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  isActive: boolean;
}`);
    } else {
      setDiffValue1(editorValue());
      setDiffValue2(editorValue() + "\n\n// Added new line");
    }
  });

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
    }
  };

  const handleDiffChange = (value: string | undefined) => {
    if (value !== undefined) {
      setDiffValue2(value);
    }
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(lang => lang.value === selectedLanguage());
  };

  const getMonacoOptions = () => ({
    fontSize: fontSize(),
    lineNumbers: showLineNumbers() ? "on" : "off",
    wordWrap: wordWrap() as "on" | "off" | "wordWrapColumn" | "bounded",
    minimap: { enabled: showMinimap() },
    readOnly: readOnly(),
    automaticLayout: true,
    scrollBeyondLastLine: false,
    renderWhitespace: "selection" as const,
    renderControlCharacters: true,
    cursorBlinking: "blink" as const,
    cursorStyle: "line" as const,
    selectOnLineNumbers: true,
    roundedSelection: false,
    contextmenu: true,
    mouseWheelZoom: true,
    smoothScrolling: true,
    ...reynardMonaco.getMonacoOptions(),
  });

  return (
    <div class="monaco-demo">
      <div class="demo-header">
        <h1>Monaco Editor Demo</h1>
        <p>Comprehensive test of reynard-monaco with forked solid-monaco components</p>
        <p class="theme-sync-note">
          🎨 Theme automatically syncs with Reynard theme: <strong>{currentReynardTheme}</strong>
        </p>
      </div>

      <div class="demo-controls">
        <div class="control-group">
          <label for="editor-type-select">Editor Type:</label>
          <select
            id="editor-type-select"
            value={editorType()}
            onChange={e => setEditorType(e.currentTarget.value as "monaco" | "code")}
          >
            <option value="monaco">Monaco Editor (Forked)</option>
            <option value="code">Code Editor (Reynard)</option>
          </select>
        </div>

        <div class="control-group">
          <label for="language-select">Language:</label>
          <select
            id="language-select"
            value={selectedLanguage()}
            onChange={e => setSelectedLanguage(e.currentTarget.value)}
          >
            <For each={LANGUAGES}>{lang => <option value={lang.value}>{lang.label}</option>}</For>
          </select>
        </div>

        <div class="control-group">
          <label for="font-size-range">Font Size:</label>
          <input
            type="range"
            id="font-size-range"
            min="10"
            max="24"
            value={fontSize()}
            onInput={(e: any) => setFontSize(parseInt(e.currentTarget.value))}
          />
          <span>{fontSize()}px</span>
        </div>

        <div class="control-group">
          <label>
            <input
              type="checkbox"
              checked={showLineNumbers()}
              onChange={e => setShowLineNumbers(e.currentTarget.checked)}
            />
            Line Numbers
          </label>
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" checked={showMinimap()} onChange={e => setShowMinimap(e.currentTarget.checked)} />
            Minimap
          </label>
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" checked={readOnly()} onChange={e => setReadOnly(e.currentTarget.checked)} />
            Read Only
          </label>
        </div>

        <div class="control-group">
          <label for="word-wrap-select">Word Wrap:</label>
          <select id="word-wrap-select" value={wordWrap()} onChange={e => setWordWrap(e.currentTarget.value)}>
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="wordWrapColumn">Word Wrap Column</option>
            <option value="bounded">Bounded</option>
          </select>
        </div>

        <div class="control-group">
          <button onClick={() => setShowDiffEditor(!showDiffEditor())} class="toggle-diff-btn">
            {showDiffEditor() ? "Hide" : "Show"} Diff Editor
          </button>
        </div>
      </div>

      <div class="demo-content">
        <div class="editor-container">
          <div class="editor-header">
            <h3>{editorType() === "monaco" ? "Monaco Editor (Forked)" : "Code Editor (Reynard)"}</h3>
            <div class="editor-info">
              <span class="language-info">
                Language: {getCurrentLanguage()?.label} ({selectedLanguage()})
              </span>
              <span class="theme-info">Theme: {currentReynardTheme} (Reynard)</span>
              <Show when={languageDetection.isNaturalLanguageDetectionAvailable()}>
                <span class="detection-info">Auto-detection: {languageDetection.detectedNaturalLanguage()}</span>
              </Show>
              <Show when={reynardMonaco.isShikiEnabled()}>
                <span class="shiki-info">✨ Shiki Enhanced</span>
              </Show>
            </div>
          </div>

          <div class="editor-wrapper">
            <Show when={editorType() === "monaco"}>
              <MonacoEditor
                value={editorValue()}
                language={getMonacoLanguageFromName(selectedLanguage())}
                theme={reynardMonaco.monacoTheme()}
                onChange={handleEditorChange}
                options={getMonacoOptions()}
                onMount={(editor: any, monaco: any) => {
                  console.log("Monaco Editor mounted:", { editor, monaco });
                  // Register custom themes when Monaco is available
                  reynardMonaco.registerThemes(monaco);
                }}
                style={{
                  width: "100%",
                  height: "500px",
                  "min-height": "300px",
                  border: "1px solid var(--color-border)",
                  "border-radius": "var(--border-radius-sm)",
                }}
              />
            </Show>

            <Show when={editorType() === "code"}>
              <CodeEditor
                value={editorValue()}
                language={selectedLanguage()}
                theme={reynardMonaco.monacoTheme()}
                onChange={handleEditorChange}
                height="500px"
                showLineNumbers={showLineNumbers()}
                readOnly={readOnly()}
                className="reynard-code-editor"
              />
            </Show>
          </div>
        </div>

        <Show when={showDiffEditor()}>
          <div class="diff-container">
            <div class="diff-header">
              <h3>Diff Editor</h3>
              <p>Compare two versions of your code</p>
            </div>

            <div class="diff-wrapper">
              <div
                style={{
                  width: "100%",
                  height: "400px",
                  "min-height": "300px",
                  border: "1px solid var(--color-border)",
                  "border-radius": "var(--border-radius-sm)",
                }}
              >
                <MonacoDiffEditor
                  original={diffValue1()}
                  modified={diffValue2()}
                  originalLanguage={getMonacoLanguageFromName(selectedLanguage())}
                  modifiedLanguage={getMonacoLanguageFromName(selectedLanguage())}
                  theme={reynardMonaco.monacoTheme()}
                  onChange={handleDiffChange}
                  options={getMonacoOptions()}
                />
              </div>
            </div>
          </div>
        </Show>
      </div>

      <div class="demo-footer">
        <div class="feature-list">
          <h4>Features Demonstrated:</h4>
          <ul>
            <li>✅ Forked solid-monaco components (MonacoEditor, MonacoDiffEditor)</li>
            <li>✅ Reynard CodeEditor with enhanced features</li>
            <li>✅ Latest Monaco Editor 0.52.2 support</li>
            <li>✅ Multiple language support with syntax highlighting</li>
            <li>✅ Theme switching (VS, VS Dark, High Contrast, GitHub themes)</li>
            <li>✅ Real-time configuration (font size, line numbers, minimap, etc.)</li>
            <li>✅ Shiki integration for enhanced syntax highlighting</li>
            <li>✅ Language detection capabilities</li>
            <li>✅ Diff editor for code comparison</li>
            <li>✅ Responsive design and accessibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
