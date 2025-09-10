# Testing Patterns for Modular TypeScript/JavaScript

*Comprehensive testing examples for modular TypeScript/JavaScript architecture*

## Unit Testing Modules

### Notification Module Testing

```typescript
// tests/modules/notifications.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNotificationsModule, type NotificationsModule } from '../../src/modules/notifications';

describe('NotificationsModule', () => {
  let notifications: NotificationsModule;
  
  beforeEach(() => {
    notifications = createNotificationsModule();
    vi.clearAllMocks();
  });
  
  describe('notify', () => {
    it('should add notification with default type', () => {
      const id = notifications.notify('Test message');
      
      expect(notifications.notifications).toHaveLength(1);
      expect(notifications.notifications[0]).toMatchObject({
        id,
        message: 'Test message',
        type: 'info',
        timestamp: expect.any(Number)
      });
    });
    
    it('should add notification with custom type', () => {
      const id = notifications.notify('Error message', 'error');
      
      expect(notifications.notifications[0]).toMatchObject({
        id,
        message: 'Error message',
        type: 'error'
      });
    });
    
    it('should add notification with options', () => {
      const actions = [{ label: 'Action', action: vi.fn() }];
      const id = notifications.notify('Test', 'info', {
        group: 'test-group',
        duration: 5000,
        actions
      });
      
      expect(notifications.notifications[0]).toMatchObject({
        id,
        group: 'test-group',
        duration: 5000,
        actions
      });
    });
    
    it('should return unique IDs', () => {
      const id1 = notifications.notify('Message 1');
      const id2 = notifications.notify('Message 2');
      
      expect(id1).not.toBe(id2);
    });
  });
  
  describe('removeNotification', () => {
    it('should remove notification by ID', () => {
      const id = notifications.notify('Test message');
      expect(notifications.notifications).toHaveLength(1);
      
      notifications.removeNotification(id);
      expect(notifications.notifications).toHaveLength(0);
    });
    
    it('should not throw when removing non-existent notification', () => {
      expect(() => {
        notifications.removeNotification('non-existent');
      }).not.toThrow();
    });
  });
  
  describe('clearNotifications', () => {
    it('should clear all notifications', () => {
      notifications.notify('Message 1');
      notifications.notify('Message 2');
      expect(notifications.notifications).toHaveLength(2);
      
      notifications.clearNotifications();
      expect(notifications.notifications).toHaveLength(0);
    });
    
    it('should clear notifications by group', () => {
      notifications.notify('Message 1', 'info', { group: 'group1' });
      notifications.notify('Message 2', 'info', { group: 'group2' });
      notifications.notify('Message 3', 'info', { group: 'group1' });
      
      notifications.clearNotifications('group1');
      
      expect(notifications.notifications).toHaveLength(1);
      expect(notifications.notifications[0].group).toBe('group2');
    });
  });
  
  describe('updateNotification', () => {
    it('should update notification properties', () => {
      const id = notifications.notify('Original message');
      
      notifications.updateNotification(id, {
        message: 'Updated message',
        type: 'warning'
      });
      
      expect(notifications.notifications[0]).toMatchObject({
        id,
        message: 'Updated message',
        type: 'warning'
      });
    });
    
    it('should not throw when updating non-existent notification', () => {
      expect(() => {
        notifications.updateNotification('non-existent', { message: 'Updated' });
      }).not.toThrow();
    });
  });
  
  describe('getNotificationsByGroup', () => {
    it('should return notifications for specific group', () => {
      notifications.notify('Message 1', 'info', { group: 'group1' });
      notifications.notify('Message 2', 'info', { group: 'group2' });
      notifications.notify('Message 3', 'info', { group: 'group1' });
      
      const group1Notifications = notifications.getNotificationsByGroup('group1');
      
      expect(group1Notifications).toHaveLength(2);
      expect(group1Notifications.every(n => n.group === 'group1')).toBe(true);
    });
    
    it('should return empty array for non-existent group', () => {
      const notifications = notifications.getNotificationsByGroup('non-existent');
      expect(notifications).toHaveLength(0);
    });
  });
  
  describe('auto-removal', () => {
    it('should auto-remove notification after duration', async () => {
      vi.useFakeTimers();
      
      const id = notifications.notify('Test message', 'info', { duration: 1000 });
      expect(notifications.notifications).toHaveLength(1);
      
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      
      expect(notifications.notifications).toHaveLength(0);
      
      vi.useRealTimers();
    });
    
    it('should not auto-remove error notifications', async () => {
      vi.useFakeTimers();
      
      const id = notifications.notify('Error message', 'error');
      expect(notifications.notifications).toHaveLength(1);
      
      vi.advanceTimersByTime(10000);
      await vi.runAllTimersAsync();
      
      expect(notifications.notifications).toHaveLength(1);
      
      vi.useRealTimers();
    });
  });
});
```

