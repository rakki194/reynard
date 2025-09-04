/**
 * Mock Backend Service for Chat Demo
 *
 * Simulates real backend functionality for both AI assistant and P2P chat
 * without requiring actual server setup.
 */

interface MockMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: number;
  streaming?: {
    isStreaming: boolean;
    isThinking: boolean;
    currentContent: string;
    currentThinking: string;
    chunks: any[];
  };
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: any;
    status: "pending" | "running" | "completed" | "failed";
    result?: any;
  }>;
}

interface MockUser {
  id: string;
  name: string;
  status: "online" | "away" | "busy" | "offline";
  avatar?: string;
}

interface MockRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "public" | "private";
  participants: MockUser[];
  messages: MockMessage[];
}

class MockBackendService {
  private assistantMessages: MockMessage[] = [];
  private p2pRooms: Map<string, MockRoom> = new Map();
  private onlineUsers: Set<string> = new Set();
  private websocketHandlers: Set<(event: any) => void> = new Set();

  async initialize() {
    // Initialize with some sample data
    this.setupSampleData();
    this.startRealtimeSimulation();
  }

  private setupSampleData() {
    // Add some initial assistant conversation
    this.assistantMessages = [
      {
        id: "welcome-1",
        role: "assistant",
        content: `# Welcome to Reynard Chat! 🦊

I'm your AI assistant, powered by advanced language models. I can help you with:

- **Code generation** and debugging
- **Writing** and content creation  
- **Analysis** and problem-solving
- **Research** and explanations
- **Creative tasks** and brainstorming

I support **streaming responses** with thinking sections, **tool integration**, and **markdown formatting**.

What would you like to explore today?`,
        timestamp: Date.now() - 600000, // 10 minutes ago
      },
    ];

    // Setup sample P2P rooms
    const sampleUsers: MockUser[] = [
      { id: "user-1", name: "Demo User", status: "online", avatar: "👤" },
      { id: "user-2", name: "Alice Smith", status: "online", avatar: "👩" },
      { id: "user-3", name: "Bob Johnson", status: "away", avatar: "👨" },
      { id: "user-4", name: "Carol Davis", status: "online", avatar: "👩‍💼" },
      { id: "user-5", name: "Dev Lead", status: "busy", avatar: "👨‍💻" },
    ];

    this.p2pRooms.set("room-general", {
      id: "room-general",
      name: "General",
      type: "public",
      participants: sampleUsers.slice(0, 4),
      messages: [
        {
          id: "p2p-1",
          role: "user",
          content: "Hey everyone! 👋 Welcome to the Reynard chat demo!",
          timestamp: Date.now() - 900000,
        },
        {
          id: "p2p-2",
          role: "user",
          content: "This is amazing! The real-time features work perfectly.",
          timestamp: Date.now() - 600000,
        },
        {
          id: "p2p-3",
          role: "user",
          content:
            "I love how it integrates with the AI assistant. We can collaborate on AI-generated content! 🤖✨",
          timestamp: Date.now() - 300000,
        },
      ],
    });

    this.p2pRooms.set("room-dev", {
      id: "room-dev",
      name: "Development",
      type: "private",
      participants: [sampleUsers[0], sampleUsers[1], sampleUsers[4]],
      messages: [
        {
          id: "dev-1",
          role: "user",
          content:
            "The streaming markdown parser is working great! Here's some code:\n\n```typescript\nconst parser = new StreamingMarkdownParser();\nconst result = parser.parseChunk(chunk);\n```",
          timestamp: Date.now() - 1800000,
        },
        {
          id: "dev-2",
          role: "user",
          content:
            "Nice! The thinking sections really help understand the AI's reasoning process.",
          timestamp: Date.now() - 1200000,
        },
      ],
    });

    // Mark users as online
    sampleUsers.forEach((user) => {
      if (user.status === "online") {
        this.onlineUsers.add(user.id);
      }
    });
  }

