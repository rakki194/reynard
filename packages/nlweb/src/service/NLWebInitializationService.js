/**
 * NLWeb Initialization Service
 *
 * Handles service initialization and shutdown logic for the NLWeb service.
 */
export class NLWebInitializationService {
    constructor(configuration, eventEmitter) {
        Object.defineProperty(this, "configuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: configuration
        });
        Object.defineProperty(this, "eventEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventEmitter
        });
    }
    /**
     * Initialize the service
     */
    async initialize(router, toolRegistrationService) {
        try {
            // Initialize the router
            await router.initialize();
            // Register default tools if configuration is enabled
            if (this.configuration.enabled) {
                await toolRegistrationService.registerDefaultTools();
            }
            this.emitEvent("health_check", { status: "initialized" });
        }
        catch (error) {
            this.emitEvent("error", {
                error: error instanceof Error ? error.message : String(error),
                phase: "initialization",
            });
            throw error;
        }
    }
    /**
     * Shutdown the service
     */
    async shutdown(router) {
        try {
            await router.shutdown();
            this.emitEvent("health_check", { status: "shutdown" });
        }
        catch (error) {
            this.emitEvent("error", {
                error: error instanceof Error ? error.message : String(error),
                phase: "shutdown",
            });
            throw error;
        }
    }
    /**
     * Emit an event
     */
    emitEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data,
        };
        this.eventEmitter.emit(event);
    }
}
