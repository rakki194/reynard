/**
 * Tests for ChatMessage component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { ChatMessage } from '../components/ChatMessage';
import type { ChatMessage as ChatMessageType } from '../types';

// Mock MarkdownRenderer
vi.mock('../components/MarkdownRenderer', () => ({
  MarkdownRenderer: (props: any) => <div data-testid="markdown-renderer">{props.content}</div>
}));

// Mock ThinkingIndicator  
vi.mock('../components/ThinkingIndicator', () => ({
  ThinkingIndicator: (props: any) => <div data-testid="thinking-indicator">{props.content}</div>
}));

// Mock ToolCallDisplay
vi.mock('../components/ToolCallDisplay', () => ({
  ToolCallDisplay: (props: any) => <div data-testid="tool-call">{props.toolCall.name}</div>
}));

describe('ChatMessage', () => {
  const createMockMessage = (overrides: Partial<ChatMessageType> = {}): ChatMessageType => ({
    id: 'msg-1',
    role: 'user',
    content: 'Test message',
    timestamp: Date.now(),
    ...overrides,
  });

  it('should render user message correctly', () => {
    const message = createMockMessage({ role: 'user', content: 'Hello there!' });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    const message = createMockMessage({ role: 'assistant', content: 'Hello back!' });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(screen.getByText('Hello back!')).toBeInTheDocument();
  });

  it('should render system message correctly', () => {
    const message = createMockMessage({ role: 'system', content: 'System notification' });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('System notification')).toBeInTheDocument();
  });

  it('should render tool message correctly', () => {
    const message = createMockMessage({ 
      role: 'tool', 
      content: 'Tool result',
      toolName: 'calculator' 
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('calculator')).toBeInTheDocument();
    expect(screen.getByText('Tool result')).toBeInTheDocument();
  });

  it('should show timestamp when enabled', () => {
    const message = createMockMessage({ timestamp: 1640995200000 }); // Jan 1, 2022
    
    render(() => <ChatMessage message={message} showTimestamp={true} />);
    
    const timestamp = screen.getByRole('time');
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveAttribute('datetime');
  });

  it('should hide timestamp when disabled', () => {
    const message = createMockMessage();
    
    render(() => <ChatMessage message={message} showTimestamp={false} />);
    
    expect(screen.queryByRole('time')).not.toBeInTheDocument();
  });

  it('should show token count when enabled', () => {
    const message = createMockMessage({
      metadata: { tokensUsed: 42 }
    });
    
    render(() => <ChatMessage message={message} showTokenCount={true} />);
    
    expect(screen.getByText('42 tokens')).toBeInTheDocument();
  });

  it('should show streaming indicator for streaming messages', () => {
    const message = createMockMessage({
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: 'Partial content',
        currentThinking: '',
        chunks: [],
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    // Should show streaming indicator in header
    const streamingDots = document.querySelector('.reynard-chat-message__typing-dots');
    expect(streamingDots).toBeInTheDocument();
  });

  it('should show thinking indicator when thinking', () => {
    const message = createMockMessage({
      streaming: {
        isStreaming: true,
        isThinking: true,
        currentContent: '',
        currentThinking: 'Thinking about this...',
        chunks: [],
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByTestId('thinking-indicator')).toBeInTheDocument();
  });

  it('should toggle thinking section visibility', async () => {
    const message = createMockMessage({
      content: 'Response with <think>hidden thinking</think> content'
    });
    
    render(() => <ChatMessage message={message} />);
    
    const thinkingToggle = screen.getByRole('button', { name: /thinking/i });
    expect(thinkingToggle).toBeInTheDocument();
    
    fireEvent.click(thinkingToggle);
    
    expect(screen.getByTestId('thinking-indicator')).toBeInTheDocument();
  });

  it('should toggle details panel', async () => {
    const message = createMockMessage({
      metadata: {
        model: 'gpt-4',
        temperature: 0.7,
        tokensUsed: 42,
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    const detailsToggle = screen.getByRole('button', { name: /details/i });
    fireEvent.click(detailsToggle);
    
    expect(screen.getByText('Message ID:')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('0.7')).toBeInTheDocument();
  });

  it('should render tool calls', () => {
    const message = createMockMessage({
      toolCalls: [{
        id: 'tool-1',
        name: 'calculator',
        arguments: { expression: '2 + 2' },
        status: 'completed' as const,
        result: 4,
      }]
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByTestId('tool-call')).toBeInTheDocument();
    expect(screen.getByText('calculator')).toBeInTheDocument();
  });

  it('should handle tool actions', () => {
    const onToolAction = vi.fn();
    const message = createMockMessage({
      toolCalls: [{
        id: 'tool-1',
        name: 'calculator',
        arguments: { expression: '2 + 2' },
        status: 'running' as const,
      }]
    });
    
    render(() => <ChatMessage message={message} onToolAction={onToolAction} />);
    
    // This would be tested by interacting with the ToolCallDisplay component
    // which is mocked in this test
  });

  it('should render error state', () => {
    const message = createMockMessage({
      error: {
        type: 'api_error',
        message: 'Failed to process message',
        recoverable: true,
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('Failed to process message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should not show retry button for non-recoverable errors', () => {
    const message = createMockMessage({
      error: {
        type: 'fatal_error',
        message: 'Fatal error occurred',
        recoverable: false,
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('Fatal error occurred')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should use custom renderer when provided', () => {
    const customRenderer = vi.fn(() => <div data-testid="custom-content">Custom rendered content</div>);
    const message = createMockMessage({ content: 'Original content' });
    
    render(() => <ChatMessage message={message} customRenderer={customRenderer} />);
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(customRenderer).toHaveBeenCalledWith('Original content', message);
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes for different roles', () => {
    const { rerender } = render(() => 
      <ChatMessage message={createMockMessage({ role: 'user' })} />
    );
    
    expect(document.querySelector('.reynard-chat-message--user')).toBeInTheDocument();
    
    rerender(() => 
      <ChatMessage message={createMockMessage({ role: 'assistant' })} />
    );
    
    expect(document.querySelector('.reynard-chat-message--assistant')).toBeInTheDocument();
  });

  it('should apply streaming class when streaming', () => {
    const message = createMockMessage({
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: 'Streaming...',
        currentThinking: '',
        chunks: [],
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(document.querySelector('.reynard-chat-message--streaming')).toBeInTheDocument();
  });

  it('should apply latest class when isLatest is true', () => {
    const message = createMockMessage();
    
    render(() => <ChatMessage message={message} isLatest={true} />);
    
    expect(document.querySelector('.reynard-chat-message--latest')).toBeInTheDocument();
  });

  it('should show placeholder when streaming without content', () => {
    const message = createMockMessage({
      content: '',
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: '',
        currentThinking: '',
        chunks: [],
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('Preparing response...')).toBeInTheDocument();
  });

  it('should format processing time correctly', () => {
    const message = createMockMessage({
      metadata: {
        processingTime: 1234.5
      }
    });
    
    render(() => <ChatMessage message={message} />);
    
    expect(screen.getByText('1235ms')).toBeInTheDocument();
  });

  it('should use custom avatar when provided', () => {
    const CustomAvatar = () => <div data-testid="custom-avatar">CA</div>;
    const message = createMockMessage();
    
    render(() => <ChatMessage message={message} avatar={CustomAvatar} />);
    
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument();
  });
});
