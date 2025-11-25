# PDFCrypt

PDFCrypt is a secure, client-side PDF encryption Progressive Web App (PWA) built with SvelteKit, TypeScript, and QPDF WASM. It allows users to encrypt PDF files entirely in their browser without uploading to any server.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites

- Bun (use bun, bunx with --bun instead of node or npm)

### Bootstrap and Build

- Install dependencies: `bun install` -- takes 5 seconds
- Format code: `bun run format` -- fixes all prettier formatting issues
- Build the application: `bun run build` -- takes 10 seconds from clean state. NEVER CANCEL.
- Run type checking: `bun run check` -- validates TypeScript and Svelte components (currently fails due to QPDF WASM types)

### Development Workflow

- Start development server: `bun run dev` -- serves on http://localhost:5173/
- Start production preview: `bun run build && bun run preview` -- serves built app on http://localhost:4173/
- The dev server supports hot reload and the app initializes QPDF WASM module successfully

### Linting and Code Quality

- Format code: `bun run format`
- Lint code: `bun run lint`

## Application Architecture

### Key Technologies

- **SvelteKit**: Static site generator with SSR
- **TypeScript**: Type safety throughout the codebase
- **QPDF WASM**: Client-side PDF encryption using @neslinesli93/qpdf-wasm
- **Tailwind CSS + DaisyUI**: Styling framework
- **Vite PWA**: Service worker and offline functionality

### Project Structure

```
/src
  /lib
    ReloadPrompt.svelte     # PWA update notifications
  /routes
    +layout.svelte          # Main layout with navigation
    +layout.ts              # Prerender configuration
    +page.svelte            # Main PDF encryption interface
    /install
      +page.svelte          # Installation instructions page
    /privacy
      +page.svelte          # Privacy policy page
  app.css                   # Global styles
  app.d.ts                  # TypeScript declarations
  app.html                  # HTML template
/static                     # Static assets (icons, manifest, etc.)
/build                      # Built application output
```

### Core Components

- Main encryption interface (`src/routes/+page.svelte`): File upload, password inputs, advanced permissions
- QPDF WASM integration: Client-side PDF processing and encryption
- Progressive Web App features: Service worker, offline support, installability

### Build Warnings

- Large chunk size warnings are expected due to the QPDF WASM file (1.3MB)
- These warnings do not indicate a problem with the build

## Deployment Notes

- Application builds to static files in `/build` directory
- Uses `@sveltejs/adapter-static` for static site generation
- All routes are prerendered for optimal performance
- Service worker enables offline functionality
- Supports installation as PWA on various platforms
