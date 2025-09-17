/**
 * Tag Autocomplete Component
 *
 * Advanced tag autocomplete system with backend integration,
 * suggestion management, and keyboard navigation. Built for the Reynard caption system.
 *
 * Features:
 * - Backend integration for tag suggestions
 * - Debounced search with configurable delay
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Suggestion filtering and ranking
 * - Integration with existing tag systems
 */
import { createSignal, createMemo, createEffect, onMount, onCleanup, For, Show, } from "solid-js";
export const TagAutocomplete = (props) => {
    const [query, setQuery] = createSignal(props.value);
    const [suggestions, setSuggestions] = createSignal([]);
    const [selectedIndex, setSelectedIndex] = createSignal(-1);
    const [isOpen, setIsOpen] = createSignal(false);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    let inputRef;
    let suggestionsRef;
    let debounceTimer;
    // Computed values
    const hasSuggestions = createMemo(() => suggestions().length > 0);
    const selectedSuggestion = createMemo(() => {
        const index = selectedIndex();
        return index >= 0 && index < suggestions().length
            ? suggestions()[index]
            : null;
    });
    // Debounced search function
    const debouncedSearch = (searchQuery) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            fetchSuggestions(searchQuery);
        }, props.debounceDelay || 300);
    };
    // Fetch suggestions from backend
    const fetchSuggestions = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < (props.minCharacters || 2)) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = props.apiEndpoint || "/api/tags/autocomplete";
            const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}&limit=${props.maxSuggestions || 10}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.suggestions && Array.isArray(data.suggestions)) {
                setSuggestions(data.suggestions);
                setIsOpen(true);
                setSelectedIndex(-1);
            }
            else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }
        catch (err) {
            console.error("Failed to fetch tag suggestions:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch suggestions");
            setSuggestions([]);
            setIsOpen(false);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle input changes
    const handleInputChange = (e) => {
        const target = e.target;
        const value = target.value;
        setQuery(value);
        props.onChange(value);
        // Trigger debounced search
        debouncedSearch(value);
    };
    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen() || !hasSuggestions()) {
            // Handle submit when no suggestions are open
            if (e.key === "Enter") {
                e.preventDefault();
                props.onSubmit?.(query());
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => prev < suggestions().length - 1 ? prev + 1 : 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => prev > 0 ? prev - 1 : suggestions().length - 1);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedSuggestion()) {
                    handleSuggestionSelect(selectedSuggestion().text);
                }
                else {
                    props.onSubmit?.(query());
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
            case "Tab":
                if (selectedSuggestion()) {
                    e.preventDefault();
                    handleSuggestionSelect(selectedSuggestion().text);
                }
                break;
        }
    };
    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion) => {
        setQuery(suggestion);
        props.onChange(suggestion);
        props.onSuggestionSelect(suggestion);
        setIsOpen(false);
        setSelectedIndex(-1);
        // Focus back to input
        inputRef?.focus();
    };
    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        handleSuggestionSelect(suggestion.text);
    };
    // Handle input focus
    const handleInputFocus = () => {
        if (hasSuggestions()) {
            setIsOpen(true);
        }
    };
    // Handle input blur
    const handleInputBlur = (e) => {
        // Delay closing to allow clicking on suggestions
        setTimeout(() => {
            if (!suggestionsRef?.contains(document.activeElement)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        }, 150);
    };
    // Handle click outside
    const handleClickOutside = (e) => {
        const target = e.target;
        if (!inputRef?.contains(target) && !suggestionsRef?.contains(target)) {
            setIsOpen(false);
            setSelectedIndex(-1);
        }
    };
    // Update query when props change
    createEffect(() => {
        if (props.value !== query()) {
            setQuery(props.value);
        }
    });
    // Set up event listeners
    onMount(() => {
        document.addEventListener("click", handleClickOutside);
    });
    onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
    });
    return (<div class={`tag-autocomplete ${props.className || ""}`}>
      <div class="autocomplete-input-container">
        <input ref={inputRef} type="text" value={query()} onInput={handleInputChange} onKeyDown={handleKeyDown} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder={props.placeholder || "Type to search tags..."} disabled={props.disabled} class="autocomplete-input" autocomplete="off" spellcheck={false}/>

        <Show when={isLoading()}>
          <div class="loading-indicator">
            <div class="spinner"></div>
          </div>
        </Show>
      </div>

      {/* Suggestions dropdown */}
      <Show when={isOpen() && (hasSuggestions() || error())}>
        <div ref={suggestionsRef} class="suggestions-dropdown">
          <Show when={error()}>
            <div class="error-message">
              <div class="error-icon">⚠️</div>
              <div class="error-text">{error()}</div>
            </div>
          </Show>

          <Show when={hasSuggestions()}>
            <For each={suggestions()}>
              {(suggestion, index) => (<div class="suggestion-item" classList={{
                selected: index() === selectedIndex(),
                "has-category": !!suggestion.category,
                "has-count": !!suggestion.count,
            }} onClick={() => handleSuggestionClick(suggestion)}>
                  <div class="suggestion-content">
                    <span class="suggestion-text">{suggestion.text}</span>

                    <Show when={props.showCategories && suggestion.category}>
                      <span class="suggestion-category">
                        {suggestion.category}
                      </span>
                    </Show>

                    <Show when={props.showCounts && suggestion.count}>
                      <span class="suggestion-count">{suggestion.count}</span>
                    </Show>
                  </div>
                </div>)}
            </For>
          </Show>

          <Show when={!hasSuggestions() &&
            !error() &&
            query().length >= (props.minCharacters || 2)}>
            <div class="no-suggestions">
              No suggestions found for "{query()}"
            </div>
          </Show>
        </div>
      </Show>

      {/* Keyboard shortcuts help */}
      <div class="keyboard-shortcuts">
        <div class="shortcuts-title">Keyboard Shortcuts:</div>
        <div class="shortcuts-list">
          <span>↑ ↓ Navigate</span>
          <span>Enter Select</span>
          <span>Tab Select</span>
          <span>Escape Close</span>
        </div>
      </div>
    </div>);
};
