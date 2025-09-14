/**
 * DOM Assertions E2E Test Suite
 * 
 * Orchestrates all DOM assertion test modules.
 * Each concern is tested in its own focused module for better maintainability.
 * 
 * @author 🦊 The Cunning Fox
 */

// Import all test modules to ensure they run as part of this suite
import "./suites/dom-visibility.spec";
import "./suites/dom-presence.spec";
import "./suites/dom-forms.spec";
import "./suites/dom-focus.spec";
import "./suites/dom-accessibility.spec";
import "./suites/dom-attributes.spec";
import "./suites/dom-content.spec";
import "./suites/dom-interactions.spec";
