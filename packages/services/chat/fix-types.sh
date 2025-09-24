#!/bin/bash

# Fix remaining parameter type issues in chat package

# Fix P2PMessage component
sed -i 's/(timestamp) =>/(timestamp: any) =>/g' src/components/P2PMessage.tsx
sed -i 's/(reaction) =>/(reaction: any) =>/g' src/components/P2PMessage.tsx
sed -i 's/(emoji) =>/(emoji: any) =>/g' src/components/P2PMessage.tsx
sed -i 's/(action) =>/(action: any) =>/g' src/components/P2PMessage.tsx
sed -i 's/(progress) =>/(progress: any) =>/g' src/components/P2PMessage.tsx

# Fix RoomList component
sed -i 's/(room) =>/(room: any) =>/g' src/components/RoomList.tsx
sed -i 's/(timestamp) =>/(timestamp: any) =>/g' src/components/RoomList.tsx
sed -i 's/(type) =>/(type: any) =>/g' src/components/RoomList.tsx
sed -i 's/(p) =>/(p: any) =>/g' src/components/RoomList.tsx

# Fix UserList component
sed -i 's/(status) =>/(status: any) =>/g' src/components/UserList.tsx
sed -i 's/(lastSeen) =>/(lastSeen: any) =>/g' src/components/UserList.tsx
sed -i 's/(u) =>/(u: any) =>/g' src/components/UserList.tsx

# Fix P2PChatExample
sed -i 's/(room) =>/(room: any) =>/g' src/examples/P2PChatExample.tsx
sed -i 's/(message) =>/(message: any) =>/g' src/examples/P2PChatExample.tsx
sed -i 's/(error) =>/(error: any) =>/g' src/examples/P2PChatExample.tsx
sed -i 's/(content) =>/(content: any) =>/g' src/examples/P2PChatExample.tsx
sed -i 's/(userId) =>/(userId: any) =>/g' src/examples/P2PChatExample.tsx

echo "Fixed parameter type issues"
