import { type Accessor } from "solid-js";
import type { PhysicsObject, PhysicsStats } from "../types";

/**
 * Energy calculation composable for physics simulations
 * Handles kinetic and potential energy calculations
 */
export function useEnergyCalculation(
  objects: Accessor<PhysicsObject[]>,
  gravity: Accessor<number>,
  setStats: (updater: (prev: PhysicsStats) => PhysicsStats) => void
) {
  // Calculate total energy (kinetic + potential)
  const calculateTotalEnergy = () => {
    const currentObjects = objects();
    let totalEnergy = 0;

    currentObjects.forEach(obj => {
      if (!obj.isStatic) {
        const kinetic = 0.5 * obj.mass * (obj.vx * obj.vx + obj.vy * obj.vy);
        const potential = obj.mass * gravity() * (500 - obj.y);
        totalEnergy += kinetic + potential;
      }
    });

    setStats(prev => ({ ...prev, totalEnergy }));
  };

  return {
    calculateTotalEnergy,
  };
}
