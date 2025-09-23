/**
 * 🦊 Animation System Initializer
 * 
 * Handles smart imports and initialization of animation systems
 */

/**
 * Smart import system for animation package
 */
export async function importAnimationPackage(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const animationModule = await import("reynard-animation" as string);
    return animationModule;
  } catch (error) {
    console.warn("🦊 FloatingPanel: Animation package not available, using fallback");
    return null;
  }
}

/**
 * Import fallback animation system
 */
export async function importFallbackSystem(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const fallbackModule = await import("reynard-core/composables" as string);
    return (fallbackModule as Record<string, unknown>).useAnimationFallback;
  } catch (error) {
    console.warn("🦊 FloatingPanel: Fallback system not available");
    return null;
  }
}

/**
 * Import global animation control
 */
export async function importGlobalControl(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const controlModule = await import("reynard-core/composables" as string);
    return (controlModule as Record<string, unknown>).useAnimationControl;
  } catch (error) {
    console.warn("🦊 FloatingPanel: Global animation control not available");
    return null;
  }
}

/**
 * Initialize animation system with smart imports
 */
export function createAnimationSystemInitializer(
  respectGlobalControl: boolean,
  useFallback: boolean,
  setGlobalControl: (control: unknown) => void,
  setAnimationEngine: (engine: "full" | "fallback" | "disabled") => void,
  setFallbackSystem: (system: unknown) => void
) {
  return async () => {
    try {
      // Try to import global animation control first
      if (respectGlobalControl) {
        const controlModule = await importGlobalControl();
        if (controlModule) {
          setGlobalControl(controlModule);
        }
      }

      // Try to import animation package
      const animationModule = await importAnimationPackage();
      if (animationModule) {
        setAnimationEngine("full");
        return;
      }

      // Fallback to CSS-based animations
      if (useFallback) {
        const fallbackModule = await importFallbackSystem();
        if (fallbackModule) {
          setFallbackSystem(fallbackModule);
          setAnimationEngine("fallback");
          return;
        }
      }

      // No animation system available
      setAnimationEngine("disabled");
    } catch (error) {
      console.warn("🦊 FloatingPanel: Failed to initialize animation system:", error);
      setAnimationEngine("disabled");
    }
  };
}
