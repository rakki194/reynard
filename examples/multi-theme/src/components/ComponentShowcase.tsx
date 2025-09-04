/**
 * ComponentShowcase Component
 * Demonstrates how components look across all themes
 */

import { Component, createSignal } from "solid-js";
import { useNotifications } from "@reynard/core";

export const ComponentShowcase: Component = () => {
  const [inputValue, setInputValue] = createSignal("");
  const [checkboxes, setCheckboxes] = createSignal({
    option1: true,
    option2: false,
    option3: true,
  });
  const [selectedRadio, setSelectedRadio] = createSignal("option1");
  const { notify } = useNotifications();

  const handleFormSubmit = (e: Event) => {
    e.preventDefault();
    notify("Form submitted successfully!", "success");
  };

  const toggleCheckbox = (key: "option1" | "option2" | "option3") => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div class="component-showcase">
      <h2>🧩 Component Showcase</h2>
      <p>See how all UI components adapt to the current theme</p>

      <div class="showcase-grid">
        {/* Buttons Section */}
        <section class="showcase-section">
          <h3>Buttons</h3>
          <div class="component-group">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-danger">Danger Button</button>
            <button class="btn btn-success">Success Button</button>
            <button class="btn" disabled>
              Disabled Button
            </button>
          </div>
        </section>

        {/* Form Elements Section */}
        <section class="showcase-section">
          <h3>Form Elements</h3>
          <form class="showcase-form" onSubmit={handleFormSubmit}>
            <div class="form-group">
              <label for="text-input">Text Input</label>
              <input
                id="text-input"
                type="text"
                class="form-input"
                placeholder="Enter some text..."
                value={inputValue()}
                onInput={(e) => setInputValue(e.currentTarget.value)}
              />
            </div>

            <div class="form-group">
              <label for="textarea">Textarea</label>
              <textarea
                id="textarea"
                class="form-textarea"
                placeholder="Enter multiple lines..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="select">Select Dropdown</label>
              <select id="select" class="form-select">
                <option>Choose an option...</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary">
              Submit Form
            </button>
          </form>
        </section>

        {/* Checkboxes and Radio Buttons */}
        <section class="showcase-section">
          <h3>Checkboxes & Radio Buttons</h3>

          <div class="form-group">
            <h4>Checkboxes</h4>
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={checkboxes().option1}
                onChange={() => toggleCheckbox("option1")}
              />
              <span class="checkmark"></span>
              Option 1 (Checked)
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={checkboxes().option2}
                onChange={() => toggleCheckbox("option2")}
              />
              <span class="checkmark"></span>
              Option 2 (Unchecked)
            </label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={checkboxes().option3}
                onChange={() => toggleCheckbox("option3")}
              />
              <span class="checkmark"></span>
              Option 3 (Checked)
            </label>
          </div>

          <div class="form-group">
            <h4>Radio Buttons</h4>
            <label class="radio-label">
              <input
                type="radio"
                name="radio-group"
                value="option1"
                checked={selectedRadio() === "option1"}
                onChange={() => setSelectedRadio("option1")}
              />
              <span class="radio-mark"></span>
              Radio Option 1
            </label>
            <label class="radio-label">
              <input
                type="radio"
                name="radio-group"
                value="option2"
                checked={selectedRadio() === "option2"}
                onChange={() => setSelectedRadio("option2")}
              />
              <span class="radio-mark"></span>
              Radio Option 2
            </label>
            <label class="radio-label">
              <input
                type="radio"
                name="radio-group"
                value="option3"
                checked={selectedRadio() === "option3"}
                onChange={() => setSelectedRadio("option3")}
              />
              <span class="radio-mark"></span>
              Radio Option 3
            </label>
          </div>
        </section>

        {/* Cards and Content */}
        <section class="showcase-section">
          <h3>Cards & Content</h3>

          <div class="card">
            <div class="card-header">
              <h4>Sample Card</h4>
            </div>
            <div class="card-body">
              <p>
                This is a sample card that demonstrates how content containers
                adapt to different themes.
              </p>
              <div class="card-actions">
                <button class="btn btn-primary btn-sm">Action</button>
                <button class="btn btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          </div>

          <div class="alert alert-info">
            <strong>Info:</strong> This is an informational alert message.
          </div>

          <div class="alert alert-success">
            <strong>Success:</strong> This is a success alert message.
          </div>

          <div class="alert alert-warning">
            <strong>Warning:</strong> This is a warning alert message.
          </div>

          <div class="alert alert-danger">
            <strong>Error:</strong> This is an error alert message.
          </div>
        </section>

        {/* Typography */}
        <section class="showcase-section">
          <h3>Typography</h3>

          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>

          <p>
            This is a regular paragraph with <strong>bold text</strong>,{" "}
            <em>italic text</em>, and <code>inline code</code>.
          </p>

          <blockquote>
            This is a blockquote that demonstrates how quoted text appears in
            different themes.
          </blockquote>

          <ul>
            <li>Unordered list item 1</li>
            <li>Unordered list item 2</li>
            <li>Unordered list item 3</li>
          </ul>

          <ol>
            <li>Ordered list item 1</li>
            <li>Ordered list item 2</li>
            <li>Ordered list item 3</li>
          </ol>
        </section>
      </div>
    </div>
  );
};