### Connection Manager Testing

```typescript
// tests/modules/connection-manager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createConnectionManager, type ConnectionManager } from '../../src/modules/connection-manager';

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;
  
  beforeEach(() => {
    connectionManager = createConnectionManager();
    vi.clearAllMocks();
  });
  
  describe('addConnection', () => {
    it('should add connection with default status', async () => {
      const connection = await connectionManager.addConnection('test-conn', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'http');
      
      expect(connection).toMatchObject({
        id: 'test-conn',
        type: 'http',
        status: 'disconnected',
        reconnectAttempts: 0
      });
      
      expect(connectionManager.connections).toHaveLength(1);
    });
    
    it('should auto-connect when enabled', async () => {
      vi.spyOn(connectionManager, 'connect').mockResolvedValue();
      
      await connectionManager.addConnection('test-conn', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: true,
        reconnectInterval: 1000
      }, 'http');
      
      expect(connectionManager.connect).toHaveBeenCalledWith('test-conn');
    });
  });
  
  describe('removeConnection', () => {
    it('should remove connection', async () => {
      await connectionManager.addConnection('test-conn', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'http');
      
      expect(connectionManager.connections).toHaveLength(1);
      
      await connectionManager.removeConnection('test-conn');
      
      expect(connectionManager.connections).toHaveLength(0);
    });
    
    it('should not throw when removing non-existent connection', async () => {
      await expect(connectionManager.removeConnection('non-existent')).resolves.not.toThrow();
    });
  });
  
  describe('getConnection', () => {
    it('should return connection by ID', async () => {
      await connectionManager.addConnection('test-conn', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'http');
      
      const connection = connectionManager.getConnection('test-conn');
      
      expect(connection).toBeDefined();
      expect(connection?.id).toBe('test-conn');
    });
    
    it('should return undefined for non-existent connection', () => {
      const connection = connectionManager.getConnection('non-existent');
      expect(connection).toBeUndefined();
    });
  });
  
  describe('connect', () => {
    it('should change status to connecting then connected', async () => {
      await connectionManager.addConnection('test-conn', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'http');
      
      const connection = connectionManager.getConnection('test-conn');
      expect(connection?.status).toBe('disconnected');
      
      await connectionManager.connect('test-conn');
      
      const updatedConnection = connectionManager.getConnection('test-conn');
      expect(updatedConnection?.status).toBe('connected');
      expect(updatedConnection?.connectedAt).toBeDefined();
    });
    
    it('should handle connection errors', async () => {
      // Mock random failure
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // 50% chance of failure
      
      await connectionManager.addConnection('test-conn', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'http');
      
      await connectionManager.connect('test-conn');
      
      const connection = connectionManager.getConnection('test-conn');
      expect(connection?.status).toBe('error');
      expect(connection?.lastError).toBeDefined();
    });
  });
  
  describe('getConnectionStats', () => {
    it('should return correct statistics', async () => {
      await connectionManager.addConnection('conn1', {
        host: 'localhost',
        port: 8080,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'http');
      
      await connectionManager.addConnection('conn2', {
        host: 'localhost',
        port: 8081,
        timeout: 5000,
        retries: 3,
        autoReconnect: false,
        reconnectInterval: 1000
      }, 'websocket');
      
      await connectionManager.connect('conn1');
      
      const stats = connectionManager.getConnectionStats();
      
      expect(stats).toMatchObject({
        total: 2,
        connected: 1,
        disconnected: 1,
        error: 0,
        connecting: 0
      });
    });
  });
});
```

