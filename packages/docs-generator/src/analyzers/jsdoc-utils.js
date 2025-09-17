export const parseJSDocComment = (comment) => {
    return comment
        .replace(/\/\*\*|\*\//g, "")
        .replace(/^\s*\*\s?/gm, "")
        .replace(/@\w+.*$/gm, "")
        .trim();
};
export const getJSDocDescription = (symbol, checker) => {
    if (!symbol)
        return undefined;
    const comments = symbol.getDocumentationComment(checker);
    if (comments.length > 0) {
        return comments
            .map((comment) => comment.text)
            .join("\n")
            .trim();
    }
    const declarations = symbol.getDeclarations();
    if (declarations && declarations.length > 0) {
        const declaration = declarations[0];
        const sourceFile = declaration.getSourceFile();
        const fullText = sourceFile.getFullText();
        const start = declaration.getFullStart();
        const end = declaration.getStart();
        const leadingText = fullText.substring(start, end);
        const jsDocMatch = leadingText.match(/\/\*\*[\s\S]*?\*\//);
        if (jsDocMatch) {
            return parseJSDocComment(jsDocMatch[0]);
        }
    }
    return undefined;
};
export const getJSDocReturnDescription = (symbol) => {
    if (!symbol)
        return undefined;
    const tags = symbol.getJsDocTags();
    const returnTag = tags.find((tag) => tag.name === "returns" || tag.name === "return");
    if (returnTag && returnTag.text) {
        return Array.isArray(returnTag.text)
            ? returnTag.text.map((text) => text.text).join(" ")
            : returnTag.text;
    }
    return undefined;
};
export const extractExamples = (symbol) => {
    if (!symbol)
        return [];
    const tags = symbol.getJsDocTags();
    const exampleTags = tags.filter((tag) => tag.name === "example");
    return exampleTags.map((tag) => {
        if (tag.text && Array.isArray(tag.text)) {
            return tag.text.map((text) => text.text).join("\n");
        }
        return tag.text || "";
    });
};
export const isDeprecated = (symbol) => {
    if (!symbol)
        return false;
    const tags = symbol.getJsDocTags();
    return tags.some((tag) => tag.name === "deprecated");
};
export const extractSince = (symbol) => {
    if (!symbol)
        return undefined;
    const tags = symbol.getJsDocTags();
    const sinceTag = tags.find((tag) => tag.name === "since");
    if (sinceTag && sinceTag.text) {
        return Array.isArray(sinceTag.text)
            ? sinceTag.text.map((text) => text.text).join(" ")
            : sinceTag.text;
    }
    return undefined;
};
export const extractTags = (symbol) => {
    if (!symbol)
        return [];
    const tags = symbol.getJsDocTags();
    return tags.map((tag) => tag.name);
};
