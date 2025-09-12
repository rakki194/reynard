# Module Pattern Examples

_Detailed implementations of modular TypeScript/JavaScript patterns_

## Notification System Module

### Complete Implementation

```typescript
// modules/notifications.ts (95 lines)
export interface Notification {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  group?: string;
  icon?: "spinner" | "success" | "error" | "info" | "warning";
  progress?: number;
  timestamp: number;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface NotificationOptions {
  group?: string;
  duration?: number;
  actions?: NotificationAction[];
  icon?: Notification["icon"];
  progress?: number;
}

export interface NotificationsModule {
  readonly notifications: Notification[];
  notify: (
    message: string,
    type?: Notification["type"],
    options?: NotificationOptions,
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: (group?: string) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  getNotificationsByGroup: (group: string) => Notification[];
}

export const createNotificationsModule = (): NotificationsModule => {
  const notifications: Notification[] = [];
  const timers = new Map<string, NodeJS.Timeout>();

  const notify = (
    message: string,
    type: Notification["type"] = "info",
    options: NotificationOptions = {},
  ): string => {
    const id = crypto.randomUUID();
    const notification: Notification = {
      id,
      message,
      type,
      group: options.group,
      icon: options.icon,
      progress: options.progress,
      timestamp: Date.now(),
      duration: options.duration || getDefaultDuration(type),
      actions: options.actions,
    };

    notifications.push(notification);

    // Auto-remove after duration
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
      timers.set(id, timer);
    }

    return id;
  };

  const removeNotification = (id: string): void => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.splice(index, 1);

      // Clear timer if exists
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
    }
  };

  const clearNotifications = (group?: string): void => {
    if (group) {
      // Remove notifications in specific group
      const toRemove = notifications.filter((n) => n.group === group);
      toRemove.forEach((n) => removeNotification(n.id));
    } else {
      // Remove all notifications
      notifications.forEach((n) => {
        const timer = timers.get(n.id);
        if (timer) {
          clearTimeout(timer);
        }
      });
      timers.clear();
      notifications.length = 0;
    }
  };

  const updateNotification = (
    id: string,
    updates: Partial<Notification>,
  ): void => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications[index] = { ...notifications[index], ...updates };
    }
  };

  const getNotificationsByGroup = (group: string): Notification[] => {
    return notifications.filter((n) => n.group === group);
  };

  const getDefaultDuration = (type: Notification["type"]): number => {
    switch (type) {
      case "error":
        return 0; // Don't auto-dismiss errors
      case "warning":
        return 5000;
      case "success":
        return 3000;
      case "info":
        return 4000;
      default:
        return 4000;
    }
  };

  return {
    get notifications() {
      return [...notifications];
    },
    notify,
    removeNotification,
    clearNotifications,
    updateNotification,
    getNotificationsByGroup,
  };
};
```

## Connection Manager Module

### Complete Implementation

