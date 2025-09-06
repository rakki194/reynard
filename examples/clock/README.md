# 🦊 Reynard Clock App

A comprehensive clock, timer, alarm, and countdown application built with the Reynard framework and SolidJS.

## ✨ Features

### 🕐 Clock

- **Digital Clock** - Real-time digital display with date
- **Analog Clock** - Beautiful analog clock with animated hands
- **Theme Integration** - Seamlessly adapts to all Reynard themes
- **Real-time Updates** - Updates every second with smooth animations

### ⏱️ Timer

- **Custom Duration** - Set hours, minutes, and seconds
- **Start/Pause/Stop** - Full timer control
- **Visual Feedback** - Color-coded status indicators
- **Notifications** - Toast notifications for timer events
- **Reset Functionality** - Quick reset to original time

### ⏰ Alarm

- **Multiple Alarms** - Set and manage multiple alarms
- **Custom Labels** - Name your alarms (Wake up, Meeting, etc.)
- **Enable/Disable** - Toggle alarms on and off
- **Persistent Storage** - Alarms saved to localStorage
- **Real-time Checking** - Automatic alarm triggering
- **12/24 Hour Format** - Flexible time display

### ⏳ Countdown

- **Target Date/Time** - Count down to any future date and time
- **Event Labels** - Name your countdown events
- **Live Updates** - Real-time countdown display
- **Days/Hours/Minutes/Seconds** - Detailed time breakdown
- **Completion Notifications** - Alert when countdown finishes
- **Start/Stop/Reset** - Full countdown control

## 🎨 Theming

The app includes 6 beautiful themes:

- **☀️ Light** - Clean and bright
- **🌙 Dark** - Easy on the eyes
- **🍌 Banana** - Warm and cheerful
- **🍓 Strawberry** - Vibrant and energetic
- **🥜 Peanut** - Earthy and cozy
- **🌫️ Gray** - Professional neutral

## 🚀 Quick Start

### Installation

```bash
# Navigate to the clock app directory
cd reynard-clock-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3002` to see the application in action.

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Components

- **`App.tsx`** - Main application with tab navigation
- **`Clock.tsx`** - Digital and analog clock display
- **`Timer.tsx`** - Countdown timer functionality
- **`Alarm.tsx`** - Alarm management system
- **`Countdown.tsx`** - Event countdown timer
- **`ThemeToggle.tsx`** - Theme switching component

### Reynard Features Used

- **Theme System** - `useTheme()` for reactive theme switching
- **Notifications** - `useNotifications()` for user feedback
- **Components** - `Button`, `Card` from Reynard components
- **CSS Custom Properties** - Theme-aware styling
- **Local Storage** - Alarm persistence

## 📱 Usage

### Clock Tab

- View current time in digital format
- Toggle between digital and analog display
- See current date and day of week
- Watch smooth second hand animation

### Timer Tab

- Set custom timer duration (hours, minutes, seconds)
- Start timer with play button
- Pause and resume as needed
- Stop timer to reset to original time
- Visual status indicators (running/paused/stopped)

### Alarm Tab

- Add new alarms with custom time and label
- Enable/disable alarms with toggle button
- Delete unwanted alarms
- Alarms persist between browser sessions
- Automatic notifications when alarms trigger

### Countdown Tab

- Set target date and time for any future event
- Add descriptive labels for your countdowns
- Start countdown to begin live updates
- Stop or reset countdown as needed
- Completion notifications when target is reached

## 🎯 Key Features

### Real-time Updates

All time displays update in real-time with smooth animations and transitions.

### Responsive Design

The app works perfectly on desktop, tablet, and mobile devices with adaptive layouts.

### Accessibility

- Proper ARIA labels and keyboard navigation
- High contrast themes for better visibility
- Screen reader friendly components

### Performance

- Optimized rendering with SolidJS fine-grained reactivity
- Efficient timer intervals with proper cleanup
- Minimal bundle size with tree-shaking

### Persistence

- Alarms saved to localStorage
- Theme preferences remembered
- Settings persist between sessions

## 🧪 Technical Details

### State Management

- SolidJS signals for reactive state
- Proper cleanup of intervals and timers
- Efficient re-rendering with fine-grained reactivity

### Styling

- CSS custom properties for theming
- Responsive design with mobile-first approach
- Smooth transitions and animations
- Theme-aware color schemes

### Browser APIs

- `setInterval` for real-time updates
- `localStorage` for data persistence
- `Date` API for time calculations
- Web Notifications for alerts

## 📦 Bundle Size

- **JavaScript**: ~12 kB (gzipped)
- **CSS**: ~8 kB (gzipped)
- **Total**: ~20 kB - Fast loading and efficient!

## 🔄 Next Steps

Try extending the app with:

- **Stopwatch** - Add a stopwatch feature
- **World Clock** - Multiple timezone support
- **Pomodoro Timer** - Work/break timer cycles
- **Sound Alarms** - Audio notifications
- **Custom Themes** - User-defined color schemes
- **Export/Import** - Backup and restore alarms
- **PWA Features** - Offline support and app installation

## 🤝 Contributing

This app demonstrates the power and flexibility of the Reynard framework. Feel free to use it as a starting point for your own time-related applications!

## 📄 License

MIT License - Built with ❤️ using the Reynard framework 🦊
