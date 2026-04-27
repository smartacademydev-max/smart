# smart

A modern React application built with TypeScript, Material-UI, and RTK Query for efficient state management and API handling.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.16.0 or higher
- **npm**: 11.6.0 or higher

Check your versions:

```bash
node -v
npm -v
```

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone git@gitlab.makuracreations.xyz:arjunjhukal/smart.git ./
cd smart
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## 📁 Project Structure

```
smart/
├── public/
│   └── languages/           # i18n translation files
│       ├── en/
│       ├── ne/
│       └── ...
├── src/
│   ├── components/        # Reusable UI components
│   ├── routes/           # Route definitions and path constants
│   │   └── PATH.ts      # Centralized path configuration
│   ├── services/         # RTK Query API services
│   │   └── ...         # API endpoint definitions
│   ├── slice/            # RTK Query slices for local state
│   ├── theme/            # Theme configuration
│   │   └── index.ts      # MUI theme setup and color palette
│   ├── utils/         # Global handlers and utilities
│   ├── styles/           # Pure CSS files
│   └── App.tsx           # Main application component
└── package.json
```

### Key Directories

- **`public/languages/`**: Contains all internationalization (i18n) translation files organized by language
- **`routes/`**: Route configuration and path constants for navigation
- **`services/`**: RTK Query API services for handling all HTTP requests
- **`slice/`**: Redux Toolkit slices for local state management
- **`theme/`**: Material-UI theme customization including color palettes and component overrides
- **`providers/`**: Global providers for theme, i18n, Redux store, etc.
- **`handlers/`**: Global utility functions and event handlers

## 🎨 Styling

This project uses a combination of:

- **Pure CSS**: Custom styles for specific components
- **Material-UI (MUI)**: Component library with custom theming
- **Theme Configuration**: Centralized in `theme/index.ts` for consistent design system

## 🔌 State Management & API

- **RTK Query**: Handles all API requests and server state
- **Redux Toolkit Slices**: Manages local/client state
- **Services Directory**: Contains all API endpoint definitions

## 🌐 Internationalization

The application supports multiple languages:

- Translation files are located in `public/languages/`
- Organized by language code (e.g., `en/`, `ne/`)

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
```

## 🛠️ Tech Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router** - Routing
- **i18next** - Internationalization

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=your_api_url
VITE_APP_URL=live_site_url
```

### Theme Customization

Modify `src/theme/index.ts` to customize:

- Color palette
- Typography
- Component styles
- Breakpoints
- Spacing

## 📝 Development Guidelines

### Adding New Routes

1. Define path constants in `src/routes/paths.ts`
2. Create route components
3. Register routes in your router configuration

### Creating API Services

1. Define endpoints in `src/services/`
2. Use RTK Query's `createApi` for type-safe API calls
3. Export hooks for component usage

### Managing State

- **Server State**: Use RTK Query in `services/`
- **Client State**: Create slices in `slice/` directory
- **Global State**: Use Redux Toolkit

## 🤝 Contributing

1. Create a feature branch prefix with feature/
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## 📄 License

## 👥 Team

For more information, please contact [arjunjhukal.makura@gmail.com]