```typescript
// modules/connection-manager.ts (90 lines)
export interface Connection {
  id: string;
  type: "http" | "websocket" | "grpc";
  config: ConnectionConfig;
  status: "connecting" | "connected" | "disconnected" | "error";
  lastError?: Error;
  connectedAt?: Date;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export interface ConnectionConfig {
  host: string;
  port: number;
  timeout: number;
  retries: number;
  autoReconnect: boolean;
  reconnectInterval: number;
}

export interface ConnectionManager {
  readonly connections: Connection[];
  addConnection: (
    id: string,
    config: ConnectionConfig,
    type: Connection["type"],
  ) => Promise<Connection>;
  removeConnection: (id: string) => Promise<void>;
  getConnection: (id: string) => Connection | undefined;
  connect: (id: string) => Promise<void>;
  disconnect: (id: string) => Promise<void>;
  reconnect: (id: string) => Promise<void>;
  getConnectionStats: () => ConnectionStats;
}

export interface ConnectionStats {
  total: number;
  connected: number;
  disconnected: number;
  error: number;
  connecting: number;
}

export const createConnectionManager = (): ConnectionManager => {
  const connections: Connection[] = [];
  const reconnectTimers = new Map<string, NodeJS.Timeout>();

  const addConnection = async (
    id: string,
    config: ConnectionConfig,
    type: Connection["type"],
  ): Promise<Connection> => {
    const connection: Connection = {
      id,
      type,
      config,
      status: "disconnected",
      reconnectAttempts: 0,
      maxReconnectAttempts: config.retries,
    };

    connections.push(connection);

    if (config.autoReconnect) {
      await connect(id);
    }

    return connection;
  };

  const removeConnection = async (id: string): Promise<void> => {
    const index = connections.findIndex((c) => c.id === id);
    if (index > -1) {
      const connection = connections[index];

      // Clear reconnect timer
      const timer = reconnectTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        reconnectTimers.delete(id);
      }

      // Disconnect if connected
      if (connection.status === "connected") {
        await disconnect(id);
      }

      connections.splice(index, 1);
    }
  };

  const getConnection = (id: string): Connection | undefined => {
    return connections.find((c) => c.id === id);
  };

  const connect = async (id: string): Promise<void> => {
    const connection = getConnection(id);
    if (!connection) throw new Error(`Connection ${id} not found`);

    connection.status = "connecting";

    try {
      // Simulate connection logic based on type
      await simulateConnection(connection);

      connection.status = "connected";
      connection.connectedAt = new Date();
      connection.reconnectAttempts = 0;
      connection.lastError = undefined;
    } catch (error) {
      connection.status = "error";
      connection.lastError = error as Error;

      // Attempt reconnection if enabled
      if (
        connection.config.autoReconnect &&
        connection.reconnectAttempts < connection.maxReconnectAttempts
      ) {
        scheduleReconnect(id);
      }
    }
  };

  const disconnect = async (id: string): Promise<void> => {
    const connection = getConnection(id);
    if (!connection) return;

    // Clear reconnect timer
    const timer = reconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      reconnectTimers.delete(id);
    }

    connection.status = "disconnected";
    connection.connectedAt = undefined;
  };

  const reconnect = async (id: string): Promise<void> => {
    const connection = getConnection(id);
    if (!connection) return;

    connection.reconnectAttempts++;
    await connect(id);
  };

  const scheduleReconnect = (id: string): void => {
    const connection = getConnection(id);
    if (!connection) return;

    const timer = setTimeout(() => {
      reconnect(id);
    }, connection.config.reconnectInterval);

    reconnectTimers.set(id, timer);
  };

  const simulateConnection = async (connection: Connection): Promise<void> => {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate random failures
    if (Math.random() < 0.1) {
      throw new Error(
        `Connection failed to ${connection.config.host}:${connection.config.port}`,
      );
    }
  };

  const getConnectionStats = (): ConnectionStats => {
    const stats: ConnectionStats = {
      total: connections.length,
      connected: 0,
      disconnected: 0,
      error: 0,
      connecting: 0,
    };

    connections.forEach((conn) => {
      switch (conn.status) {
        case "connected":
          stats.connected++;
          break;
        case "disconnected":
          stats.disconnected++;
          break;
        case "error":
          stats.error++;
          break;
        case "connecting":
          stats.connecting++;
          break;
      }
    });

    return stats;
  };

  return {
    get connections() {
      return [...connections];
    },
    addConnection,
    removeConnection,
    getConnection,
    connect,
    disconnect,
    reconnect,
    getConnectionStats,
  };
};
```

## Event Bus Module

### Complete Implementation

```typescript
// modules/event-bus.ts (85 lines)
export type EventCallback<T = any> = (data: T) => void;
export type EventMap = Record<string, any>;

export interface EventBus<TEventMap extends EventMap = EventMap> {
  on<K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>,
  ): () => void; // Returns unsubscribe function

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void;

  off<K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>,
  ): void;

  once<K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>,
  ): () => void;

  clear(event?: keyof TEventMap): void;
  getListenerCount(event?: keyof TEventMap): number;
}

export const createEventBus = <
  TEventMap extends EventMap = EventMap,
>(): EventBus<TEventMap> => {
  const listeners = new Map<keyof TEventMap, Set<EventCallback>>();
  const onceListeners = new Map<keyof TEventMap, Set<EventCallback>>();

  const on = <K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>,
  ): (() => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      off(event, callback);
    };
  };

  const emit = <K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K],
  ): void => {
    // Emit to regular listeners
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }

    // Emit to once listeners and remove them
    const eventOnceListeners = onceListeners.get(event);
    if (eventOnceListeners) {
      eventOnceListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in once event listener for ${String(event)}:`,
            error,
          );
        }
      });
      onceListeners.delete(event);
    }
  };

  const off = <K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>,
  ): void => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        listeners.delete(event);
      }
    }

    const eventOnceListeners = onceListeners.get(event);
    if (eventOnceListeners) {
      eventOnceListeners.delete(callback);
      if (eventOnceListeners.size === 0) {
        onceListeners.delete(event);
      }
    }
  };

  const once = <K extends keyof TEventMap>(
    event: K,
    callback: EventCallback<TEventMap[K]>,
  ): (() => void) => {
    if (!onceListeners.has(event)) {
      onceListeners.set(event, new Set());
    }

    onceListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      off(event, callback);
    };
  };

  const clear = (event?: keyof TEventMap): void => {
    if (event) {
      listeners.delete(event);
      onceListeners.delete(event);
    } else {
      listeners.clear();
      onceListeners.clear();
    }
  };

  const getListenerCount = (event?: keyof TEventMap): number => {
    if (event) {
      const regularCount = listeners.get(event)?.size || 0;
      const onceCount = onceListeners.get(event)?.size || 0;
      return regularCount + onceCount;
    }

    let total = 0;
    listeners.forEach((set) => (total += set.size));
    onceListeners.forEach((set) => (total += set.size));
    return total;
  };

  return {
    on,
    emit,
    off,
    once,
    clear,
    getListenerCount,
  };
};
```

## Storage Module

### Complete Implementation

```typescript
// modules/storage.ts (80 lines)
export interface StorageOptions {
  serializer?: {
    read: (value: string) => any;
    write: (value: any) => string;
  };
  syncAcrossTabs?: boolean;
  prefix?: string;
}

