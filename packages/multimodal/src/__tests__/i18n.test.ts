/**
 * i18n Tests for multimodal Package
 * Tests translation files and i18n functionality
 */

import { describe, it, expect } from "vitest";
import { commonTranslations } from "../lang/en/common";
import { multimodalTranslations } from "../lang/en/multimodal";

describe("multimodal i18n Tests", () => {
  it("should have common translations", () => {
    expect(commonTranslations).toBeDefined();
    expect(typeof commonTranslations).toBe("object");

    // Check that essential common translations exist
    expect(commonTranslations.loading).toBe("Loading...");
    expect(commonTranslations.error).toBe("Error");
    expect(commonTranslations.success).toBe("Success");
    expect(commonTranslations.save).toBe("Save");
    expect(commonTranslations.delete).toBe("Delete");
    expect(commonTranslations.cancel).toBe("Cancel");
  });

  it("should have multimodal-specific translations", () => {
    expect(multimodalTranslations).toBeDefined();
    expect(typeof multimodalTranslations).toBe("object");

    // Check that multimodal translations exist
    expect(multimodalTranslations.input).toBeDefined();
    expect(multimodalTranslations.output).toBeDefined();
    expect(multimodalTranslations.processing).toBeDefined();
    expect(multimodalTranslations.modes).toBeDefined();

    // Check specific translation values
    expect(multimodalTranslations.input.text).toBe("Text Input");
    expect(multimodalTranslations.input.image).toBe("Image Input");
    expect(multimodalTranslations.processing.analyzing).toBe("Analyzing...");
    expect(multimodalTranslations.modes.textToImage).toBe("Text to Image");
  });

  it("should have file management translations", () => {
    expect(multimodalTranslations.documentPreviewNotAvailable).toBe(
      "Document preview not available. Download to view."
    );
    expect(multimodalTranslations.downloadDocument).toBe("Download Document");
    expect(multimodalTranslations.removeFile).toBe("Remove file");
    expect(multimodalTranslations.type).toBe("Type");
    expect(multimodalTranslations.uploaded).toBe("Uploaded");
  });

  it("should have consistent translation structure", () => {
    // Check that all input types are defined
    const inputTypes = ["text", "image", "audio", "video", "file", "voice"];
    inputTypes.forEach(type => {
      expect(multimodalTranslations.input[type as keyof typeof multimodalTranslations.input]).toBeDefined();
    });

    // Check that all output types are defined
    const outputTypes = ["text", "image", "audio", "video", "file"];
    outputTypes.forEach(type => {
      expect(multimodalTranslations.output[type as keyof typeof multimodalTranslations.output]).toBeDefined();
    });

    // Check that all processing states are defined
    const processingStates = ["analyzing", "generating", "processing", "complete", "error"];
    processingStates.forEach(state => {
      expect(multimodalTranslations.processing[state as keyof typeof multimodalTranslations.processing]).toBeDefined();
    });
  });

  it("should have non-empty translation values", () => {
    // Check that common translations are not empty
    Object.values(commonTranslations).forEach(translation => {
      expect(translation).toBeTruthy();
      expect(typeof translation).toBe("string");
      expect(translation.length).toBeGreaterThan(0);
    });

    // Check that multimodal translations are not empty
    const checkTranslations = (obj: any) => {
      Object.values(obj).forEach(value => {
        if (typeof value === "string") {
          expect(value).toBeTruthy();
          expect(value.length).toBeGreaterThan(0);
        } else if (typeof value === "object" && value !== null) {
          checkTranslations(value);
        }
      });
    };

    checkTranslations(multimodalTranslations);
  });
});