### Event Bus Testing

```typescript
// tests/modules/event-bus.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEventBus, type EventBus } from '../../src/modules/event-bus';

type TestEventMap = {
  'test:event': { message: string };
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
};

describe('EventBus', () => {
  let eventBus: EventBus<TestEventMap>;
  
  beforeEach(() => {
    eventBus = createEventBus<TestEventMap>();
    vi.clearAllMocks();
  });
  
  describe('on and emit', () => {
    it('should register and trigger event listeners', () => {
      const callback = vi.fn();
      
      eventBus.on('test:event', callback);
      eventBus.emit('test:event', { message: 'Hello World' });
      
      expect(callback).toHaveBeenCalledWith({ message: 'Hello World' });
      expect(callback).toHaveBeenCalledTimes(1);
    });
    
    it('should support multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('test:event', callback1);
      eventBus.on('test:event', callback2);
      eventBus.emit('test:event', { message: 'Hello' });
      
      expect(callback1).toHaveBeenCalledWith({ message: 'Hello' });
      expect(callback2).toHaveBeenCalledWith({ message: 'Hello' });
    });
    
    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      
      const unsubscribe = eventBus.on('test:event', callback);
      eventBus.emit('test:event', { message: 'Hello' });
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      eventBus.emit('test:event', { message: 'Hello Again' });
      
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });
  
  describe('off', () => {
    it('should remove specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('test:event', callback1);
      eventBus.on('test:event', callback2);
      
      eventBus.off('test:event', callback1);
      eventBus.emit('test:event', { message: 'Hello' });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith({ message: 'Hello' });
    });
  });
  
  describe('once', () => {
    it('should trigger listener only once', () => {
      const callback = vi.fn();
      
      eventBus.once('test:event', callback);
      eventBus.emit('test:event', { message: 'First' });
      eventBus.emit('test:event', { message: 'Second' });
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ message: 'First' });
    });
    
    it('should return unsubscribe function for once listeners', () => {
      const callback = vi.fn();
      
      const unsubscribe = eventBus.once('test:event', callback);
      unsubscribe();
      eventBus.emit('test:event', { message: 'Hello' });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
  
  describe('clear', () => {
    it('should clear all listeners for specific event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('test:event', callback1);
      eventBus.on('user:login', callback2);
      
      eventBus.clear('test:event');
      eventBus.emit('test:event', { message: 'Hello' });
      eventBus.emit('user:login', { userId: '123', username: 'john' });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith({ userId: '123', username: 'john' });
    });
    
    it('should clear all listeners when no event specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventBus.on('test:event', callback1);
      eventBus.on('user:login', callback2);
      
      eventBus.clear();
      eventBus.emit('test:event', { message: 'Hello' });
      eventBus.emit('user:login', { userId: '123', username: 'john' });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });
  
  describe('getListenerCount', () => {
    it('should return correct listener count for specific event', () => {
      expect(eventBus.getListenerCount('test:event')).toBe(0);
      
      eventBus.on('test:event', vi.fn());
      eventBus.on('test:event', vi.fn());
      eventBus.once('test:event', vi.fn());
      
      expect(eventBus.getListenerCount('test:event')).toBe(3);
    });
    
    it('should return total listener count when no event specified', () => {
      eventBus.on('test:event', vi.fn());
      eventBus.on('user:login', vi.fn());
      eventBus.once('user:logout', vi.fn());
      
      expect(eventBus.getListenerCount()).toBe(3);
    });
  });
  
  describe('error handling', () => {
    it('should handle listener errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalCallback = vi.fn();
      
      eventBus.on('test:event', errorCallback);
      eventBus.on('test:event', normalCallback);
      
      eventBus.emit('test:event', { message: 'Hello' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for test:event:',
        expect.any(Error)
      );
      expect(normalCallback).toHaveBeenCalledWith({ message: 'Hello' });
      
      consoleSpy.mockRestore();
    });
  });
});
```

