/**
 * AIGalleryProvider Component
 *
 * Context provider for AI-enhanced gallery functionality.
 * Provides AI state and operations to child components.
 */
import { useGalleryAI, AIGalleryContext } from "../composables/useGalleryAI";
export const AIGalleryProvider = (props) => {
    // Create the AI gallery instance directly - SolidJS will track prop changes automatically
    const aiGallery = useGalleryAI({
        get initialConfig() {
            return props.initialConfig;
        },
        get callbacks() {
            return props.callbacks;
        },
        get persistState() {
            return props.persistState ?? true;
        },
        get storageKey() {
            return props.storageKey ?? "reynard-gallery-ai";
        },
    });
    return (<AIGalleryContext.Provider value={aiGallery} children={props.children}/>);
};
