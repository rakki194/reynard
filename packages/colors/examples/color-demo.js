/**
 * Example demonstrating the colors package functionality
 */
import { createTagColorGenerator, createThemeContext, formatFileSize, formatOKLCH, generateColorPalette, isAudioFile, isImageFile, } from "../src/index";
// Color generation example
console.log("=== Color Generation Examples ===");
const colorGenerator = createTagColorGenerator();
// Generate colors for different tags
const tags = ["javascript", "react", "typescript", "solidjs", "css"];
tags.forEach(tag => {
    const color = colorGenerator.getTagColor("dark", tag);
    console.log(`${tag}: ${formatOKLCH(color)}`);
});
// Generate a color palette
const palette = generateColorPalette(6, 0, 0.3, 0.6);
console.log("\nColor Palette:", palette);
// Theme management example
console.log("\n=== Theme Management Examples ===");
const themeContext = createThemeContext("light");
console.log("Current theme:", themeContext.theme);
// Get tag styles for different themes
const themes = ["light", "dark", "banana", "strawberry"];
themes.forEach(theme => {
    themeContext.setTheme(theme);
    const style = themeContext.getTagStyle("example");
    console.log(`${theme} theme - Background: ${style.backgroundColor}, Color: ${style.color}`);
});
// File utilities example
console.log("\n=== File Utilities Examples ===");
// Create mock files
const mockFiles = [
    new File([""], "image.jpg"),
    new File([""], "audio.mp3"),
    new File([""], "video.mp4"),
    new File([""], "document.txt"),
];
mockFiles.forEach(file => {
    console.log(`${file.name}:`);
    console.log(`  - Image: ${isImageFile(file)}`);
    console.log(`  - Audio: ${isAudioFile(file)}`);
    console.log(`  - Size: ${formatFileSize(file.size)}`);
});
// File size formatting examples
const sizes = [0, 1024, 1048576, 1073741824];
console.log("\nFile size examples:");
sizes.forEach(size => {
    console.log(`${size} bytes = ${formatFileSize(size)}`);
});
