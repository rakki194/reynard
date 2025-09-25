/**
 * 🤖 Transformer Animations Composable
 *
 * Specialized composable for transformer architecture animations
 * Manages strobe effects, dance floor, background animations, and component flows
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface TransformerAnimationConfig {
  strobeSpeed: number;
  danceFloorSpeed: number;
  backgroundHueSpeed: number;
  autoDanceInterval: number;
  componentPulseSpeed: number;
  flowDataSpeed: number;
}

export interface AnimationState {
  isPlaying: boolean;
  currentHue: number;
  strobeIntensity: number;
  danceFloorOpacity: number;
}

export const useTransformerAnimations = (config: Partial<TransformerAnimationConfig> = {}) => {
  const defaultConfig: TransformerAnimationConfig = {
    strobeSpeed: 300,
    danceFloorSpeed: 2000,
    backgroundHueSpeed: 100,
    autoDanceInterval: 2000,
    componentPulseSpeed: 1500,
    flowDataSpeed: 1500,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const [animationState, setAnimationState] = createSignal<AnimationState>({
    isPlaying: false,
    currentHue: 0,
    strobeIntensity: 0.1,
    danceFloorOpacity: 0.3,
  });

  const [animationIntervals, setAnimationIntervals] = createSignal<NodeJS.Timeout[]>([]);
  const [isInitialized, setIsInitialized] = createSignal(false);

  /**
   * Starts all transformer animations
   */
  const startAnimations = () => {
    console.log("startAnimations called, current state:", animationState().isPlaying);
    if (animationState().isPlaying) return;

    console.log("Starting transformer animations...");
    const intervals: NodeJS.Timeout[] = [];

    // Background hue rotation
    const hueInterval = setInterval(() => {
      setAnimationState(prev => ({
        ...prev,
        currentHue: (prev.currentHue + 1) % 360,
      }));
    }, finalConfig.backgroundHueSpeed);
    intervals.push(hueInterval);

    // Strobe intensity variation
    const strobeInterval = setInterval(() => {
      setAnimationState(prev => ({
        ...prev,
        strobeIntensity: 0.05 + Math.random() * 0.1,
      }));
    }, finalConfig.strobeSpeed);
    intervals.push(strobeInterval);

    // Dance floor opacity variation
    const danceFloorInterval = setInterval(() => {
      setAnimationState(prev => ({
        ...prev,
        danceFloorOpacity: 0.2 + Math.random() * 0.5,
      }));
    }, finalConfig.danceFloorSpeed);
    intervals.push(danceFloorInterval);

    setAnimationIntervals(intervals);
    setAnimationState(prev => ({ ...prev, isPlaying: true }));
  };

  /**
   * Stops all transformer animations
   */
  const stopAnimations = () => {
    console.log("stopAnimations called, current intervals:", animationIntervals().length);
    animationIntervals().forEach(interval => clearInterval(interval));
    setAnimationIntervals([]);
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
    console.log("Animations stopped");
  };

  /**
   * Updates animation configuration and restarts if playing
   */
  const updateConfig = (newConfig: Partial<TransformerAnimationConfig>) => {
    Object.assign(finalConfig, newConfig);

    if (animationState().isPlaying) {
      stopAnimations();
      startAnimations();
    }
  };

  /**
   * Creates a data flow animation between components
   */
  const createDataFlow = (fromElement: HTMLElement, toElement: HTMLElement, duration: number = 1000) => {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    const flowElement = document.createElement("div");
    flowElement.className = "data-flow";
    flowElement.style.position = "fixed";
    flowElement.style.left = `${fromRect.right}px`;
    flowElement.style.top = `${fromRect.top + fromRect.height / 2}px`;
    flowElement.style.width = `${Math.sqrt(Math.pow(toRect.left - fromRect.right, 2) + Math.pow(toRect.top - fromRect.top, 2))}px`;
    flowElement.style.height = "3px";
    flowElement.style.background = "linear-gradient(90deg, #00d9ff, #06ffa5)";
    flowElement.style.transformOrigin = "0 50%";
    flowElement.style.animation = `dataFlow ${duration}ms ease-in-out`;
    flowElement.style.zIndex = "1000";
    flowElement.style.pointerEvents = "none";

    document.body.appendChild(flowElement);

    setTimeout(() => {
      if (document.body.contains(flowElement)) {
        document.body.removeChild(flowElement);
      }
    }, duration);
  };

  /**
   * Creates a sequence of data flows through multiple components
   */
  const createDataFlowSequence = (components: HTMLElement[], delay: number = 200) => {
    for (let i = 0; i < components.length - 1; i++) {
      setTimeout(() => {
        createDataFlow(components[i], components[i + 1]);
      }, i * delay);
    }
  };

  /**
   * Creates a circular data flow around components
   */
  const createCircularFlow = (components: HTMLElement[], delay: number = 300) => {
    createDataFlowSequence(components, delay);

    // Complete the circle
    setTimeout(
      () => {
        if (components.length > 1) {
          createDataFlow(components[components.length - 1], components[0]);
        }
      },
      (components.length - 1) * delay
    );
  };

  /**
   * Creates a transformer attention visualization
   */
  const createAttentionVisualization = (
    queryElement: HTMLElement,
    keyElements: HTMLElement[],
    valueElements: HTMLElement[]
  ) => {
    // Create attention lines from query to keys
    keyElements.forEach((keyElement, index) => {
      setTimeout(() => {
        createDataFlow(queryElement, keyElement, 800);

        // Then flow to corresponding value
        if (valueElements[index]) {
          setTimeout(() => {
            createDataFlow(keyElement, valueElements[index], 600);
          }, 400);
        }
      }, index * 100);
    });
  };

  /**
   * Creates a transformer block processing animation
   */
  const animateTransformerBlock = (
    blockElements: HTMLElement[],
    processingOrder: string[] = ["attention", "add-norm", "feed-forward", "add-norm"]
  ) => {
    const orderedElements = processingOrder
      .map(order => blockElements.find(el => el.id.includes(order)))
      .filter(Boolean) as HTMLElement[];

    createDataFlowSequence(orderedElements, 300);
  };

  /**
   * Creates a full transformer forward pass animation
   */
  const animateForwardPass = (encoderElements: HTMLElement[], decoderElements: HTMLElement[]) => {
    // Animate encoder
    setTimeout(() => {
      animateTransformerBlock(encoderElements);
    }, 0);

    // Animate decoder after encoder
    setTimeout(() => {
      animateTransformerBlock(decoderElements);
    }, 2000);

    // Create cross-attention flow
    setTimeout(() => {
      const encoderOutput = encoderElements.find(el => el.id.includes("add-norm") && el.id.includes("2"));
      const decoderAttention = decoderElements.find(el => el.id.includes("cross-attention"));

      if (encoderOutput && decoderAttention) {
        createDataFlow(encoderOutput, decoderAttention, 1000);
      }
    }, 3000);
  };

  /**
   * Gets the current background gradient based on hue
   */
  const getBackgroundGradient = () => {
    const hue = animationState().currentHue;
    return `linear-gradient(45deg, hsl(${hue}, 100%, 5%), hsl(${hue + 60}, 100%, 8%), hsl(${hue + 120}, 100%, 10%))`;
  };

  /**
   * Gets the current strobe background
   */
  const getStrobeBackground = () => {
    const intensity = animationState().strobeIntensity;
    return `rgba(255, 255, 255, ${intensity})`;
  };

  /**
   * Gets the current dance floor opacity
   */
  const getDanceFloorOpacity = () => {
    return animationState().danceFloorOpacity;
  };

  // Initialize animations on mount
  createEffect(() => {
    if (!isInitialized()) {
      setIsInitialized(true);
      startAnimations();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    stopAnimations();
  });

  return {
    // State
    animationState,
    isInitialized,

    // Actions
    startAnimations,
    stopAnimations,
    updateConfig,
    createDataFlow,
    createDataFlowSequence,
    createCircularFlow,
    createAttentionVisualization,
    animateTransformerBlock,
    animateForwardPass,

    // Getters
    getBackgroundGradient,
    getStrobeBackground,
    getDanceFloorOpacity,

    // Config
    config: finalConfig,
  };
};
