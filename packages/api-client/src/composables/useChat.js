/**
 * Chat composable for Reynard API
 */
import { createSignal } from "solid-js";
export function useChat(options = {}) {
    const [isLoading, setIsLoading] = createSignal(false);
    const sendMessage = async (request) => {
        setIsLoading(true);
        try {
            // Stub implementation
            console.log("Sending chat message:", request);
            return {
                success: true,
                response: "This is a stub response",
                model: request.model || "llama3.1",
                processingTime: 1.0,
            };
        }
        finally {
            setIsLoading(false);
        }
    };
    const getModels = async () => {
        // Stub implementation
        return ["llama3", "mistral", "codellama"];
    };
    return {
        isLoading,
        sendMessage,
        getModels,
    };
}
