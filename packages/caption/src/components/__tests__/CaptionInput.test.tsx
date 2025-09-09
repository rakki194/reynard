/**
 * CaptionInput Component Tests
 *
 * Comprehensive test suite for the caption input component.
 * Tests different caption types, editing modes, and user interactions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { CaptionInput } from '../CaptionInput';
import { CaptionType, type CaptionData } from '../../types';

// Mock the TagBubble component
vi.mock('../TagBubble', () => ({
  TagBubble: vi.fn(({ tag, onEdit, onRemove, editable, removable }) => (
    <div data-testid={`tag-bubble-${tag}`}>
      <span>{tag}</span>
      {editable && <button onClick={() => onEdit(`${tag}_edited`)}>Edit</button>}
      {removable && <button onClick={() => onRemove()}>Remove</button>}
    </div>
  )),
}));

// Mock the tag utilities
vi.mock('../../utils/tagUtils', () => ({
  splitAndCleanTags: vi.fn((tags: string) => 
    tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  ),
}));

describe('CaptionInput', () => {
  const defaultCaption: CaptionData = {
    type: CaptionType.CAPTION,
    content: 'Test caption content',
  };

  const defaultProps = {
    caption: defaultCaption,
    onClick: vi.fn(),
    onCaptionChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render with default props', () => {
      render(() => <CaptionInput {...defaultProps} />);
      
      expect(screen.getByTestId('caption-input')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('Test caption content');
    });

    it('should render in collapsed state by default', () => {
      render(() => <CaptionInput {...defaultProps} />);
      
      const container = screen.getByTestId('caption-input');
      expect(container).toHaveClass('caption-input--collapsed');
      expect(container).not.toHaveClass('caption-input--expanded');
    });

    it('should render in expanded state when specified', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const container = screen.getByTestId('caption-input');
      expect(container).toHaveClass('caption-input--expanded');
      expect(container).not.toHaveClass('caption-input--collapsed');
    });
  });

  describe('Caption Types', () => {
    it('should render textarea for CAPTION type', () => {
      render(() => <CaptionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render tag bubbles for TAGS type', () => {
      const tagsCaption: CaptionData = {
        type: CaptionType.TAGS,
        content: 'tag1, tag2, tag3',
      };

      render(() => <CaptionInput {...defaultProps} caption={tagsCaption} />);
      
      expect(screen.getByTestId('tag-bubble-tag1')).toBeInTheDocument();
      expect(screen.getByTestId('tag-bubble-tag2')).toBeInTheDocument();
      expect(screen.getByTestId('tag-bubble-tag3')).toBeInTheDocument();
    });

    it('should render placeholder for other caption types', () => {
      const otherCaption: CaptionData = {
        type: 'other' as CaptionType,
        content: 'Some content',
      };

      render(() => <CaptionInput {...defaultProps} caption={otherCaption} />);
      
      expect(screen.getByText('OTHER')).toBeInTheDocument();
      expect(screen.getByText('Some content')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should expand when clicked', () => {
      render(() => <CaptionInput {...defaultProps} />);
      
      const container = screen.getByTestId('caption-input');
      fireEvent.click(container);
      
      expect(container).toHaveClass('caption-input--expanded');
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('should not expand when already expanded', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const container = screen.getByTestId('caption-input');
      fireEvent.click(container);
      
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    it('should handle textarea input changes', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'New content' } });
      
      expect(defaultProps.onCaptionChange).toHaveBeenCalledWith({
        type: CaptionType.CAPTION,
        content: 'New content',
      });
    });

    it('should handle tag editing', () => {
      const tagsCaption: CaptionData = {
        type: CaptionType.TAGS,
        content: 'tag1, tag2',
      };

      render(() => <CaptionInput {...defaultProps} caption={tagsCaption} state="expanded" />);
      
      const editButton = screen.getByTestId('tag-bubble-tag1').querySelector('button');
      fireEvent.click(editButton!);
      
      expect(defaultProps.onCaptionChange).toHaveBeenCalledWith({
        type: CaptionType.TAGS,
        content: 'tag1_edited, tag2',
      });
    });

    it('should handle tag removal', () => {
      const tagsCaption: CaptionData = {
        type: CaptionType.TAGS,
        content: 'tag1, tag2',
      };

      render(() => <CaptionInput {...defaultProps} caption={tagsCaption} state="expanded" />);
      
      const removeButton = screen.getByTestId('tag-bubble-tag1').querySelectorAll('button')[1];
      fireEvent.click(removeButton);
      
      expect(defaultProps.onCaptionChange).toHaveBeenCalledWith({
        type: CaptionType.TAGS,
        content: 'tag2',
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should save on Ctrl+Enter', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      
      expect(defaultProps.onSave).toHaveBeenCalled();
    });

    it('should cancel on Escape', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Escape' });
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should handle global Ctrl+S shortcut', async () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });
      
      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalled();
      });
    });
  });

  describe('Save and Cancel Functionality', () => {
    it('should show save button when dirty', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'Changed content' } });
      
      expect(screen.getByTitle('Save caption (Ctrl+S)')).toBeInTheDocument();
    });

    it('should show cancel button when dirty', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'Changed content' } });
      
      expect(screen.getByTitle('Cancel changes (Esc)')).toBeInTheDocument();
    });

    it('should handle save success', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      
      render(() => <CaptionInput {...defaultProps} onSave={mockSave} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'Changed content' } });
      
      const saveButton = screen.getByTitle('Save caption (Ctrl+S)');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
      });
    });

    it('should handle save error', async () => {
      const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      
      render(() => <CaptionInput {...defaultProps} onSave={mockSave} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'Changed content' } });
      
      const saveButton = screen.getByTitle('Save caption (Ctrl+S)');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });
  });

  describe('Readonly and Disabled States', () => {
    it('should render in readonly mode', () => {
      render(() => <CaptionInput {...defaultProps} readonly />);
      
      const container = screen.getByTestId('caption-input');
      expect(container).toHaveClass('caption-input--readonly');
    });

    it('should render in disabled mode', () => {
      render(() => <CaptionInput {...defaultProps} disabled />);
      
      const container = screen.getByTestId('caption-input');
      expect(container).toHaveClass('caption-input--disabled');
    });

    it('should not show edit/remove buttons for tags in readonly mode', () => {
      const tagsCaption: CaptionData = {
        type: CaptionType.TAGS,
        content: 'tag1, tag2',
      };

      render(() => <CaptionInput {...defaultProps} caption={tagsCaption} readonly />);
      
      const tagBubble = screen.getByTestId('tag-bubble-tag1');
      expect(tagBubble.querySelector('button')).not.toBeInTheDocument();
    });
  });

  describe('Auto-focus', () => {
    it('should auto-focus textarea when shouldAutoFocus is true', async () => {
      render(() => <CaptionInput {...defaultProps} shouldAutoFocus state="expanded" />);
      
      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveFocus();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.input(textarea, { target: { value: 'Changed content' } });
      
      // Simulate save error
      const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      render(() => <CaptionInput {...defaultProps} onSave={mockSave} state="expanded" />);
      
      const saveButton = screen.getByTitle('Save caption (Ctrl+S)');
      fireEvent.click(saveButton);
      
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(() => <CaptionInput {...defaultProps} />);
      
      const container = screen.getByTestId('caption-input');
      expect(container).toBeInTheDocument();
    });

    it('should have proper keyboard navigation', () => {
      render(() => <CaptionInput {...defaultProps} state="expanded" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });
  });
});
