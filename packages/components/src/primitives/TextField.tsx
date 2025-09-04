/**
 * TextField Component
 * A flexible text input component with validation and styling
 */

import { Component, JSX, splitProps, mergeProps, createSignal, createEffect } from 'solid-js';

export interface TextFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant */
  variant?: 'default' | 'filled' | 'outlined';
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Label text */
  label?: string;
  /** Whether label is required */
  required?: boolean;
  /** Left icon */
  leftIcon?: JSX.Element;
  /** Right icon */
  rightIcon?: JSX.Element;
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
}

const defaultProps: Partial<TextFieldProps> = {
  variant: 'default',
  size: 'md',
  error: false,
  required: false,
  fullWidth: false,
  loading: false,
  type: 'text',
};

export const TextField: Component<TextFieldProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    'variant',
    'size',
    'error',
    'errorMessage',
    'helperText',
    'label',
    'required',
    'leftIcon',
    'rightIcon',
    'fullWidth',
    'loading',
    'class',
    'id'
  ]);

  const [inputId] = createSignal(local.id || `textfield-${Math.random().toString(36).substr(2, 9)}`);
  const [focused, setFocused] = createSignal(false);

  const getWrapperClasses = () => {
    const classes = [
      'reynard-textfield',
      `reynard-textfield--${local.variant}`,
      `reynard-textfield--${local.size}`
    ];

    if (local.error) classes.push('reynard-textfield--error');
    if (focused()) classes.push('reynard-textfield--focused');
    if (local.fullWidth) classes.push('reynard-textfield--full-width');
    if (local.loading) classes.push('reynard-textfield--loading');
    if (local.class) classes.push(local.class);

    return classes.join(' ');
  };

  const getInputClasses = () => {
    const classes = ['reynard-textfield__input'];
    if (local.leftIcon) classes.push('reynard-textfield__input--with-left-icon');
    if (local.rightIcon) classes.push('reynard-textfield__input--with-right-icon');
    return classes.join(' ');
  };

  return (
    <div class={getWrapperClasses()}>
      {local.label && (
        <label class="reynard-textfield__label" for={inputId()}>
          {local.label}
          {local.required && <span class="reynard-textfield__required">*</span>}
        </label>
      )}
      
      <div class="reynard-textfield__input-wrapper">
        {local.leftIcon && (
          <div class="reynard-textfield__icon reynard-textfield__icon--left">
            {local.leftIcon}
          </div>
        )}
        
        <input
          id={inputId()}
          class={getInputClasses()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...others}
        />
        
        {local.loading && (
          <div class="reynard-textfield__spinner" />
        )}
        
        {local.rightIcon && (
          <div class="reynard-textfield__icon reynard-textfield__icon--right">
            {local.rightIcon}
          </div>
        )}
      </div>
      
      {(local.errorMessage || local.helperText) && (
        <div class="reynard-textfield__help">
          {local.error && local.errorMessage ? (
            <span class="reynard-textfield__error-message">{local.errorMessage}</span>
          ) : (
            local.helperText && (
              <span class="reynard-textfield__helper-text">{local.helperText}</span>
            )
          )}
        </div>
      )}
    </div>
  );
};




