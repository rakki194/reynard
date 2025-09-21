import { describe, it, expect } from "vitest";
import { ToCValidator, LinksValidator, SentenceLengthValidator } from "../index.js";

describe("Index exports", () => {
  it("should export ToCValidator", () => {
    expect(ToCValidator).toBeDefined();
    expect(typeof ToCValidator).toBe("function");
  });

  it("should export LinksValidator", () => {
    expect(LinksValidator).toBeDefined();
    expect(typeof LinksValidator).toBe("function");
  });

  it("should export SentenceLengthValidator", () => {
    expect(SentenceLengthValidator).toBeDefined();
    expect(typeof SentenceLengthValidator).toBe("function");
  });

  it("should be able to instantiate ToCValidator", () => {
    const validator = new ToCValidator();
    expect(validator).toBeInstanceOf(ToCValidator);
  });

  it("should be able to instantiate LinksValidator", () => {
    const validator = new LinksValidator();
    expect(validator).toBeInstanceOf(LinksValidator);
  });

  it("should be able to instantiate SentenceLengthValidator", () => {
    const validator = new SentenceLengthValidator();
    expect(validator).toBeInstanceOf(SentenceLengthValidator);
  });
});