export interface StorageModule {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  keys(): string[];
  has(key: string): boolean;
  size(): number;
}

export const createStorageModule = (
  storage: Storage = localStorage,
  options: StorageOptions = {},
): StorageModule => {
  const {
    serializer = {
      read: JSON.parse,
      write: JSON.stringify,
    },
    syncAcrossTabs = false,
    prefix = "",
  } = options;

  const prefixedKey = (key: string): string => {
    return prefix ? `${prefix}:${key}` : key;
  };

  const get = <T>(key: string): T | null => {
    try {
      const item = storage.getItem(prefixedKey(key));
      if (item === null) return null;
      return serializer.read(item) as T;
    } catch (error) {
      console.error(`Error reading from storage key "${key}":`, error);
      return null;
    }
  };

  const set = <T>(key: string, value: T): void => {
    try {
      const serialized = serializer.write(value);
      storage.setItem(prefixedKey(key), serialized);
    } catch (error) {
      console.error(`Error writing to storage key "${key}":`, error);
    }
  };

  const remove = (key: string): void => {
    try {
      storage.removeItem(prefixedKey(key));
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
    }
  };

  const clear = (): void => {
    try {
      if (prefix) {
        // Only clear keys with our prefix
        const keys = Object.keys(storage);
        keys.forEach((key) => {
          if (key.startsWith(prefix + ":")) {
            storage.removeItem(key);
          }
        });
      } else {
        storage.clear();
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  const keys = (): string[] => {
    try {
      const allKeys = Object.keys(storage);
      if (prefix) {
        return allKeys
          .filter((key) => key.startsWith(prefix + ":"))
          .map((key) => key.substring(prefix.length + 1));
      }
      return allKeys;
    } catch (error) {
      console.error("Error getting storage keys:", error);
      return [];
    }
  };

  const has = (key: string): boolean => {
    return storage.getItem(prefixedKey(key)) !== null;
  };

  const size = (): number => {
    return keys().length;
  };

  // Handle cross-tab synchronization
  if (syncAcrossTabs) {
    window.addEventListener("storage", (event) => {
      if (event.key && event.key.startsWith(prefix)) {
        const key = prefix ? event.key.substring(prefix.length + 1) : event.key;
        // Emit custom event for cross-tab updates
        window.dispatchEvent(
          new CustomEvent("storage-change", {
            detail: { key, newValue: event.newValue, oldValue: event.oldValue },
          }),
        );
      }
    });
  }

  return {
    get,
    set,
    remove,
    clear,
    keys,
    has,
    size,
  };
};
```

## Usage Examples

### Basic Module Usage

```typescript
// Example usage of modules
import { createNotificationsModule } from "./modules/notifications";
import { createConnectionManager } from "./modules/connection-manager";
import { createEventBus } from "./modules/event-bus";
import { createStorageModule } from "./modules/storage";

// Initialize modules
const notifications = createNotificationsModule();
const connectionManager = createConnectionManager();
const eventBus = createEventBus<{
  "user:login": { userId: string; username: string };
  "user:logout": { userId: string };
  "connection:status": { connectionId: string; status: string };
}>();
const storage = createStorageModule(localStorage, { prefix: "app" });

// Use notifications
const notificationId = notifications.notify("User logged in", "success", {
  duration: 3000,
  actions: [
    {
      label: "View Profile",
      action: () => console.log("View profile clicked"),
    },
  ],
});

// Use connection manager
await connectionManager.addConnection(
  "api",
  {
    host: "api.example.com",
    port: 443,
    timeout: 5000,
    retries: 3,
    autoReconnect: true,
    reconnectInterval: 1000,
  },
  "http",
);

// Use event bus
const unsubscribe = eventBus.on("user:login", (data) => {
  console.log(`User ${data.username} logged in`);
});

eventBus.emit("user:login", { userId: "123", username: "john" });

// Use storage
storage.set("user-preferences", { theme: "dark", language: "en" });
const preferences = storage.get("user-preferences");
```

### Module Integration

```typescript
// Integration example
export const createAppModules = () => {
  const notifications = createNotificationsModule();
  const connectionManager = createConnectionManager();
  const eventBus = createEventBus();
  const storage = createStorageModule();

  // Connect modules
  eventBus.on("connection:error", (data) => {
    notifications.notify(`Connection error: ${data.error}`, "error");
  });

  eventBus.on("connection:connected", (data) => {
    notifications.notify(`Connected to ${data.host}`, "success");
  });

  return {
    notifications,
    connectionManager,
    eventBus,
    storage,
  };
};
```

This comprehensive module patterns guide provides detailed implementations for common modular patterns in TypeScript/JavaScript applications.
