---
title: eIsland Project Introduction
icon: info
---

# eIsland - Developer Introduction

eIsland is a desktop widget application for Windows that brings the Apple Dynamic Island experience to PC. The project implements a sophisticated state machine architecture to manage the island's various visual and interactive modes.

## State Machine Architecture

The core of eIsland is built around a comprehensive state machine that controls the island's appearance and behavior. The system manages **15 distinct states**, each representing a specific user interaction context:

### Primary States

| State | Description | Behavior |
|-------|-------------|----------|
| `idle` | Default resting state | Pass-through mouse events, minimal footprint |
| `minimal` | Compact display mode | Pass-through, shows essential info only |
| `hover` | Mouse interaction state | Interactive, expands on hover with delay |
| `expanded` | Full dashboard view | Interactive, shows widgets and controls |
| `maxExpand` | Maximum expansion | Full-screen panel for settings and tools |

### Content States

| State | Description | Behavior |
|-------|-------------|----------|
| `lyrics` | Music lyrics display | Pass-through, synchronized with playback |
| `notification` | Alert and message display | Interactive, shows notifications |
| `announcement` | System announcements | Interactive, displays updates |

### User Flow States

| State | Description | Behavior |
|-------|-------------|----------|
| `guide` | First-run tutorial | Interactive, guides new users |
| `login` | Authentication screen | Interactive, user login form |
| `register` | Account creation | Interactive, registration flow |
| `resetPassword` | Password recovery | Interactive, reset workflow |
| `payment` | Payment processing | Interactive, subscription handling |

### AI & Input States

| State | Description | Behavior |
|-------|-------------|----------|
| `agent` | AI assistant mode | Interactive, chat interface |
| `agentVoiceInput` | Voice command mode | Pass-through, voice recognition |
| `stt` | Speech-to-text | Interactive, transcription display |
| `cli` | Command line interface | Interactive, terminal emulation |

## State Transitions

States transition based on user interactions, system events, and application logic. Each state defines:

- **Mouse passthrough**: Whether mouse events pass to underlying windows
- **Expansion behavior**: How the island visually expands
- **Enter/Leave delays**: Timing for smooth state transitions
- **Area calculations**: Pixel dimensions for each state

## Key Features

### Music Integration
- Real-time lyrics synchronization with playback
- Support for multiple music players (NetEase, QQ Music, Kugou)
- Album art display and music controls

### Productivity Tools
- Pomodoro timer with customizable intervals
- Countdown timers for important events
- Todo list management
- Application shortcuts

### Information Display
- Weather information with location detection
- Calendar integration with lunar dates
- Performance monitoring widgets

### Entertainment
- Built-in mini-games (2048, Gomoku)
- Customizable wallpapers and themes
- Animation effects and transitions

### Communication
- Email notification monitoring
- AI-powered chat assistant
- Voice command support

## Widget System

The expanded state supports a flexible widget system with configurable layouts:

- **Left/Right panels**: Choose from shortcuts, todo, song, countdown, pomodoro, and more
- **Clock styles**: Classic, gradient, or minimal time display
- **Drag-and-drop**: Reorder widgets and application shortcuts
- **Custom backgrounds**: Support for images and videos

## Animation System

State transitions use a morphing animation system with configurable speeds:

- **Slow**: 1100ms for dramatic transitions
- **Medium**: 550ms for standard interactions
- **Fast**: 280ms for quick responses

The island smoothly animates between states, creating a fluid user experience similar to Apple's Dynamic Island.

---

For technical implementation details, refer to the source code documentation and inline comments.
