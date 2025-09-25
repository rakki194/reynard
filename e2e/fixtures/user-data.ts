/**
 * Test User Data Fixtures
 *
 * Provides comprehensive test data generation for authentication testing
 * with realistic scenarios and edge cases.
 */

export interface ITestUserData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
  avatar?: string;
}

/**
 * Test User Data Generator
 */
export class TestUserData {
  private static userCounter = 0;

  /**
   * Generate a valid test user with realistic data
   */
  static generateValidUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `testuser_${this.userCounter}_${timestamp}`,
      email: `test.user.${this.userCounter}.${timestamp}@example.com`,
      password: "SecureP@ssw0rd123!",
      fullName: `Test User ${this.userCounter}`,
      role: "user",
    };
  }

  /**
   * Generate admin user data
   */
  static generateAdminUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `admin_${this.userCounter}_${timestamp}`,
      email: `admin.${this.userCounter}.${timestamp}@example.com`,
      password: "AdminP@ssw0rd123!",
      fullName: `Admin User ${this.userCounter}`,
      role: "admin",
    };
  }

  /**
   * Generate user with weak password for validation testing
   */
  static generateWeakPasswordUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `weakpwd_${this.userCounter}_${timestamp}`,
      email: `weak.${this.userCounter}.${timestamp}@example.com`,
      password: "123",
      fullName: `Weak Password User ${this.userCounter}`,
    };
  }

  /**
   * Generate user with invalid email for validation testing
   */
  static generateInvalidEmailUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `invalid_${this.userCounter}_${timestamp}`,
      email: "invalid-email-format",
      password: "ValidP@ssw0rd123!",
      fullName: `Invalid Email User ${this.userCounter}`,
    };
  }

  /**
   * Generate user with special characters in username
   */
  static generateSpecialCharUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `user-with-special_chars.${this.userCounter}`,
      email: `special.${this.userCounter}.${timestamp}@example.com`,
      password: "SpecialP@ssw0rd123!",
      fullName: `Special User ${this.userCounter}`,
    };
  }

  /**
   * Generate bulk test users for concurrent testing
   */
  static generateBulkUsers(count: number): ITestUserData[] {
    const users: ITestUserData[] = [];

    for (let i = 0; i < count; i++) {
      users.push(this.generateValidUser());
    }

    return users;
  }

  /**
   * Generate user with very long fields (boundary testing)
   */
  static generateLongFieldUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();
    const longString = "a".repeat(100);

    return {
      username: `long_${longString}_${this.userCounter}`,
      email: `long.${longString}.${timestamp}@example.com`,
      password: `LongP@ssw0rd${longString}123!`,
      fullName: `Very Long Full Name ${longString} ${this.userCounter}`,
    };
  }

  /**
   * Generate user data for SQL injection testing
   */
  static generateSQLInjectionUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `'; DROP TABLE users; --`,
      email: `sql.injection.${timestamp}@example.com`,
      password: "SQLInjectionP@ss123!",
      fullName: "SQL Injection User",
    };
  }

  /**
   * Generate user data for XSS testing
   */
  static generateXSSUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `<script>alert('xss')</script>`,
      email: `xss.test.${timestamp}@example.com`,
      password: "XSSP@ssw0rd123!",
      fullName: "<img src=x onerror=alert('xss')>",
    };
  }

  /**
   * Generate user with Unicode characters
   */
  static generateUnicodeUser(): ITestUserData {
    this.userCounter++;
    const timestamp = Date.now();

    return {
      username: `用户_${this.userCounter}_${timestamp}`,
      email: `unicode.${timestamp}@example.com`,
      password: "UnicodeP@ssw0rd123!",
      fullName: "Unicode User 用户",
    };
  }

  /**
   * Generate comprehensive test scenario data
   */
  static generateTestScenarios(): {
    valid: ITestUserData[];
    invalid: ITestUserData[];
    security: ITestUserData[];
    boundary: ITestUserData[];
  } {
    return {
      valid: [
        this.generateValidUser(),
        this.generateAdminUser(),
        this.generateSpecialCharUser(),
        this.generateUnicodeUser(),
      ],
      invalid: [this.generateWeakPasswordUser(), this.generateInvalidEmailUser()],
      security: [this.generateSQLInjectionUser(), this.generateXSSUser()],
      boundary: [this.generateLongFieldUser()],
    };
  }

  /**
   * Reset counter for predictable testing
   */
  static resetCounter(): void {
    this.userCounter = 0;
  }

  /**
   * Get current counter value
   */
  static getCounter(): number {
    return this.userCounter;
  }
}

/**
 * Pre-defined test users for specific scenarios
 */
export const PREDEFINED_USERS = {
  ADMIN: {
    username: "admin",
    email: "admin@example.com",
    password: "AdminP@ssw0rd123!",
    fullName: "System Administrator",
    role: "admin",
  },
  REGULAR: {
    username: "user",
    email: "user@example.com",
    password: "UserP@ssw0rd123!",
    fullName: "Regular User",
    role: "user",
  },
  GUEST: {
    username: "guest",
    email: "guest@example.com",
    password: "GuestP@ssw0rd123!",
    fullName: "Guest User",
    role: "guest",
  },
} as const;

/**
 * Edge case test data
 */
export const EDGE_CASE_DATA = {
  EMPTY_FIELDS: {
    username: "",
    email: "",
    password: "",
    fullName: "",
  },
  NULL_FIELDS: {
    username: null,
    email: null,
    password: null,
    fullName: null,
  },
  WHITESPACE_ONLY: {
    username: "   ",
    email: "   ",
    password: "   ",
    fullName: "   ",
  },
  MINIMUM_VALID: {
    username: "usr",
    email: "a@b.co",
    password: "Pass123!",
    fullName: "U",
  },
  MAXIMUM_VALID: {
    username: "a".repeat(50),
    email: `${"a".repeat(50)}@${"b".repeat(50)}.com`,
    password: "P".repeat(100) + "123!",
    fullName: "F".repeat(100),
  },
} as const;
