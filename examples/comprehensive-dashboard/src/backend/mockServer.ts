/**
 * Mock Backend Server for Comprehensive Dashboard
 *
 * Simulates all the API endpoints that the dashboard expects:
 * - Authentication (login, register, refresh, profile)
 * - Dashboard data (stats, charts, activity)
 * - Gallery/file management
 * - Settings management
 * - User management
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";

// Types for our mock data
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "user" | "moderator";
  createdAt: string;
  lastLogin?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  conversionRate: number;
  growth: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

interface FileItem {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "audio" | "other";
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  details?: Record<string, unknown>;
}

class MockBackendServer {
  private server: ReturnType<typeof createServer> | null = null;
  private users: Map<string, User> = new Map();
  private sessions: Map<string, { userId: string; expires: number }> = new Map();
  private files: Map<string, FileItem> = new Map();
  private activities: ActivityItem[] = [];
  private settings: Map<string, unknown> = new Map();

  constructor(private port: number = 3002) {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample users
    const sampleUsers: User[] = [
      {
        id: "user-1",
        email: "admin@reynard.com",
        name: "Admin User",
        role: "admin",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      {
        id: "user-2",
        email: "demo@reynard.com",
        name: "Demo User",
        role: "user",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    // Initialize with sample files
    const sampleFiles: FileItem[] = [
      {
        id: "file-1",
        name: "dashboard-screenshot.png",
        type: "image",
        size: 245760,
        url: "/uploads/dashboard-screenshot.png",
        thumbnail: "/uploads/thumbs/dashboard-screenshot.png",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "user-1",
      },
      {
        id: "file-2",
        name: "project-documentation.pdf",
        type: "document",
        size: 1024000,
        url: "/uploads/project-documentation.pdf",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "user-2",
      },
    ];

    sampleFiles.forEach(file => {
      this.files.set(file.id, file);
    });

    // Initialize with sample activities
    this.activities = [
      {
        id: "activity-1",
        user: "Admin User",
        action: "Created new project",
        time: "2 min ago",
      },
      {
        id: "activity-2",
        user: "Demo User",
        action: "Updated profile",
        time: "5 min ago",
      },
      {
        id: "activity-3",
        user: "Admin User",
        action: "Uploaded files",
        time: "10 min ago",
      },
    ];

    // Initialize default settings
    this.settings.set("theme", "light");
    this.settings.set("language", "en");
    this.settings.set("notifications", true);
    this.settings.set("autoSave", true);
  }

  private generateTokens(userId: string): AuthTokens {
    const accessToken = `access_${userId}_${Date.now()}`;
    const refreshToken = `refresh_${userId}_${Date.now()}`;
    const expiresIn = 3600; // 1 hour

    // Store session
    this.sessions.set(accessToken, {
      userId,
      expires: Date.now() + expiresIn * 1000,
    });

    return { accessToken, refreshToken, expiresIn };
  }

  private validateToken(token: string): User | null {
    const session = this.sessions.get(token);
    if (!session || session.expires < Date.now()) {
      return null;
    }
    return this.users.get(session.userId) || null;
  }

  private parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", chunk => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private sendResponse(res: ServerResponse, status: number, data: Record<string, unknown>) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }

  private sendError(res: ServerResponse, status: number, message: string) {
    this.sendResponse(res, status, { error: message });
  }

  private handleAuthLogin = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.parseBody(_req);
      const { email, password } = body;

      if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return this.sendError(res, 400, "Email and password are required");
      }

      // Simple mock authentication - accept any email/password
      const user = Array.from(this.users.values()).find(u => u.email === email) || {
        id: "user-new",
        email,
        name: email.split("@")[0],
        role: "user" as const,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Update last login
      user.lastLogin = new Date().toISOString();
      this.users.set(user.id, user);

      const tokens = this.generateTokens(user.id);

      this.sendResponse(res, 200, {
        user,
        ...tokens,
      });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleAuthRegister = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.parseBody(_req);
      const { email, password, name } = body;

      if (
        !email ||
        !password ||
        !name ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof name !== "string"
      ) {
        return this.sendError(res, 400, "Email, password, and name are required");
      }

      // Check if user already exists
      const existingUser = Array.from(this.users.values()).find(u => u.email === email);
      if (existingUser) {
        return this.sendError(res, 409, "User already exists");
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: "user",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      this.users.set(newUser.id, newUser);
      const tokens = this.generateTokens(newUser.id);

      this.sendResponse(res, 201, {
        user: newUser,
        ...tokens,
      });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleAuthRefresh = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.parseBody(_req);
      const { refreshToken } = body;

      if (!refreshToken) {
        return this.sendError(res, 400, "Refresh token is required");
      }

      // Simple refresh logic - generate new tokens
      const userId = "user-1"; // Mock user ID
      const user = this.users.get(userId);
      if (!user) {
        return this.sendError(res, 401, "Invalid refresh token");
      }

      const tokens = this.generateTokens(userId);

      this.sendResponse(res, 200, {
        user,
        ...tokens,
      });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleAuthProfile = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const authHeader = _req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return this.sendError(res, 401, "Authorization header required");
      }

      const token = authHeader.substring(7);
      const user = this.validateToken(token);

      if (!user) {
        return this.sendError(res, 401, "Invalid or expired token");
      }

      this.sendResponse(res, 200, { user });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleDashboardStats = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const stats: DashboardStats = {
        totalUsers: this.users.size,
        activeUsers: Math.floor(this.users.size * 0.7),
        revenue: 12450 + Math.floor(Math.random() * 1000),
        conversionRate: 3.2 + Math.random() * 0.5,
        growth: 12.5 + Math.random() * 5,
      };

      this.sendResponse(res, 200, { stats });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleDashboardCharts = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const charts = {
        visitors: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Visitors",
              data: [120, 190, 300, 500, 200, 300, 450],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
          ],
        },
        revenue: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue ($)",
              data: [1200, 1900, 3000, 5000, 2000, 3000],
              backgroundColor: "#10b981",
            },
          ],
        },
        userTypes: {
          labels: ["New Users", "Returning Users", "Premium Users"],
          datasets: [
            {
              data: [300, 500, 200],
              backgroundColor: ["#3b82f6", "#8b5cf6", "#f59e0b"],
            },
          ],
        },
      };

      this.sendResponse(res, 200, { charts });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleDashboardActivity = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      this.sendResponse(res, 200, { activities: this.activities });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleFilesList = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const files = Array.from(this.files.values());
      this.sendResponse(res, 200, { files });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleFilesUpload = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.parseBody(_req);
      const { name, type, size, url } = body;

      const newFile: FileItem = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: typeof name === "string" ? name : "uploaded-file",
        type: (typeof type === "string" && ["image", "document", "video", "audio", "other"].includes(type)
          ? type
          : "other") as FileItem["type"],
        size: typeof size === "number" ? size : 0,
        url: typeof url === "string" ? url : "/uploads/uploaded-file",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "user-1",
      };

      // Add thumbnail for image files
      if (newFile.type === "image") {
        newFile.thumbnail = newFile.url.replace("/uploads/", "/uploads/thumbs/");
      }

      this.files.set(newFile.id, newFile);

      // Add activity
      this.activities.unshift({
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: "Current User",
        action: "Uploaded file",
        time: "Just now",
        details: { fileName: newFile.name },
      });

      this.sendResponse(res, 201, { file: newFile });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleSettingsGet = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const settings = Object.fromEntries(this.settings);
      this.sendResponse(res, 200, { settings });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleSettingsUpdate = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.parseBody(_req);
      const { settings } = body;

      if (!settings || typeof settings !== "object") {
        return this.sendError(res, 400, "Settings object is required");
      }

      Object.entries(settings).forEach(([key, value]) => {
        this.settings.set(key, value);
      });

      this.sendResponse(res, 200, {
        message: "Settings updated successfully",
        settings: Object.fromEntries(this.settings),
      });
    } catch (error) {
      this.sendError(res, 500, "Internal server error");
    }
  };

  private handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "", `http://localhost:${this.port}`);
    const path = url.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Route handling
    if (path.startsWith("/api/auth/login") && method === "POST") {
      return this.handleAuthLogin(req, res);
    }
    if (path.startsWith("/api/auth/register") && method === "POST") {
      return this.handleAuthRegister(req, res);
    }
    if (path.startsWith("/api/auth/refresh") && method === "POST") {
      return this.handleAuthRefresh(req, res);
    }
    if (path.startsWith("/api/auth/profile") && method === "GET") {
      return this.handleAuthProfile(req, res);
    }
    if (path.startsWith("/api/dashboard/stats") && method === "GET") {
      return this.handleDashboardStats(req, res);
    }
    if (path.startsWith("/api/dashboard/charts") && method === "GET") {
      return this.handleDashboardCharts(req, res);
    }
    if (path.startsWith("/api/dashboard/activity") && method === "GET") {
      return this.handleDashboardActivity(req, res);
    }
    if (path.startsWith("/api/files") && method === "GET") {
      return this.handleFilesList(req, res);
    }
    if (path.startsWith("/api/files/upload") && method === "POST") {
      return this.handleFilesUpload(req, res);
    }
    if (path.startsWith("/api/settings") && method === "GET") {
      return this.handleSettingsGet(req, res);
    }
    if (path.startsWith("/api/settings") && method === "PUT") {
      return this.handleSettingsUpdate(req, res);
    }

    // 404 for unmatched routes
    this.sendError(res, 404, "Endpoint not found");
  };

  start(): Promise<void> {
    return new Promise(resolve => {
      this.server = createServer(this.handleRequest);
      this.server.listen(this.port, () => {
        console.log(`Mock backend server running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          console.log("Mock backend server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Test helper methods
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getFiles(): FileItem[] {
    return Array.from(this.files.values());
  }

  getActivities(): ActivityItem[] {
    return this.activities;
  }

  getSettings(): Record<string, unknown> {
    return Object.fromEntries(this.settings);
  }

  clearData() {
    this.users.clear();
    this.sessions.clear();
    this.files.clear();
    this.activities.length = 0;
    this.settings.clear();
    this.initializeData();
  }
}

export { MockBackendServer };
export type { User, AuthTokens, DashboardStats, ChartData, FileItem, ActivityItem };
