import { createSignal } from "solid-js";
import { Card, Tabs, TabPanel } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";
import {
  UnionFindGame,
  CollisionGame,
  SpatialHashDemo,
  GeometryDemo,
  PerformanceDemo,
} from "reynard-games";
import "./AlgorithmsDemo.css";

export function AlgorithmsDemo() {
  const [activeDemo, setActiveDemo] = createSignal("union-find");

  const demos = [
    { id: "union-find", label: "Union-Find Game", icon: getIcon("puzzle-piece") },
    { id: "collision", label: "Collision Detection", icon: getIcon("target") },
    { id: "spatial-hash", label: "Spatial Hashing", icon: getIcon("grid") },
    { id: "geometry", label: "Geometry Operations", icon: getIcon("ruler") },
    { id: "performance", label: "Performance Monitor", icon: getIcon("speed") },
  ];

  return (
    <div class="algorithms-demo">
      <div class="demo-header">
        <h2>🧮 Algorithms Demonstration</h2>
        <p>Interactive games and visualizations showcasing Reynard's algorithm primitives</p>
      </div>

      <Tabs
        items={demos}
        activeTab={activeDemo()}
        onTabChange={setActiveDemo}
        variant="pills"
        fullWidth
        class="demo-tabs"
      >
        <TabPanel tabId="union-find" activeTab={activeDemo()}>
          <Card>
            <UnionFindGame />
          </Card>
        </TabPanel>
        
        <TabPanel tabId="collision" activeTab={activeDemo()}>
          <Card>
            <CollisionGame />
          </Card>
        </TabPanel>
        
        <TabPanel tabId="spatial-hash" activeTab={activeDemo()}>
          <Card>
            <SpatialHashDemo />
          </Card>
        </TabPanel>
        
        <TabPanel tabId="geometry" activeTab={activeDemo()}>
          <Card>
            <GeometryDemo />
          </Card>
        </TabPanel>
        
        <TabPanel tabId="performance" activeTab={activeDemo()}>
          <Card>
            <PerformanceDemo />
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}