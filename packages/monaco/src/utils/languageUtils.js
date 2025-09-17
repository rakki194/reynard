/**
 * Shared language utilities for text and code editing components
 * Consolidates language detection, mapping, and naming logic
 */
/**
 * Comprehensive language mapping for file extensions to Monaco language IDs
 */
const LANGUAGE_MAP = {
    // JavaScript/TypeScript
    js: { monacoLanguage: "javascript", displayName: "JavaScript", isCode: true },
    ts: { monacoLanguage: "typescript", displayName: "TypeScript", isCode: true },
    jsx: { monacoLanguage: "javascript", displayName: "JSX", isCode: true },
    tsx: { monacoLanguage: "typescript", displayName: "TSX", isCode: true },
    // Web Technologies
    html: { monacoLanguage: "html", displayName: "HTML", isCode: true },
    htm: { monacoLanguage: "html", displayName: "HTML", isCode: true },
    css: { monacoLanguage: "css", displayName: "CSS", isCode: true },
    scss: { monacoLanguage: "scss", displayName: "SCSS", isCode: true },
    sass: { monacoLanguage: "sass", displayName: "Sass", isCode: true },
    less: { monacoLanguage: "less", displayName: "Less", isCode: true },
    // Programming Languages
    py: { monacoLanguage: "python", displayName: "Python", isCode: true },
    java: { monacoLanguage: "java", displayName: "Java", isCode: true },
    cpp: { monacoLanguage: "cpp", displayName: "C++", isCode: true },
    cc: { monacoLanguage: "cpp", displayName: "C++", isCode: true },
    cxx: { monacoLanguage: "cpp", displayName: "C++", isCode: true },
    c: { monacoLanguage: "c", displayName: "C", isCode: true },
    cs: { monacoLanguage: "csharp", displayName: "C#", isCode: true },
    php: { monacoLanguage: "php", displayName: "PHP", isCode: true },
    rb: { monacoLanguage: "ruby", displayName: "Ruby", isCode: true },
    go: { monacoLanguage: "go", displayName: "Go", isCode: true },
    rs: { monacoLanguage: "rust", displayName: "Rust", isCode: true },
    swift: { monacoLanguage: "swift", displayName: "Swift", isCode: true },
    kt: { monacoLanguage: "kotlin", displayName: "Kotlin", isCode: true },
    scala: { monacoLanguage: "scala", displayName: "Scala", isCode: true },
    r: { monacoLanguage: "r", displayName: "R", isCode: true },
    julia: { monacoLanguage: "julia", displayName: "Julia", isCode: true },
    matlab: { monacoLanguage: "matlab", displayName: "MATLAB", isCode: true },
    // Data Formats
    sql: { monacoLanguage: "sql", displayName: "SQL", isCode: true },
    json: { monacoLanguage: "json", displayName: "JSON", isCode: true },
    xml: { monacoLanguage: "xml", displayName: "XML", isCode: true },
    yaml: { monacoLanguage: "yaml", displayName: "YAML", isCode: true },
    yml: { monacoLanguage: "yaml", displayName: "YAML", isCode: true },
    toml: { monacoLanguage: "ini", displayName: "TOML", isCode: true },
    // Documentation
    md: { monacoLanguage: "markdown", displayName: "Markdown", isCode: false },
    markdown: {
        monacoLanguage: "markdown",
        displayName: "Markdown",
        isCode: false,
    },
    // Shell Scripts
    sh: { monacoLanguage: "shell", displayName: "Shell", isCode: true },
    bash: { monacoLanguage: "shell", displayName: "Bash", isCode: true },
    zsh: { monacoLanguage: "shell", displayName: "Zsh", isCode: true },
    fish: { monacoLanguage: "shell", displayName: "Fish", isCode: true },
    ps1: {
        monacoLanguage: "powershell",
        displayName: "PowerShell",
        isCode: true,
    },
    // Configuration Files
    dockerfile: {
        monacoLanguage: "dockerfile",
        displayName: "Dockerfile",
        isCode: true,
    },
    gitignore: {
        monacoLanguage: "plaintext",
        displayName: "Git Ignore",
        isCode: false,
    },
    gitattributes: {
        monacoLanguage: "plaintext",
        displayName: "Git Attributes",
        isCode: false,
    },
    dockerignore: {
        monacoLanguage: "plaintext",
        displayName: "Docker Ignore",
        isCode: false,
    },
    editorconfig: {
        monacoLanguage: "plaintext",
        displayName: "EditorConfig",
        isCode: false,
    },
    eslintrc: {
        monacoLanguage: "json",
        displayName: "ESLint Config",
        isCode: true,
    },
    prettierrc: {
        monacoLanguage: "json",
        displayName: "Prettier Config",
        isCode: true,
    },
    babelrc: {
        monacoLanguage: "json",
        displayName: "Babel Config",
        isCode: true,
    },
    // Package Managers
    "webpack.config.js": {
        monacoLanguage: "javascript",
        displayName: "Webpack Config",
        isCode: true,
    },
    "package.json": {
        monacoLanguage: "json",
        displayName: "Package.json",
        isCode: true,
    },
    "requirements.txt": {
        monacoLanguage: "plaintext",
        displayName: "Requirements.txt",
        isCode: false,
    },
    "setup.py": {
        monacoLanguage: "python",
        displayName: "Setup.py",
        isCode: true,
    },
    "pyproject.toml": {
        monacoLanguage: "ini",
        displayName: "PyProject.toml",
        isCode: true,
    },
    "cargo.toml": {
        monacoLanguage: "ini",
        displayName: "Cargo.toml",
        isCode: true,
    },
    "go.mod": { monacoLanguage: "go", displayName: "Go.mod", isCode: true },
    "composer.json": {
        monacoLanguage: "json",
        displayName: "Composer.json",
        isCode: true,
    },
    gemfile: { monacoLanguage: "ruby", displayName: "Gemfile", isCode: true },
    rakefile: { monacoLanguage: "ruby", displayName: "Rakefile", isCode: true },
    // Build Systems
    makefile: {
        monacoLanguage: "makefile",
        displayName: "Makefile",
        isCode: true,
    },
    cmake: { monacoLanguage: "cmake", displayName: "CMake", isCode: true },
    scons: { monacoLanguage: "python", displayName: "Scons", isCode: true },
    bazel: { monacoLanguage: "python", displayName: "Bazel", isCode: true },
    buck: { monacoLanguage: "python", displayName: "Buck", isCode: true },
    gradle: { monacoLanguage: "groovy", displayName: "Gradle", isCode: true },
    maven: { monacoLanguage: "xml", displayName: "Maven", isCode: true },
    "pom.xml": { monacoLanguage: "xml", displayName: "POM.xml", isCode: true },
    "build.xml": {
        monacoLanguage: "xml",
        displayName: "Build.xml",
        isCode: true,
    },
    ant: { monacoLanguage: "xml", displayName: "Ant", isCode: true },
    ivy: { monacoLanguage: "xml", displayName: "Ivy", isCode: true },
    sbt: { monacoLanguage: "scala", displayName: "SBT", isCode: true },
    "build.sbt": {
        monacoLanguage: "scala",
        displayName: "Build.sbt",
        isCode: true,
    },
    project: { monacoLanguage: "scala", displayName: "Project", isCode: true },
    classpath: { monacoLanguage: "xml", displayName: "Classpath", isCode: true },
    settings: {
        monacoLanguage: "properties",
        displayName: "Settings",
        isCode: true,
    },
    launch: { monacoLanguage: "xml", displayName: "Launch", isCode: true },
    run: { monacoLanguage: "properties", displayName: "Run", isCode: true },
    debug: { monacoLanguage: "properties", displayName: "Debug", isCode: true },
    profile: {
        monacoLanguage: "properties",
        displayName: "Profile",
        isCode: true,
    },
    // Shell Configuration
    bashrc: { monacoLanguage: "shell", displayName: "Bash RC", isCode: true },
    zshrc: { monacoLanguage: "shell", displayName: "Zsh RC", isCode: true },
    vimrc: { monacoLanguage: "vim", displayName: "Vim RC", isCode: true },
    emacs: { monacoLanguage: "lisp", displayName: "Emacs", isCode: true },
    "tmux.conf": {
        monacoLanguage: "shell",
        displayName: "Tmux Config",
        isCode: true,
    },
    screenrc: {
        monacoLanguage: "shell",
        displayName: "Screen Config",
        isCode: true,
    },
    inputrc: { monacoLanguage: "shell", displayName: "Input RC", isCode: true },
    readline: { monacoLanguage: "shell", displayName: "Readline", isCode: true },
    gdbinit: { monacoLanguage: "shell", displayName: "GDB Init", isCode: true },
    lldbinit: { monacoLanguage: "shell", displayName: "LLDB Init", isCode: true },
    radare2: { monacoLanguage: "shell", displayName: "Radare2", isCode: true },
    ghidra: { monacoLanguage: "java", displayName: "Ghidra", isCode: true },
    ida: { monacoLanguage: "python", displayName: "IDA", isCode: true },
    x64dbg: { monacoLanguage: "assembly", displayName: "x64dbg", isCode: true },
    ollydbg: { monacoLanguage: "assembly", displayName: "OllyDbg", isCode: true },
    windbg: { monacoLanguage: "assembly", displayName: "WinDbg", isCode: true },
    // Plain Text Files
    txt: {
        monacoLanguage: "plaintext",
        displayName: "Plain Text",
        isCode: false,
    },
    log: { monacoLanguage: "plaintext", displayName: "Log File", isCode: false },
    cfg: { monacoLanguage: "ini", displayName: "Config", isCode: true },
    conf: { monacoLanguage: "ini", displayName: "Config", isCode: true },
    ini: { monacoLanguage: "ini", displayName: "INI", isCode: true },
    properties: {
        monacoLanguage: "properties",
        displayName: "Properties",
        isCode: true,
    },
    env: { monacoLanguage: "shell", displayName: "Environment", isCode: true },
    csv: { monacoLanguage: "plaintext", displayName: "CSV", isCode: false },
    tsv: { monacoLanguage: "plaintext", displayName: "TSV", isCode: false },
    // Git Files
    gitmodules: {
        monacoLanguage: "plaintext",
        displayName: "Git Modules",
        isCode: false,
    },
    gitconfig: { monacoLanguage: "ini", displayName: "Git Config", isCode: true },
    gitkeep: {
        monacoLanguage: "plaintext",
        displayName: "Git Keep",
        isCode: false,
    },
};
/**
 * Get Monaco language ID from file path or extension
 */
