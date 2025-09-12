import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  expectElementToHaveAttributes,
  expectElementToHaveClasses,
  expectElementToHaveTextContent,
  expectElementToBeVisible,
  expectElementToBeHidden,
  expectElementToBeInTheDocument,
  expectElementNotToBeInTheDocument,
  expectElementToBeDisabled,
  expectElementToBeEnabled,
  expectElementToBeRequired,
  expectElementNotToBeRequired,
  expectElementToBeValid,
  expectElementToBeInvalid,
  expectElementToHaveFocus,
  expectElementNotToHaveFocus,
  expectElementToBeChecked,
  expectElementNotToBeChecked,
  expectElementToBePartiallyChecked,
  expectElementToHaveRole,
  expectElementToHaveAccessibleName,
  expectElementToHaveAccessibleDescription,
} from "../assertion-utils";

describe("DOM Element Assertions", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("expectElementToHaveAttributes", () => {
    it("should pass when element has expected attributes", () => {
      const element = document.createElement("div");
      element.setAttribute("id", "test");
      element.setAttribute("class", "test-class");

      expectElementToHaveAttributes(element, {
        id: "test",
        class: "test-class",
      });
    });

    it("should fail when element is missing attributes", () => {
      const element = document.createElement("div");
      element.setAttribute("id", "test");

      expect(() => {
        expectElementToHaveAttributes(element, {
          id: "test",
          class: "missing",
        });
      }).toThrow();
    });
  });

  describe("expectElementToHaveClasses", () => {
    it("should pass when element has expected classes", () => {
      const element = document.createElement("div");
      element.className = "class1 class2 class3";

      expectElementToHaveClasses(element, "class1", "class2");
    });

    it("should fail when element is missing classes", () => {
      const element = document.createElement("div");
      element.className = "class1 class2";

      expect(() => {
        expectElementToHaveClasses(element, "class1", "class3");
      }).toThrow();
    });
  });

  describe("expectElementToHaveTextContent", () => {
    it("should pass when element has expected text content", () => {
      const element = document.createElement("div");
      element.textContent = "Hello World";

      expectElementToHaveTextContent(element, "Hello World");
    });

    it("should fail when element has different text content", () => {
      const element = document.createElement("div");
      element.textContent = "Hello World";

      expect(() => {
        expectElementToHaveTextContent(element, "Goodbye World");
      }).toThrow();
    });
  });

  describe("expectElementToBeVisible", () => {
    it("should pass when element is visible", () => {
      const element = document.createElement("div");
      element.style.display = "block";
      document.body.appendChild(element);

      expectElementToBeVisible(element);
    });

    it("should fail when element is hidden", () => {
      const element = document.createElement("div");
      element.style.display = "none";
      document.body.appendChild(element);

      expect(() => {
        expectElementToBeVisible(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeHidden", () => {
    it("should pass when element is hidden", () => {
      const element = document.createElement("div");
      element.style.display = "none";
      document.body.appendChild(element);

      expectElementToBeHidden(element);
    });

    it("should fail when element is visible", () => {
      const element = document.createElement("div");
      element.style.display = "block";
      document.body.appendChild(element);

      expect(() => {
        expectElementToBeHidden(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeInTheDocument", () => {
    it("should pass when element is in the document", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      expectElementToBeInTheDocument(element);
    });

    it("should fail when element is not in the document", () => {
      const element = document.createElement("div");

      expect(() => {
        expectElementToBeInTheDocument(element);
      }).toThrow();
    });
  });

  describe("expectElementNotToBeInTheDocument", () => {
    it("should pass when element is not in the document", () => {
      const element = document.createElement("div");

      expectElementNotToBeInTheDocument(element);
    });

    it("should fail when element is in the document", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      expect(() => {
        expectElementNotToBeInTheDocument(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeDisabled", () => {
    it("should pass when element is disabled", () => {
      const element = document.createElement("input");
      element.disabled = true;

      expectElementToBeDisabled(element);
    });

    it("should fail when element is enabled", () => {
      const element = document.createElement("input");
      element.disabled = false;

      expect(() => {
        expectElementToBeDisabled(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeEnabled", () => {
    it("should pass when element is enabled", () => {
      const element = document.createElement("input");
      element.disabled = false;

      expectElementToBeEnabled(element);
    });

    it("should fail when element is disabled", () => {
      const element = document.createElement("input");
      element.disabled = true;

      expect(() => {
        expectElementToBeEnabled(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeRequired", () => {
    it("should pass when element is required", () => {
      const element = document.createElement("input");
      element.required = true;

      expectElementToBeRequired(element);
    });

    it("should fail when element is not required", () => {
      const element = document.createElement("input");
      element.required = false;

      expect(() => {
        expectElementToBeRequired(element);
      }).toThrow();
    });
  });

  describe("expectElementNotToBeRequired", () => {
    it("should pass when element is not required", () => {
      const element = document.createElement("input");
      element.required = false;

      expectElementNotToBeRequired(element);
    });

    it("should fail when element is required", () => {
      const element = document.createElement("input");
      element.required = true;

      expect(() => {
        expectElementNotToBeRequired(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeValid", () => {
    it("should pass when element is valid", () => {
      const element = document.createElement("input");
      element.setCustomValidity("");

      expectElementToBeValid(element);
    });

    it("should fail when element is invalid", () => {
      const element = document.createElement("input");
      element.setCustomValidity("Invalid");

      expect(() => {
        expectElementToBeValid(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeInvalid", () => {
    it("should pass when element is invalid", () => {
      const element = document.createElement("input");
      element.setCustomValidity("Invalid");

      expectElementToBeInvalid(element);
    });

    it("should fail when element is valid", () => {
      const element = document.createElement("input");
      element.setCustomValidity("");

      expect(() => {
        expectElementToBeInvalid(element);
      }).toThrow();
    });
  });

  describe("expectElementToHaveFocus", () => {
    it("should pass when element has focus", () => {
      const element = document.createElement("input");
      document.body.appendChild(element);
      element.focus();

      expectElementToHaveFocus(element);
    });

    it("should fail when element does not have focus", () => {
      const element = document.createElement("input");
      document.body.appendChild(element);

      expect(() => {
        expectElementToHaveFocus(element);
      }).toThrow();
    });
  });

  describe("expectElementNotToHaveFocus", () => {
    it("should pass when element does not have focus", () => {
      const element = document.createElement("input");
      document.body.appendChild(element);

      expectElementNotToHaveFocus(element);
    });

    it("should fail when element has focus", () => {
      const element = document.createElement("input");
      document.body.appendChild(element);
      element.focus();

      expect(() => {
        expectElementNotToHaveFocus(element);
      }).toThrow();
    });
  });

  describe("expectElementToBeChecked", () => {
    it("should pass when checkbox is checked", () => {
      const element = document.createElement("input");
      element.type = "checkbox";
      element.checked = true;

      expectElementToBeChecked(element);
    });

    it("should fail when checkbox is not checked", () => {
      const element = document.createElement("input");
      element.type = "checkbox";
      element.checked = false;

      expect(() => {
        expectElementToBeChecked(element);
      }).toThrow();
    });
  });

  describe("expectElementNotToBeChecked", () => {
    it("should pass when checkbox is not checked", () => {
      const element = document.createElement("input");
      element.type = "checkbox";
      element.checked = false;

      expectElementNotToBeChecked(element);
    });

    it("should fail when checkbox is checked", () => {
      const element = document.createElement("input");
      element.type = "checkbox";
      element.checked = true;

      expect(() => {
        expectElementNotToBeChecked(element);
      }).toThrow();
    });
  });

  describe("expectElementToBePartiallyChecked", () => {
    it("should pass when checkbox is partially checked", () => {
      const element = document.createElement("input");
      element.type = "checkbox";
      element.indeterminate = true;

      expectElementToBePartiallyChecked(element);
    });

    it("should fail when checkbox is not partially checked", () => {
      const element = document.createElement("input");
      element.type = "checkbox";
      element.indeterminate = false;

      expect(() => {
        expectElementToBePartiallyChecked(element);
      }).toThrow();
    });
  });

  describe("expectElementToHaveRole", () => {
    it("should pass when element has expected role", () => {
      const element = document.createElement("button");

      expectElementToHaveRole(element, "button");
    });

    it("should fail when element has different role", () => {
      const element = document.createElement("div");

      expect(() => {
        expectElementToHaveRole(element, "button");
      }).toThrow();
    });
  });

  describe("expectElementToHaveAccessibleName", () => {
    it("should pass when element has expected accessible name", () => {
      const element = document.createElement("button");
      element.textContent = "Submit";

      expectElementToHaveAccessibleName(element, "Submit");
    });

    it("should fail when element has different accessible name", () => {
      const element = document.createElement("button");
      element.textContent = "Submit";

      expect(() => {
        expectElementToHaveAccessibleName(element, "Cancel");
      }).toThrow();
    });
  });

  describe("expectElementToHaveAccessibleDescription", () => {
    it("should pass when element has expected accessible description", () => {
      const element = document.createElement("input");
      element.setAttribute("aria-describedby", "description");
      const description = document.createElement("div");
      description.id = "description";
      description.textContent = "Enter your email address";
      document.body.appendChild(description);

      expectElementToHaveAccessibleDescription(
        element,
        "Enter your email address",
      );
    });

    it("should fail when element has different accessible description", () => {
      const element = document.createElement("input");
      element.setAttribute("aria-describedby", "description");
      const description = document.createElement("div");
      description.id = "description";
      description.textContent = "Enter your email address";
      document.body.appendChild(description);

      expect(() => {
        expectElementToHaveAccessibleDescription(
          element,
          "Enter your password",
        );
      }).toThrow();
    });
  });
});
