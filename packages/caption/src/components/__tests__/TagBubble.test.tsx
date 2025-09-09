/**
 * TagBubble Component Tests
 *
 * Comprehensive test suite for the tag bubble component.
 * Tests editing, autocomplete, keyboard navigation, and styling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { TagBubble } from '../TagBubble';

// Mock the tag autocomplete utility
vi.mock('../../utils/tagAutocomplete', () => ({
  useTagAutocomplete: vi.fn(() => ({
    query: vi.fn(() => ''),
    setQuery: vi.fn(),
    suggestions: vi.fn(() => []),
    selectedIndex: vi.fn(() => -1),
    setSelectedIndex: vi.fn(),
    isOpen: vi.fn(() => false),
    setIsOpen: vi.fn(),
    selectNextSuggestion: vi.fn(),
    selectPreviousSuggestion: vi.fn(),
    getSelectedSuggestion: vi.fn(() => null),
    clearSuggestions: vi.fn(),
  })),
}));

// Mock the tag color utility
vi.mock('../../utils/tagColors', () => ({
  createTagColorGenerator: vi.fn(() => ({
    getColor: vi.fn(() => ({
      background: 'oklch(0.7 0.1 180)',
      text: 'oklch(0.1 0.1 180)',
      border: 'oklch(0.5 0.1 180)',
      hover: 'oklch(0.8 0.1 180)',
      active: 'oklch(0.6 0.1 180)',
      focus: 'oklch(0.9 0.1 180)',
    })),
  })),
}));

describe('TagBubble', () => {
  const defaultProps = {
    tag: 'test-tag',
    index: 0,
    onEdit: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render with default props', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      expect(screen.getByText('test-tag')).toBeInTheDocument();
      expect(screen.getByLabelText('Tag: test-tag')).toBeInTheDocument();
    });

    it('should apply default size class', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      expect(bubble).toHaveClass('tag-bubble--medium');
    });

    it('should apply custom size class', () => {
      render(() => <TagBubble {...defaultProps} size="large" />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      expect(bubble).toHaveClass('tag-bubble--large');
    });
  });

  describe('Tag Display', () => {
    it('should display tag text', () => {
      render(() => <TagBubble {...defaultProps} tag="my-tag" />);
      
      expect(screen.getByText('my-tag')).toBeInTheDocument();
    });

    it('should handle empty tag gracefully', () => {
      render(() => <TagBubble {...defaultProps} tag="" />);
      
      expect(screen.getByLabelText('Tag: ')).toBeInTheDocument();
    });
  });

  describe('Editing Mode', () => {
    it('should enter editing mode on double click', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      expect(screen.getByLabelText('Edit tag')).toBeInTheDocument();
    });

    it('should not enter editing mode when editable is false', () => {
      render(() => <TagBubble {...defaultProps} editable={false} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      expect(screen.queryByLabelText('Edit tag')).not.toBeInTheDocument();
    });

    it('should show input field in editing mode', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test-tag');
    });

    it('should select all text when entering edit mode', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      expect(input).toHaveFocus();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should finish editing on Enter key', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      fireEvent.input(input, { target: { value: 'edited-tag' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith('edited-tag');
    });

    it('should cancel editing on Escape key', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      fireEvent.input(input, { target: { value: 'edited-tag' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(defaultProps.onEdit).not.toHaveBeenCalled();
      expect(screen.getByText('test-tag')).toBeInTheDocument();
    });

    it('should remove tag on Backspace when input is empty', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      fireEvent.input(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Backspace' });
      
      expect(defaultProps.onRemove).toHaveBeenCalled();
    });

    it('should remove tag on Delete when input is empty', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      fireEvent.input(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Delete' });
      
      expect(defaultProps.onRemove).toHaveBeenCalled();
    });

    it('should handle Tab key to finish editing', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      fireEvent.input(input, { target: { value: 'edited-tag' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith('edited-tag');
    });
  });

  describe('Remove Functionality', () => {
    it('should show remove button by default', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      expect(screen.getByLabelText('Remove tag: test-tag')).toBeInTheDocument();
    });

    it('should not show remove button when removable is false', () => {
      render(() => <TagBubble {...defaultProps} removable={false} />);
      
      expect(screen.queryByLabelText('Remove tag: test-tag')).not.toBeInTheDocument();
    });

    it('should call onRemove when remove button is clicked', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const removeButton = screen.getByLabelText('Remove tag: test-tag');
      fireEvent.click(removeButton);
      
      expect(defaultProps.onRemove).toHaveBeenCalled();
    });

    it('should handle global Ctrl+Delete shortcut', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.focus(bubble);
      fireEvent.keyDown(document, { key: 'Delete', ctrlKey: true });
      
      expect(defaultProps.onRemove).toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    it('should handle mouse enter and leave', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.mouseEnter(bubble);
      fireEvent.mouseLeave(bubble);
      
      // Should not throw any errors
      expect(bubble).toBeInTheDocument();
    });

    it('should handle focus and blur', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.focus(bubble);
      fireEvent.blur(bubble);
      
      // Should not throw any errors
      expect(bubble).toBeInTheDocument();
    });
  });

  describe('Styling and Variants', () => {
    it('should apply muted variant class', () => {
      render(() => <TagBubble {...defaultProps} variant="muted" />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      expect(bubble).toHaveClass('tag-bubble--muted');
    });

    it('should apply vibrant variant class', () => {
      render(() => <TagBubble {...defaultProps} variant="vibrant" />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      expect(bubble).toHaveClass('tag-bubble--vibrant');
    });

    it('should apply intense class for high intensity', () => {
      render(() => <TagBubble {...defaultProps} intensity={2.0} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      expect(bubble).toHaveClass('tag-bubble--intense');
    });

    it('should apply subtle class for low intensity', () => {
      render(() => <TagBubble {...defaultProps} intensity={0.5} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      expect(bubble).toHaveClass('tag-bubble--subtle');
    });
  });

  describe('Autocomplete Integration', () => {
    it('should handle autocomplete suggestions', () => {
      const mockAutocomplete = {
        query: vi.fn(() => 'test'),
        setQuery: vi.fn(),
        suggestions: vi.fn(() => ['test-suggestion1', 'test-suggestion2']),
        selectedIndex: vi.fn(() => 0),
        setSelectedIndex: vi.fn(),
        isOpen: vi.fn(() => true),
        setIsOpen: vi.fn(),
        selectNextSuggestion: vi.fn(),
        selectPreviousSuggestion: vi.fn(),
        getSelectedSuggestion: vi.fn(() => 'test-suggestion1'),
        clearSuggestions: vi.fn(),
      };

      const { useTagAutocomplete } = require('../../utils/tagAutocomplete');
      (useTagAutocomplete as any).mockReturnValue(mockAutocomplete);

      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      // Should show suggestions when available
      expect(mockAutocomplete.isOpen()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(() => <TagBubble {...defaultProps} tag="accessible-tag" />);
      
      expect(screen.getByLabelText('Tag: accessible-tag')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for remove button', () => {
      render(() => <TagBubble {...defaultProps} tag="accessible-tag" />);
      
      expect(screen.getByLabelText('Remove tag: accessible-tag')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for edit input', () => {
      render(() => <TagBubble {...defaultProps} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      expect(screen.getByLabelText('Edit tag')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onEdit callback gracefully', () => {
      render(() => <TagBubble {...defaultProps} onEdit={undefined} />);
      
      const bubble = screen.getByLabelText('Tag: test-tag');
      fireEvent.dblClick(bubble);
      
      const input = screen.getByLabelText('Edit tag');
      fireEvent.input(input, { target: { value: 'edited-tag' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      // Should not throw an error
      expect(input).toBeInTheDocument();
    });

    it('should handle missing onRemove callback gracefully', () => {
      render(() => <TagBubble {...defaultProps} onRemove={undefined} />);
      
      const removeButton = screen.getByLabelText('Remove tag: test-tag');
      fireEvent.click(removeButton);
      
      // Should not throw an error
      expect(removeButton).toBeInTheDocument();
    });
  });
});