export function getMonacoLanguage(filePath) {
    const extension = filePath.split(".").pop()?.toLowerCase();
    return LANGUAGE_MAP[extension || ""]?.monacoLanguage || "plaintext";
}
/**
 * Get display name for language from file path or extension
 */
export function getLanguageDisplayName(filePath) {
    const extension = filePath.split(".").pop()?.toLowerCase();
    return LANGUAGE_MAP[extension || ""]?.displayName || "Plain Text";
}
/**
 * Check if file is a code file based on extension
 */
export function isCodeFile(filePath) {
    const extension = filePath.split(".").pop()?.toLowerCase();
    return LANGUAGE_MAP[extension || ""]?.isCode || false;
}
/**
 * Get complete language info from file path
 */
export function getLanguageInfo(filePath) {
    const extension = filePath.split(".").pop()?.toLowerCase();
    return (LANGUAGE_MAP[extension || ""] || {
        monacoLanguage: "plaintext",
        displayName: "Plain Text",
        isCode: false,
    });
}
/**
 * Get Monaco language ID from language name (for backward compatibility)
 */
export function getMonacoLanguageFromName(language) {
    // Direct mapping for common language names
    const directMap = {
        javascript: "javascript",
        typescript: "typescript",
        jsx: "javascript",
        tsx: "typescript",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        less: "less",
        python: "python",
        java: "java",
        cpp: "cpp",
        c: "c",
        csharp: "csharp",
        php: "php",
        ruby: "ruby",
        go: "go",
        rust: "rust",
        swift: "swift",
        kotlin: "kotlin",
        scala: "scala",
        r: "r",
        sql: "sql",
        json: "json",
        xml: "xml",
        yaml: "yaml",
        toml: "ini",
        markdown: "markdown",
        shell: "shell",
        powershell: "powershell",
        dockerfile: "dockerfile",
        plaintext: "plaintext",
    };
    return directMap[language.toLowerCase()] || "plaintext";
}
/**
 * Get display name from language name (for backward compatibility)
 */
export function getDisplayNameFromLanguage(language) {
    const displayMap = {
        javascript: "JavaScript",
        typescript: "TypeScript",
        jsx: "JSX",
        tsx: "TSX",
        html: "HTML",
        css: "CSS",
        scss: "SCSS",
        sass: "Sass",
        less: "Less",
        python: "Python",
        java: "Java",
        cpp: "C++",
        c: "C",
        csharp: "C#",
        php: "PHP",
        ruby: "Ruby",
        go: "Go",
        rust: "Rust",
        swift: "Swift",
        kotlin: "Kotlin",
        scala: "Scala",
        r: "R",
        julia: "Julia",
        matlab: "MATLAB",
        sql: "SQL",
        json: "JSON",
        xml: "XML",
        yaml: "YAML",
        toml: "TOML",
        markdown: "Markdown",
        shell: "Shell",
        powershell: "PowerShell",
        dockerfile: "Dockerfile",
        plaintext: "Plain Text",
    };
    return displayMap[language.toLowerCase()] || language;
}
