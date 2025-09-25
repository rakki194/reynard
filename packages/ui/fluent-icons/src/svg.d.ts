/**
 * SVG Module Declarations
 *
 * Type declarations for SVG imports with ?raw suffix
 * This allows TypeScript to understand SVG imports as raw string content
 */

declare module "*.svg?raw" {
  const content: string;
  export default content;
}

declare module "@fluentui/svg-icons/icons/*.svg?raw" {
  const content: string;
  export default content;
}

declare module "../custom-icons/*.svg?raw" {
  const content: string;
  export default content;
}
