import "./PerformanceDemo.css";
interface PerformanceDemoConfig {
    testDuration?: number;
    objectCount?: number;
    canvasWidth?: number;
    canvasHeight?: number;
}
interface PerformanceDemoProps {
    config?: PerformanceDemoConfig;
}
export declare function PerformanceDemo(_props?: PerformanceDemoProps): any;
export {};
