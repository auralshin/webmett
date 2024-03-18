
## Webmett 

Video conferencing app

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure

The application is organized into the following directories and files:

- `.next/`: The default build directory for Next.js.
- `.vercel/`: Configuration and source files for Vercel deployments.
- `node_modules/`: Contains all the npm packages that the project depends on.
- `public/`: Static files like images that can be accessed directly.
- `src/`: Source code of the application.

Within the `src` directory:

- `components/`: Reusable UI components.
  - `chat.js`: The chat interface component.
  - `navbar.js`: The navigation bar component.

- `hooks/`: Custom React hooks.
  - `useSocket.js`: Hook for WebSocket connections.

- `pages/`: The pages of the Next.js app.
  - `api/`: Backend API routes.
    - `socket.js`: WebSocket event handlers.
  - `meet/`: Directory for chat meet pages.
    - `[id].js`: Dynamic route for individual chat meets.
  - `_app.js`: The custom App component.
  - `_document.js`: The custom Document component.
  - `index.js`: The homepage of the application.

- `store/`: State management using hooks or any other state management library.
  - `useMessage.js`: State management for messages.

- `styles/`: CSS files for styling the application.
- `utils/`: Utility functions and constants.
  - `constants.js`: Defines constants used across the application.


## Installation

To set up the project for development:

```bash
npm i
# or
yarn
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
