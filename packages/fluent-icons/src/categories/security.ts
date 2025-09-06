/**
 * Security and Authentication Icons
 * Icons for security, authentication, and user management
 */

// Import Fluent UI security icons
import PersonRegular from "@fluentui/svg-icons/icons/person_24_regular.svg?raw";
import PersonAddRegular from "@fluentui/svg-icons/icons/person_add_24_regular.svg?raw";
import SignOutRegular from "@fluentui/svg-icons/icons/sign_out_24_regular.svg?raw";
import PersonPasskeyRegular from "@fluentui/svg-icons/icons/person_passkey_24_regular.svg?raw";
import LockClosedRegular from "@fluentui/svg-icons/icons/lock_closed_24_regular.svg?raw";

export const securityIcons = {
  user: {
    svg: PersonRegular,
    metadata: {
      name: "user",
      tags: ["security", "user", "person"],
      description: "User icon",
      caption: "A person icon representing users, profiles, or user accounts",
      keywords: ["user", "person", "profile", "account"],
    },
  },
  "user-add": {
    svg: PersonAddRegular,
    metadata: {
      name: "user-add",
      tags: ["security", "user", "add"],
      description: "Add user icon",
      caption: "A person with plus sign icon for adding new users or creating user accounts",
      keywords: ["user", "add", "person", "new"],
    },
  },
  logout: {
    svg: SignOutRegular,
    metadata: {
      name: "logout",
      tags: ["security", "logout", "signout"],
      description: "Logout icon",
      caption: "A sign out icon for logging out, exiting, or ending user sessions",
      keywords: ["logout", "signout", "exit", "leave"],
    },
  },
  login: {
    svg: PersonPasskeyRegular,
    metadata: {
      name: "login",
      tags: ["security", "login", "passkey"],
      description: "Login icon",
      caption: "A person with passkey icon for logging in, authentication, or secure access",
      keywords: ["login", "passkey", "signin", "enter"],
    },
  },
  lock: {
    svg: LockClosedRegular,
    metadata: {
      name: "lock",
      tags: ["security", "lock", "secure"],
      description: "Lock icon",
      caption: "A closed lock icon for security, protection, or restricted access",
      keywords: ["lock", "secure", "closed", "protection"],
    },
  },
} as const;
