// Point animation composable for SolidJS
import { createSignal } from "solid-js";
import type { PointAnimation, EasingType, EmbeddingPoint } from "../types";
import { interpolatePoint } from "../utils/pointInterpolation";
import { usePointTransitions } from "./usePointTransitions";

export function usePointAnimations() {
  const [pointAnimations, setPointAnimations] = createSignal<PointAnimation[]>([]);
  const transitions = usePointTransitions();

  const createReductionTransition = (
    startPoints: EmbeddingPoint[],
    endPoints: EmbeddingPoint[],
    duration: number = 1000,
    easing: EasingType = "easeInOutCubic"
  ): Promise<void> => {
    return transitions.createReductionTransition(startPoints, endPoints, duration, easing).then(() => {
      setPointAnimations([]);
    });
  };

  const getInterpolatedPoints = (originalPoints: EmbeddingPoint[]) => {
    const currentAnim = transitions.currentAnimation();
    const pointAnims = pointAnimations();
    if (!currentAnim) return originalPoints;

    return originalPoints.map(point => {
      const pointAnim = pointAnims.find(pa => pa.id === point.id);
      return pointAnim && currentAnim ? interpolatePoint(point, pointAnim, currentAnim) : point;
    });
  };

  const stopAnimations = () => {
    transitions.stopAnimations();
    setPointAnimations([]);
  };

  return {
    currentAnimation: transitions.currentAnimation,
    pointAnimations,
    isAnimationsDisabled: transitions.isAnimationsDisabled,
    createReductionTransition,
    getInterpolatedPoints,
    stopAnimations,
  };
}
