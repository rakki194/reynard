/**
 * List Handler for Block Parser
 *
 * Handles parsing of different types of lists (unordered, ordered, task lists)
 */
import { MARKDOWN_PATTERNS } from "../patterns";
import { matches } from "../parsing-utils";
export class ListHandler {
    /**
     * Handle list parsing
     */
    static handleList(line, state) {
        // Unordered list items
        const unorderedMatch = matches(line, MARKDOWN_PATTERNS.listItem);
        if (unorderedMatch) {
            return this.handleUnorderedList(unorderedMatch, state);
        }
        // Numbered list items
        const numberedMatch = matches(line, MARKDOWN_PATTERNS.numberedList);
        if (numberedMatch) {
            return this.handleNumberedList(numberedMatch, state);
        }
        // Task list items
        const taskMatch = matches(line, MARKDOWN_PATTERNS.taskList);
        if (taskMatch) {
            return this.handleTaskList(taskMatch, state);
        }
        return false;
    }
    static handleUnorderedList(match, state) {
        const level = match[1].length;
        const content = match[3];
        if (!state.inList ||
            state.listType !== "unordered" ||
            state.listLevel !== level) {
            this.flushCurrentList(state);
            state.inList = true;
            state.listType = "unordered";
            state.listLevel = level;
            state.listItems = [];
        }
        state.listItems.push({ content });
        return true;
    }
    static handleNumberedList(match, state) {
        const level = match[1].length;
        const content = match[3];
        if (!state.inList ||
            state.listType !== "ordered" ||
            state.listLevel !== level) {
            this.flushCurrentList(state);
            state.inList = true;
            state.listType = "ordered";
            state.listLevel = level;
            state.listItems = [];
        }
        state.listItems.push({ content });
        return true;
    }
    static handleTaskList(match, state) {
        const level = match[1].length;
        const checked = match[3].toLowerCase() === "x";
        const content = match[4];
        if (!state.inList ||
            state.listType !== "task" ||
            state.listLevel !== level) {
            this.flushCurrentList(state);
            state.inList = true;
            state.listType = "task";
            state.listLevel = level;
            state.listItems = [];
        }
        state.listItems.push({ content, checked });
        return true;
    }
    static flushCurrentList(state) {
        // This would be called by the parent parser to flush the current list
        // Implementation depends on how the parent parser handles node creation
    }
}
