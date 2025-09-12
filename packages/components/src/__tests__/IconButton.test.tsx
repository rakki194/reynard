/**
 * Tests for IconButton Component
 * Uses happy-dom and custom matchers for proper testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { IconButton } from '../IconButton';

describe('IconButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with required icon prop', () => {
      render(() => <IconButton icon="save" />);
      expect(screen.getByTestId('icon-save')).toBeInTheDocument();
    });

    it('should render with children when provided', () => {
      render(() => <IconButton icon="save">Save</IconButton>);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should apply correct base classes', () => {
      const { container } = render(() => <IconButton icon="save" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button');
    });
  });

  describe('Button Variants', () => {
    const variants = ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'success', 'warning'] as const;
    
    variants.forEach((variant) => {
      it(`should apply ${variant} variant class`, () => {
        const { container } = render(() => <IconButton icon="save" variant={variant} />);
        const button = container.querySelector('button');
        expect(button).toHaveClass(`reynard-icon-button--${variant}`);
      });
    });
  });

  describe('Button Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach((size) => {
      it(`should apply ${size} size class`, () => {
        const { container } = render(() => <IconButton icon="save" size={size} />);
        const button = container.querySelector('button');
        expect(button).toHaveClass(`reynard-icon-button--${size}`);
      });
    });
  });

  describe('State Management', () => {
    it('should apply disabled class when disabled', () => {
      const { container } = render(() => <IconButton icon="save" disabled />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button--disabled');
      expect(button).toBeDisabled();
    });

    it('should apply loading class when loading', () => {
      const { container } = render(() => <IconButton icon="save" loading />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button--loading');
      expect(button).toBeDisabled();
    });

    it('should apply active class when active', () => {
      const { container } = render(() => <IconButton icon="save" active />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button--active');
    });
  });

  describe('Progress Bar', () => {
    it('should show progress bar when progress is provided', () => {
      const { container } = render(() => <IconButton icon="save" progress={50} />);
      const progressBar = container.querySelector('.reynard-icon-button__progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should apply with-progress class when progress is provided', () => {
      const { container } = render(() => <IconButton icon="save" progress={50} />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button--with-progress');
    });

    it('should set correct progress width', () => {
      const { container } = render(() => <IconButton icon="save" progress={75} />);
      const progressBar = container.querySelector('.reynard-icon-button__progress-bar');
      expect(progressBar).toHaveStyle({ '--progress-width': '75%' });
    });
  });

  describe('Glow Effect', () => {
    it('should apply glow class when glow is true', () => {
      const { container } = render(() => <IconButton icon="save" glow />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button--glow');
    });

    it('should set custom glow color', () => {
      const { container } = render(() => <IconButton icon="save" glow glowColor="red" />);
      const icon = container.querySelector('.reynard-icon');
      expect(icon).toHaveStyle({ '--glow-color': 'red' });
    });
  });

  describe('Tooltip and Accessibility', () => {
    it('should set title attribute from tooltip prop', () => {
      render(() => <IconButton icon="save" tooltip="Save document">Save</IconButton>);
      const button = screen.getByTitle('Save document');
      expect(button).toBeInTheDocument();
    });

    it('should set aria-label from aria-label prop', () => {
      render(() => <IconButton icon="save" aria-label="Save button">Save</IconButton>);
      const button = screen.getByLabelText('Save button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Click Events', () => {
    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(() => <IconButton icon="save" onClick={handleClick}>Save</IconButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn();
      render(() => <IconButton icon="save" disabled onClick={handleClick}>Save</IconButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Combined Features', () => {
    it('should handle multiple features simultaneously', () => {
      const { container } = render(() => (
        <IconButton 
          icon="save" 
          variant="primary" 
          size="lg" 
          active 
          progress={50} 
          glow 
          glowColor="blue"
          tooltip="Advanced save"
        >
          Save
        </IconButton>
      ));
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('reynard-icon-button--primary');
      expect(button).toHaveClass('reynard-icon-button--lg');
      expect(button).toHaveClass('reynard-icon-button--active');
      expect(button).toHaveClass('reynard-icon-button--with-progress');
      expect(button).toHaveClass('reynard-icon-button--glow');
      expect(button).toHaveAttribute('title', 'Advanced save');
    });
  });
});
