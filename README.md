# 🔬 Algo Ameba

> Interactive, step-by-step algorithm visualizer built for learning and debugging. Powered by React, GSAP, and D3.

Algo Ameba visualizes algorithms with **frame-by-frame animations**, letting you see exactly how each step works. Not just final results—every comparison, swap, and operation is animated in real-time.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **Step-by-Step Animations**: Watch algorithms execute frame-by-frame with smooth, timed GSAP animations
- **Interactive Controls**: Play, pause, skip, and adjust speed for any visualization
- **Dark/Light Theme**: Toggle between light and dark modes with persistent preference
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Clean Architecture**: Modular algorithm components with registry-based routing
- **Real-Time Visualization**: Custom SVG rendering with D3 for hierarchical data structures

---

## 📚 Algorithms & Data Structures

### Sorting Algorithms

- **Bubble Sort** - Simple comparison-based sort with visual swaps
- **Selection Sort** - Find minimum and place in correct position
- **Insertion Sort** - Build sorted array element by element
- **Merge Sort** - Divide-and-conquer with tree-style split/merge visualization
- **Quick Sort** - Partitioning-based sort with pivot selection

### Searching Algorithms

- **Linear Search** - Sequential search with step highlighting
- **Binary Search** - Divide-and-conquer with range reduction visualization

### Data Structures

- **Stack** - LIFO operations with push, pop, and peek
- **Queue** - FIFO operations with enqueue, dequeue, and peek
- **Linked List** - Singly, doubly, and circular variants with insert/delete/traverse
- **Binary Search Tree** - Insert, delete, and tree traversals (inorder, preorder, postorder)
- **Heap** - Min/max heap with push, pop, and heapify operations
- **Graph** - BFS, DFS traversals with node/edge visualization

---

## 🛠 Tech Stack

| Layer             | Technology                                        |
| ----------------- | ------------------------------------------------- |
| **Frontend**      | React 19.1.0, TypeScript 5.8.3                    |
| **Routing**       | React Router 7.6.3                                |
| **Animation**     | GSAP 3.13.0 + @gsap/react 2.1.2, ScrollTrigger    |
| **Visualization** | D3 7.9.0, Custom SVG                              |
| **Styling**       | Tailwind CSS 4.1.11, Radix UI                     |
| **UI Components** | shadcn/ui (button, input, select, dropdown, etc.) |
| **Notifications** | Sonner (toast notifications)                      |
| **Build Tool**    | Vite 7.0.0                                        |
| **Linting**       | ESLint                                            |

---

## 📂 Project Structure

```
algo-ameba/
├── src/
│   ├── components/
│   │   ├── SharedLayout.tsx          # Shared visualizer container
│   │   ├── ControllerFooter.tsx      # Play, pause, speed, next/prev controls
│   │   ├── Navbar.tsx                # Navigation header
│   │   ├── search/
│   │   │   ├── SearchPage.tsx        # UI shell
│   │   │   └── searchAlgorithms.ts   # Algorithm implementations
│   │   ├── sort/
│   │   │   ├── SortPage.tsx          # UI shell
│   │   │   └── SortAlgos.ts          # Algorithm implementations
│   │   ├── stack/
│   │   ├── queue/
│   │   ├── linkedlist/
│   │   ├── tree/                     # BST with D3 layout
│   │   ├── heap/                     # Min/max heap with D3
│   │   ├── graph/                    # BFS/DFS with force simulation
│   │   ├── ui/                       # Radix UI components
│   │   └── visualizer/               # Shared visualizer utilities
│   ├── pages/
│   │   ├── LandingPage.tsx           # Marketing landing with GSAP animations
│   │   ├── Homepage.tsx              # Algorithm catalog
│   │   └── AboutPage.tsx             # Project info
│   ├── hooks/
│   │   ├── useSearchVizulizer.tsx    # Search/sort state & controls
│   │   └── useDimensions.ts          # Responsive sizing
│   ├── constants/
│   │   ├── routes.ts                 # Centralized route paths
│   │   └── algosInfo.ts              # Algorithm metadata
│   ├── App.tsx                       # React Router setup
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Global styles & theme variables
│   └── gsapSetup.ts                  # GSAP plugin registration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/algo-ameba.git
cd algo-ameba

# Install dependencies
npm install
```

### Development

```bash
# Start dev server (hot reload at http://localhost:5173)
npm run dev
```

### Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint --fix
```

### Build Verification

```bash
npm run build
# Should complete successfully with no TypeScript errors
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-algorithm`)
3. **Follow** the architecture principles in [AGENTS.md](./AGENTS.md)
4. **Add** your algorithm with frame-based animation
5. **Test** thoroughly (build passes, visualizer works, controls respond)
6. **Submit** a pull request

### Guidelines

- Keep algorithms modular in dedicated files
- Use the frame-based pipeline for consistency
- Add comments for non-obvious logic
- Ensure TypeScript compiles without warnings

See [AGENTS.md](./AGENTS.md) for detailed development guidelines.

---

## 📝 License

MIT License - see LICENSE file for details

**Happy learning! 🚀**