## Integration Testing

### Module Integration Testing

```typescript
// tests/integration/modules.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNotificationsModule } from '../../src/modules/notifications';
import { createConnectionManager } from '../../src/modules/connection-manager';
import { createEventBus } from '../../src/modules/event-bus';

describe('Module Integration', () => {
  let notifications: ReturnType<typeof createNotificationsModule>;
  let connectionManager: ReturnType<typeof createConnectionManager>;
  let eventBus: ReturnType<typeof createEventBus>;
  
  beforeEach(() => {
    notifications = createNotificationsModule();
    connectionManager = createConnectionManager();
    eventBus = createEventBus();
    vi.clearAllMocks();
  });
  
  it('should integrate notifications with connection manager', async () => {
    // Set up integration
    eventBus.on('connection:error', (data) => {
      notifications.notify(`Connection error: ${data.error}`, 'error');
    });
    
    eventBus.on('connection:connected', (data) => {
      notifications.notify(`Connected to ${data.host}`, 'success');
    });
    
    // Simulate connection events
    eventBus.emit('connection:error', { error: 'Network timeout' });
    eventBus.emit('connection:connected', { host: 'api.example.com' });
    
    expect(notifications.notifications).toHaveLength(2);
    expect(notifications.notifications[0]).toMatchObject({
      message: 'Connection error: Network timeout',
      type: 'error'
    });
    expect(notifications.notifications[1]).toMatchObject({
      message: 'Connected to api.example.com',
      type: 'success'
    });
  });
  
  it('should handle connection lifecycle with notifications', async () => {
    // Mock connection manager methods
    vi.spyOn(connectionManager, 'connect').mockImplementation(async (id) => {
      const connection = connectionManager.getConnection(id);
      if (connection) {
        connection.status = 'connected';
        connection.connectedAt = new Date();
        eventBus.emit('connection:connected', { connectionId: id, host: connection.config.host });
      }
    });
    
    vi.spyOn(connectionManager, 'disconnect').mockImplementation(async (id) => {
      const connection = connectionManager.getConnection(id);
      if (connection) {
        connection.status = 'disconnected';
        eventBus.emit('connection:disconnected', { connectionId: id });
      }
    });
    
    // Set up event handlers
    eventBus.on('connection:connected', (data) => {
      notifications.notify(`Connected to ${data.host}`, 'success');
    });
    
    eventBus.on('connection:disconnected', (data) => {
      notifications.notify('Connection lost', 'warning');
    });
    
    // Add and connect
    await connectionManager.addConnection('test-conn', {
      host: 'localhost',
      port: 8080,
      timeout: 5000,
      retries: 3,
      autoReconnect: false,
      reconnectInterval: 1000
    }, 'http');
    
    await connectionManager.connect('test-conn');
    expect(notifications.notifications).toHaveLength(1);
    
    await connectionManager.disconnect('test-conn');
    expect(notifications.notifications).toHaveLength(2);
  });
});
```

## Performance Testing

### Module Performance Testing

