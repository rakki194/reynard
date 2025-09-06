import { Component } from "solid-js";

const TestApp: Component = () => {
  console.log("🎮 TestApp component created");
  
  return (
    <div style="padding: 20px; color: white; background: #333;">
      <h1>🦊 Test App</h1>
      <p>If you can see this, the basic app is working!</p>
      <p>Timestamp: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

console.log("📝 TestApp component defined");
export default TestApp;