  private startRealtimeSimulation() {
    // Simulate occasional activity
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.simulateTypingActivity();
      }
    }, 5000);

    setInterval(() => {
      if (Math.random() > 0.9) {
        this.simulateUserStatusChange();
      }
    }, 10000);
  }

  private simulateTypingActivity() {
    const rooms = Array.from(this.p2pRooms.keys());
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const room = this.p2pRooms.get(randomRoom);

    if (room) {
      const randomUser =
        room.participants[Math.floor(Math.random() * room.participants.length)];

      // Send typing start event
      this.broadcastToRoom(randomRoom, {
        type: "typing_start",
        roomId: randomRoom,
        user: randomUser,
        timestamp: Date.now(),
      });

      // Send typing stop after 3 seconds
      setTimeout(() => {
        this.broadcastToRoom(randomRoom, {
          type: "typing_stop",
          roomId: randomRoom,
          user: randomUser,
          timestamp: Date.now(),
        });
      }, 3000);
    }
  }

  private simulateUserStatusChange() {
    const statuses = ["online", "away", "busy"] as const;
    const users = Array.from(this.p2pRooms.values())
      .flatMap((room) => room.participants)
      .filter(
        (user, index, array) =>
          array.findIndex((u) => u.id === user.id) === index,
      );

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

    randomUser.status = newStatus;

    this.broadcastGlobally({
      type: "user_status_changed",
      user: randomUser,
      timestamp: Date.now(),
    });
  }

  private broadcastToRoom(roomId: string, event: any) {
    this.websocketHandlers.forEach((handler) => handler(event));
  }

  private broadcastGlobally(event: any) {
    this.websocketHandlers.forEach((handler) => handler(event));
  }

  // Assistant Chat API
  async sendAssistantMessage(content: string): Promise<MockMessage> {
    const userMessage: MockMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    this.assistantMessages.push(userMessage);

    // Simulate AI response with streaming
    const assistantMessage = await this.generateAssistantResponse(content);
    this.assistantMessages.push(assistantMessage);

    return assistantMessage;
  }

  private async generateAssistantResponse(
    userContent: string,
  ): Promise<MockMessage> {
    const responses = [
      {
        thinking:
          "The user is asking about React patterns. I should provide a comprehensive overview with examples and best practices.",
        content: `# React Patterns Overview

Great question! Here are some essential React patterns:

## 1. Custom Hooks
\`\`\`javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}
\`\`\`

## 2. Compound Components
This pattern allows for flexible APIs:
\`\`\`jsx
<Tabs>
  <TabList>
    <Tab>Home</Tab>
    <Tab>About</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Home content</TabPanel>
    <TabPanel>About content</TabPanel>
  </TabPanels>
</Tabs>
\`\`\`

## 3. Render Props
Share logic between components:
\`\`\`jsx
<DataProvider
  render={({ data, loading }) => (
    loading ? <Spinner /> : <DataList data={data} />
  )}
/>
\`\`\`

These patterns help create **reusable**, **maintainable**, and **flexible** React applications! 🚀`,
        tools: [],
      },
      {
        thinking:
          "This looks like a request for help with code. I should analyze the problem and provide a solution with explanation.",
        content: `# Code Analysis & Solution

I can help you debug that! Let me analyze the issue:

## Problem Analysis
The error suggests there's an issue with state management. Here's what's likely happening:

\`\`\`javascript
// Problematic code:
const [data, setData] = useState([]);

useEffect(() => {
  // This creates an infinite loop!
  setData(prevData => [...prevData, newItem]);
}, [data]); // ❌ data in dependency array
\`\`\`

## Solution
\`\`\`javascript
// Fixed version:
const [data, setData] = useState([]);

useEffect(() => {
  fetchData().then(newData => {
    setData(newData);
  });
}, []); // ✅ Empty dependency array

// Or use callback pattern:
const addItem = useCallback((newItem) => {
  setData(prev => [...prev, newItem]);
}, []);
\`\`\`

The key is to **avoid infinite re-renders** by carefully managing dependencies! 

Would you like me to review your specific code?`,
        tools: [
          {
            name: "code_analyzer",
            arguments: { language: "javascript", code: userContent },
            result:
              "Code analysis completed - found potential infinite loop in useEffect",
          },
        ],
      },
      {
        thinking:
          "The user wants creative writing help. I should provide an engaging story with good structure and vivid details.",
        content: `# The Time-Traveling Developer

*A short story by AI*

## Chapter 1: The Commit

Sarah stared at her terminal, the green cursor blinking mockingly at the end of her latest commit message: \`git commit -m "Fix temporal paradox in user authentication"\`

She hit enter, expecting the usual Git response. Instead, her screen flickered, and suddenly she was sitting in the same chair, at the same desk, but something was... different.

The coffee mug beside her keyboard now bore the logo of a company she'd never heard of: **"ChronoSoft - Debugging Tomorrow, Today"**

## Chapter 2: The Realization

"Status meeting in 5 minutes!" called a voice from across the office. Sarah looked up to see herself - or rather, another version of herself - walking toward a conference room filled with floating holographic displays.

*"When did we get holographic monitors?"* she wondered, then noticed the date on her screen: **March 15, 2025**.

## Chapter 3: The Bug

In the meeting, her future self was explaining a critical bug: "The authentication system is creating temporal loops. Every time a user logs in, they're authenticated in the past, present, and future simultaneously."

Sarah realized with growing horror that her commit hadn't just fixed a bug - it had somehow transported her into a future where that bug was still being debugged by... herself.

*"I need to get back,"* she thought, *"and I think I know how..."*

**To be continued...** ⏰✨

*Would you like me to continue this story or help you write your own?*`,
        tools: [],
      },
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    // Simulate thinking and streaming
    return new Promise((resolve) => {
      setTimeout(
        () => {
          const message: MockMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: response.content,
            timestamp: Date.now(),
            streaming: {
              isStreaming: false,
              isThinking: false,
              currentContent: response.content,
              currentThinking: response.thinking,
              chunks: [],
            },
            toolCalls: response.tools.map((tool, index) => ({
              id: `tool-${Date.now()}-${index}`,
              name: tool.name,
              arguments: tool.arguments,
              status: "completed" as const,
              result: tool.result,
            })),
          };
          resolve(message);
        },
        1000 + Math.random() * 2000,
      ); // 1-3 second delay
    });
  }

  getAssistantMessages(): MockMessage[] {
    return this.assistantMessages;
  }

  // P2P Chat API
  async sendP2PMessage(
    roomId: string,
    content: string,
    userId: string,
  ): Promise<MockMessage> {
    const room = this.p2pRooms.get(roomId);
    if (!room) throw new Error("Room not found");

    const message: MockMessage = {
      id: `p2p-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    room.messages.push(message);

    // Broadcast to room
    this.broadcastToRoom(roomId, {
      type: "message_sent",
      message,
      timestamp: Date.now(),
    });

    return message;
  }

  getRoomMessages(roomId: string): MockMessage[] {
    const room = this.p2pRooms.get(roomId);
    return room ? room.messages : [];
  }

  getRooms(): MockRoom[] {
    return Array.from(this.p2pRooms.values());
  }

  getOnlineUsers(): MockUser[] {
    return Array.from(this.p2pRooms.values())
      .flatMap((room) => room.participants)
      .filter(
        (user, index, array) =>
          array.findIndex((u) => u.id === user.id) === index &&
          this.onlineUsers.has(user.id),
      );
  }

  // WebSocket simulation
  addWebSocketHandler(handler: (event: any) => void) {
    this.websocketHandlers.add(handler);
  }

  removeWebSocketHandler(handler: (event: any) => void) {
    this.websocketHandlers.delete(handler);
  }

  // Tool execution simulation
  async executeTool(toolName: string, args: any): Promise<any> {
    const tools = {
      calculator: (expression: string) => {
        try {
          // Simple calculator simulation
          const result = eval(expression.replace(/[^0-9+\-*/().]/g, ""));
          return { result, expression };
        } catch {
          return { error: "Invalid expression" };
        }
      },
      weather: (location: string) => ({
        location,
        temperature: Math.round(Math.random() * 30 + 10) + "°C",
        condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.round(Math.random() * 40 + 30) + "%",
      }),
      search: (query: string) => ({
        query,
        results: [
          {
            title: "Result 1",
            url: "https://example.com/1",
            snippet: "First search result...",
          },
          {
            title: "Result 2",
            url: "https://example.com/2",
            snippet: "Second search result...",
          },
          {
            title: "Result 3",
            url: "https://example.com/3",
            snippet: "Third search result...",
          },
        ],
      }),
    };

    const tool = tools[toolName as keyof typeof tools];
    if (!tool) throw new Error(`Tool ${toolName} not found`);

    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    return tool(args);
  }
}

export const mockBackendService = new MockBackendService();