```typescript
// tests/performance/modules.test.ts
import { describe, it, expect } from 'vitest';
import { createNotificationsModule } from '../../src/modules/notifications';
import { createEventBus } from '../../src/modules/event-bus';

describe('Module Performance', () => {
  it('should handle large number of notifications efficiently', () => {
    const notifications = createNotificationsModule();
    const startTime = performance.now();
    
    // Add 1000 notifications
    for (let i = 0; i < 1000; i++) {
      notifications.notify(`Message ${i}`, 'info');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(notifications.notifications).toHaveLength(1000);
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });
  
  it('should handle high-frequency event emissions efficiently', () => {
    const eventBus = createEventBus<{ 'test:event': { data: number } }>();
    const callback = vi.fn();
    
    eventBus.on('test:event', callback);
    
    const startTime = performance.now();
    
    // Emit 10000 events
    for (let i = 0; i < 10000; i++) {
      eventBus.emit('test:event', { data: i });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(callback).toHaveBeenCalledTimes(10000);
    expect(duration).toBeLessThan(50); // Should complete in less than 50ms
  });
  
  it('should handle memory efficiently with large datasets', () => {
    const notifications = createNotificationsModule();
    
    // Add and remove notifications to test memory management
    for (let batch = 0; batch < 10; batch++) {
      const ids: string[] = [];
      
      // Add 100 notifications
      for (let i = 0; i < 100; i++) {
        const id = notifications.notify(`Batch ${batch} - Message ${i}`, 'info');
        ids.push(id);
      }
      
      // Remove half of them
      for (let i = 0; i < 50; i++) {
        notifications.removeNotification(ids[i]);
      }
    }
    
    // Should have 500 notifications remaining (50 per batch * 10 batches)
    expect(notifications.notifications).toHaveLength(500);
  });
});
```

## Test Utilities

### Test Helpers

```typescript
// tests/utils/test-helpers.ts
import { vi } from 'vitest';

export const createMockConnection = (overrides: Partial<Connection> = {}) => ({
  id: 'mock-connection',
  type: 'http' as const,
  config: {
    host: 'localhost',
    port: 8080,
    timeout: 5000,
    retries: 3,
    autoReconnect: false,
    reconnectInterval: 1000
  },
  status: 'disconnected' as const,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3,
  ...overrides
});

export const createMockNotification = (overrides: Partial<Notification> = {}) => ({
  id: 'mock-notification',
  message: 'Mock message',
  type: 'info' as const,
  timestamp: Date.now(),
  ...overrides
});

export const waitForAsync = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const createMockEventBus = () => {
  const listeners = new Map();
  
  return {
    on: vi.fn((event: string, callback: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(callback);
      return () => listeners.get(event).splice(listeners.get(event).indexOf(callback), 1);
    }),
    emit: vi.fn((event: string, data: any) => {
      const eventListeners = listeners.get(event) || [];
      eventListeners.forEach((callback: Function) => callback(data));
    }),
    off: vi.fn((event: string, callback: Function) => {
      const eventListeners = listeners.get(event) || [];
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }),
    once: vi.fn((event: string, callback: Function) => {
      const onceCallback = (data: any) => {
        callback(data);
        listeners.get(event).splice(listeners.get(event).indexOf(onceCallback), 1);
      };
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(onceCallback);
      return () => listeners.get(event).splice(listeners.get(event).indexOf(onceCallback), 1);
    }),
    clear: vi.fn((event?: string) => {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }),
    getListenerCount: vi.fn((event?: string) => {
      if (event) {
        return listeners.get(event)?.length || 0;
      }
      let total = 0;
      listeners.forEach(list => total += list.length);
      return total;
    })
  };
};
```

### Test Configuration

```typescript
// tests/setup.ts
import { vi } from 'vitest';

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123')
  }
});

// Mock performance.now for performance tests
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

// Setup global test utilities
global.testUtils = {
  createMockConnection: () => ({
    id: 'test-connection',
    type: 'http',
    config: {
      host: 'localhost',
      port: 8080,
      timeout: 5000,
      retries: 3,
      autoReconnect: false,
      reconnectInterval: 1000
    },
    status: 'disconnected',
    reconnectAttempts: 0,
    maxReconnectAttempts: 3
  })
};
```

This comprehensive testing guide provides patterns for testing all aspects of modular TypeScript/JavaScript modules, from unit tests to integration tests and performance testing.
