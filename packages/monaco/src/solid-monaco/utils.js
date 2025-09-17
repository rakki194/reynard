export const getModel = (monaco, path) => {
    const pathUri = monaco.Uri.parse(path);
    return monaco.editor.getModel(pathUri);
};
export const createModel = (monaco, value, language, path) => {
    const pathUri = path != null ? monaco.Uri.parse(path) : undefined;
    return monaco.editor.createModel(value, language, pathUri);
};
export const getOrCreateModel = (monaco, value, language, path) => {
    const existingModel = path != null ? getModel(monaco, path) : null;
    return existingModel ?? createModel(monaco, value, language, path);
};
