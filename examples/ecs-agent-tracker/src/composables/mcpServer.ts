import type { MCPResponse } from "../types";

// MCP Server communication
export class MCPServer {
  // Note: requestId could be used for request tracking in the future

  public async callMCPTool(toolName: string, arguments_: Record<string, any> = {}): Promise<MCPResponse> {
    console.log(`🔧 Calling MCP tool: ${toolName}`, arguments_);
    try {
      // Try to use real MCP server first, fallback to simulation
      const result = await this.callRealMCPServer(toolName, arguments_);
      console.log(`✅ MCP tool ${toolName} succeeded:`, result);
      return result;
    } catch (error) {
      console.warn(`⚠️ Real MCP server failed for ${toolName}, falling back to simulation:`, error);
      const fallback = await this.simulateMCPCall(toolName, arguments_);
      console.log(`🔄 Fallback simulation for ${toolName}:`, fallback);
      return fallback;
    }
  }

  private async callRealMCPServer(toolName: string, arguments_: Record<string, any>): Promise<MCPResponse> {
    console.log(`🌐 Making HTTP request to /api/mcp/tools/call for ${toolName}`);

    // Connect to the FastAPI backend MCP tools endpoint
    const response = await fetch("/api/mcp/tools/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: toolName,
        params: arguments_,
      }),
    });

    console.log(`📡 HTTP response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP error response:`, errorText);
      throw new Error(`MCP server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`📊 HTTP response body:`, result);

    if (!result.success) {
      throw new Error(`MCP error: ${result.error || "Unknown error"}`);
    }

    return result.result;
  }

  private async simulateMCPCall(toolName: string, arguments_: Record<string, any>): Promise<MCPResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    switch (toolName) {
      case "get_ecs_agent_status":
        return {
          content: [
            {
              type: "text",
              text: `Total agents: 5\nMature agents: 3\nAutomatic reproduction: enabled`,
            },
          ],
        };

      case "get_ecs_agent_positions":
        // Return mock position data
        const mockPositions = [
          {
            id: "agent-1",
            name: "Strategic-Fox-7",
            spirit: "fox",
            style: "foundation",
            position: { x: 150, y: 200 },
            target: { x: 180, y: 220 },
          },
          {
            id: "agent-2",
            name: "Pack-Wolf-12",
            spirit: "wolf",
            style: "exo",
            position: { x: 300, y: 150 },
            target: { x: 320, y: 170 },
          },
          {
            id: "agent-3",
            name: "Playful-Otter-3",
            spirit: "otter",
            style: "hybrid",
            position: { x: 450, y: 300 },
            target: { x: 470, y: 320 },
          },
          {
            id: "agent-4",
            name: "Soaring-Eagle-9",
            spirit: "eagle",
            style: "mythological",
            position: { x: 600, y: 100 },
            target: { x: 620, y: 120 },
          },
          {
            id: "agent-5",
            name: "Regal-Lion-15",
            spirit: "lion",
            style: "scientific",
            position: { x: 750, y: 250 },
            target: { x: 770, y: 270 },
          },
        ];
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(mockPositions),
            },
          ],
        };

      case "create_ecs_agent":
        const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return {
          content: [
            {
              type: "text",
              text: `Created ECS agent ${agentId} with entity ${agentId}`,
            },
          ],
        };

      case "create_ecs_offspring":
        const offspringId = `offspring-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return {
          content: [
            {
              type: "text",
              text: `Created ECS offspring ${offspringId} from parents ${arguments_.parent1_id} and ${arguments_.parent2_id}`,
            },
          ],
        };

      case "get_simulation_status":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                simulation_time: Date.now() / 1000,
                time_acceleration: 1.0,
                total_agents: 5,
                mature_agents: 3,
                agent_personas: 5,
                lora_configs: 5,
              }),
            },
          ],
        };

      case "accelerate_time":
        return {
          content: [
            {
              type: "text",
              text: `Time acceleration set to ${arguments_.factor}x`,
            },
          ],
        };

      case "enable_automatic_reproduction":
        return {
          content: [
            {
              type: "text",
              text: `Automatic reproduction ${arguments_.enabled ? "enabled" : "disabled"}`,
            },
          ],
        };

      case "update_ecs_world":
        return {
          content: [
            {
              type: "text",
              text: `ECS world updated with delta_time=${arguments_.delta_time}`,
            },
          ],
        };

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${toolName}`,
            },
          ],
        };
    }
  }
}
