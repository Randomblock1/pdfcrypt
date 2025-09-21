# PDFCrypt

PDFCrypt is a secure, client-side PDF encryption Progressive Web App (PWA) built with SvelteKit, TypeScript, and QPDF WASM. It allows users to encrypt PDF files entirely in their browser without uploading to any server.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites

- Node.js v20+ (current project uses v20.19.5)
- npm v10+ (current project uses v10.8.2)

### Bootstrap and Build

- Install dependencies: `npm install` -- takes 5 seconds
- Format code: `npm run format` -- fixes all prettier formatting issues
- Build the application: `npm run build` -- takes 10 seconds from clean state. NEVER CANCEL.
- Run type checking: `npm run check` -- validates TypeScript and Svelte components (currently fails due to QPDF WASM types)

### Development Workflow

- Start development server: `npm run dev` -- serves on http://localhost:5173/
- Start production preview: `npm run preview` -- serves built app on http://localhost:4173/
- The dev server supports hot reload and the app initializes QPDF WASM module successfully

### Linting and Code Quality

- Format code: `npm run format` -- uses Prettier to format all files
- **IMPORTANT**: `npm run lint` currently fails due to ESLint circular dependency issue in the configuration. This is a known issue that does not affect the build process.
- Always run `npm run format` before committing changes
- Use prettier for code formatting, not ESLint for this project

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

## Validation and Testing

### Manual Testing Scenarios

After making changes, ALWAYS test these scenarios:

1. **Basic file encryption**:
    - Start dev server: `npm run dev`
    - Navigate to http://localhost:5173/
    - Verify the "Choose File" button appears
    - Enter a user password
    - Confirm encryption button becomes enabled

2. **Advanced permissions**:
    - Toggle "Advanced Permissions" checkbox
    - Verify owner password field appears
    - Test all permission checkboxes and the printing dropdown
    - Confirm owner password requirement message appears

3. **Navigation**:
    - Test navigation to /install page
    - Test navigation to /privacy page
    - Verify all navigation links work

4. **Production build**:
    - Build application: `npm run build`
    - Start preview: `npm run preview`
    - Test on http://localhost:4173/
    - Verify application works identically to dev mode

### Build Validation

- Clean build from scratch: `rm -rf build .svelte-kit && npm run build`
- Build output size: Client bundle ~2.5MB (includes 1.3MB QPDF WASM file)
- Build warnings about large chunks are expected due to QPDF WASM
- PWA service worker and workbox files are generated automatically

## Common Tasks and Commands

### Development Commands

```bash
# Start fresh development
npm install && npm run dev

# Clean rebuild
rm -rf build .svelte-kit && npm run build

# Format and prepare for commit
npm run format

# Full development workflow
npm install && npm run format && npm run build && npm run dev
```

### Key Files to Watch

- `src/routes/+page.svelte`: Main application logic and UI
- `vite.config.ts`: Build configuration and PWA settings
- `svelte.config.js`: SvelteKit configuration
- `package.json`: Dependencies and scripts
- `static/manifest.webmanifest`: PWA manifest

### Build Artifacts

- `/build`: Final static site output for deployment
- `/.svelte-kit`: SvelteKit build cache and temporary files
- Service worker files: `sw.js` and `workbox-*.js`

## Known Issues and Limitations

### ESLint Configuration

- `npm run lint` fails with circular dependency error in ESLint configuration
- This does not affect the build process or application functionality
- Use `npm run format` for code formatting instead
- The issue is related to ESLint v9 compatibility with the current plugin configuration

### TypeScript Checking

- `npm run check` shows one error related to QPDF WASM module types
- This is a known limitation with the @neslinesli93/qpdf-wasm package types
- The error does not prevent the application from working correctly

### Build Warnings

- Large chunk size warnings are expected due to the QPDF WASM file (1.3MB)
- These warnings do not indicate a problem with the build

## Deployment Notes

- Application builds to static files in `/build` directory
- Uses `@sveltejs/adapter-static` for static site generation
- All routes are prerendered for optimal performance
- Service worker enables offline functionality
- Supports installation as PWA on various platforms

## Performance Expectations

- `npm install`: 5 seconds
- `npm run build`: 10 seconds from clean state
- `npm run format`: Near-instant
- Development server startup: 1-2 seconds
- QPDF WASM module initialization: < 1 second in browser

NEVER CANCEL build commands - they complete quickly for this project.
