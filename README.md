# Se naturen
A continuation of my second semester project for computer science at AAU, where I build a small web-app to view outdorr-related facilities in Denmark. The project was originally written in pure JavaScript, but with the help of Google Gemini it was swiftly converted to Typescript.

## Building and running
Please note that the build and run isntructions has been written by Google Gemini.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (The project uses pnpm for dependency management)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```

## 🛠️ Development

To start the development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

## 🏗️ Building for Production

To create an optimized production build:

```bash
pnpm build
```

The build artifacts will be located in the `dist/` directory, ready to be deployed to GitHub Pages or any static hosting service.

## 🔍 Previewing the Build

To preview the production build locally:

```bash
pnpm preview
```

## 🧪 Project Structure

- `src/`: Contains all TypeScript source code.
  - `JS/`: Core logic modules (map handling, state management, etc.).
  - `CSS/`: Application stylesheets.
  - `GPX/`: GPX export and handling logic.
- `public/`: Static assets such as icons.
- `index.html`: Main entry point for the application.
- `vite.config.ts`: Vite configuration.
- `tsconfig.json`: TypeScript configuration.

## 📝 Technical Note

The migration from legacy JavaScript to TypeScript and the implementation of the Vite build system was performed by **Google Gemini**.
