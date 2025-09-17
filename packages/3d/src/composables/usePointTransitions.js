import { createPointAnimations } from "../utils/pointInterpolation";
import { createAnimationLoop } from "../utils/animationLoop";
import { useAnimationState } from "./useAnimationState";
export function usePointTransitions() {
    const animationState = useAnimationState();
    const createReductionTransition = (startPoints, endPoints, duration = 1000, easing = "easeInOutCubic") => {
        if (animationState.isAnimationsDisabled()) {
            return Promise.resolve();
        }
        const animations = createPointAnimations(startPoints, endPoints);
        const state = animationState.createAnimationState(duration, easing);
        animationState.setCurrentAnimation(state);
        return createAnimationLoop(state, duration, easing, (progress) => {
            state.progress = progress;
            animationState.setCurrentAnimation({ ...state });
        }, () => {
            animationState.setCurrentAnimation(null);
        });
    };
    return {
        createReductionTransition,
        currentAnimation: animationState.currentAnimation,
        isAnimationsDisabled: animationState.isAnimationsDisabled,
        stopAnimations: animationState.stopAnimations,
    };
}
