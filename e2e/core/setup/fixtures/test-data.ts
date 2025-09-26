/**
 * Test Data for E2E Tests
 *
 * Provides test data and fixtures for E2E testing including
 * user data, note data, and other test fixtures.
 */

export interface TestUserData {
  id: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
}

export interface TestNoteData {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isPublic: boolean;
  collaborators: TestCollaboratorData[];
}

export interface TestCollaboratorData {
  id: string;
  userId: string;
  permission: string;
  role: string;
}

export interface TestRoleData {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

// Test Users
export const testUsers: TestUserData[] = [
  {
    id: "user-1",
    username: "admin",
    displayName: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    permissions: ["read", "write", "delete", "share", "manage"],
  },
  {
    id: "user-2",
    username: "john_doe",
    displayName: "John Doe",
    email: "john@example.com",
    password: "john123",
    role: "user",
    permissions: ["read", "write"],
  },
  {
    id: "user-3",
    username: "jane_smith",
    displayName: "Jane Smith",
    email: "jane@example.com",
    password: "jane123",
    role: "user",
    permissions: ["read", "write"],
  },
  {
    id: "user-4",
    username: "bob_wilson",
    displayName: "Bob Wilson",
    email: "bob@example.com",
    password: "bob123",
    role: "guest",
    permissions: ["read"],
  },
];

// Test Notes
export const testNotes: TestNoteData[] = [
  {
    id: "note-1",
    title: "Test Note 1",
    content: "This is a test note content.",
    authorId: "user-1",
    isPublic: false,
    collaborators: [
      {
        id: "collab-1",
        userId: "user-2",
        permission: "read",
        role: "viewer",
      },
    ],
  },
  {
    id: "note-2",
    title: "Public Note",
    content: "This is a public note.",
    authorId: "user-2",
    isPublic: true,
    collaborators: [],
  },
];

// Test Roles
export const testRoles: TestRoleData[] = [
  {
    id: "role-1",
    name: "admin",
    level: 4,
    permissions: ["read", "write", "delete", "share", "manage"],
  },
  {
    id: "role-2",
    name: "manager",
    level: 3,
    permissions: ["read", "write", "share"],
  },
  {
    id: "role-3",
    name: "user",
    level: 2,
    permissions: ["read", "write"],
  },
  {
    id: "role-4",
    name: "guest",
    level: 1,
    permissions: ["read"],
  },
];

// Test Data for Notes RBAC Components
export const notesRbacTestData = {
  users: testUsers,
  notes: testNotes,
  roles: testRoles,

  // Mock API responses
  mockApiResponses: {
    getUsers: () => Promise.resolve(testUsers),
    getNote: (id: string) => Promise.resolve(testNotes.find(note => note.id === id)),
    updateNote: (id: string, data: Partial<TestNoteData>) =>
      Promise.resolve({ ...testNotes.find(note => note.id === id), ...data }),
    shareNote: (noteId: string, userId: string, permission: string) => Promise.resolve(true),
    revokeAccess: (noteId: string, userId: string) => Promise.resolve(true),
  },
};

export default notesRbacTestData;
