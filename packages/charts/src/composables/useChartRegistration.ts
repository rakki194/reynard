/**
 * Chart Registration Composable
 * Handles Chart.js component registration
 */

import { createSignal, onMount } from "solid-js";
import { Chart, Title, Tooltip, Legend, BarController, CategoryScale, LinearScale, BarElement } from "chart.js";

export const useChartRegistration = () => {
  const [isRegistered, setIsRegistered] = createSignal(false);

  onMount(() => {
    Chart.register(Title, Tooltip, Legend, BarController, CategoryScale, LinearScale, BarElement);
    setIsRegistered(true);
  });

  return { isRegistered };
};
