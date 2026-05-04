# greenhouse_web — CLAUDE.md

AI assistant guide for the OpenGreenhouseManager Angular frontend.

## Overview

Angular 21 single-page application providing the web interface for the greenhouse management system. Communicates with the `greenhouse_backend` via `/api/**` proxied endpoints.

## Technology Stack

- **Framework**: Angular 21 (standalone components, no NgModules)
- **Language**: TypeScript 5.9
- **UI library**: PrimeNG 21 + PrimeIcons 7
- **Styling**: Tailwind CSS v4 (PostCSS-based) + SCSS
- **Dashboard layout**: angular-gridster2
- **Charts**: Chart.js 4
- **Date handling**: date-fns 4
- **Cookie management**: ngx-cookie-service
- **Testing**: Vitest 4 + Playwright (Chromium)
- **Linting**: ESLint 9 (flat config in `eslint.config.mjs`) + `@angular-eslint`
- **Formatting**: Prettier 3
- **Pre-commit hooks**: Husky + lint-staged
- **Node version**: 24 (see `.nvmrc`)
- **Package manager**: npm

## Repository Layout

```
greenhouse_web/
├── angular.json            # Angular CLI workspace config
├── package.json            # npm scripts and dependencies
├── tsconfig.json           # Base TypeScript config
├── tsconfig.app.json       # App-specific TS config
├── tsconfig.spec.json      # Test-specific TS config
├── eslint.config.mjs       # ESLint flat config
├── .prettierrc.json        # Prettier rules
├── .editorconfig           # Editor formatting baseline
├── vite.config.js          # Vitest configuration
├── Dockerfile              # nginx-based production image
├── docker-compose.yml      # Local container setup
└── src/
    ├── index.html
    ├── main.ts             # Application bootstrap
    ├── styles.scss         # Global styles (PrimeNG theme + Tailwind)
    ├── proxy.conf.dev.json     # Dev proxy → staging backend
    ├── proxy.conf.json         # Production proxy config
    ├── proxy.conf.staging-http.json
    ├── environments/       # Environment-specific constants
    ├── assets/
    ├── locale/             # i18n files
    └── app/
        ├── app.component.ts
        ├── app.config.ts   # Application providers (router, HTTP client, PrimeNG theme)
        ├── app.routes.ts   # Route definitions
        ├── _guards/        # Route guards (AuthGuard)
        ├── _interceptors/  # HTTP interceptors
        ├── dtos/           # TypeScript interfaces mirroring backend DTOs
        ├── services/       # Angular injectable services
        ├── shared/         # Shared/reusable components
        ├── urls/           # API URL constants
        ├── nav_bar/        # Navigation bar component
        ├── login/          # Login page
        ├── register/       # Registration page
        ├── dashboard/      # Main dashboard (gridster layout)
        ├── card/           # Dashboard card components
        ├── device/         # Smart device overview, detail, edit
        ├── alert/          # Alert overview and detail
        ├── diary/          # Diary overview, detail, edit
        └── settings/       # User settings
```

## npm Scripts

```bash
npm start           # ng serve — dev server on http://localhost:4200
npm run build       # ng build — production build to dist/
npm run watch       # ng build --watch --configuration development
npm test            # ng test — run tests in watch mode
npm run test:ci     # ng test --watch=false — single test run (used in CI)
npm run lint        # ESLint on src/**/*.{js,ts,html}
npm run lint:fix    # ESLint with --fix
npm run format      # Prettier --write on all src files
npm run format:check # Prettier --check (used in CI)
```

## Application Routes

All routes except `/login` and `/register` are protected by `AuthGuard`.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `DashboardComponent` | Main dashboard with sensor widgets |
| `/login` | `LoginComponent` | Authentication |
| `/register` | `RegisterComponent` | New user registration |
| `/smart_devices` | `DeviceOverviewComponent` | List all smart devices |
| `/smart_devices/add` | `DeviceEditComponent` | Register a new device |
| `/smart_devices/:id` | `DeviceDetailComponent` | Device details and data |
| `/smart_devices/:id/edit` | `DeviceEditComponent` | Edit device |
| `/alerts` | `AlertOverviewComponent` | All configured alerts |
| `/alert/:identifier/:data-source` | `AlertDetailComponent` | Alert detail view |
| `/diary` | `DiaryOverviewComponent` | Greenhouse diary entries |
| `/diary/add` | `DiaryEditComponent` | New diary entry |
| `/diary/:id` | `DiaryDetailComponent` | Diary entry detail |
| `/diary/:id/edit` | `DiaryEditComponent` | Edit diary entry |
| `/settings` | `SettingsComponent` | User/app settings |

## DTOs (`src/app/dtos/`)

TypeScript interfaces that mirror backend response shapes. Keep these in sync with `greenhouse_core` DTOs in the backend.

| File | Purpose |
|------|---------|
| `device.ts` | Smart device types |
| `diary.ts` | Diary entry types |
| `timeseries.ts` | Sensor time-series data |
| `login.ts` | Login request/response |
| `register.ts` | Registration request |
| `generate_one_time_token_request.ts` | Device token request |
| `user-preferences.ts` | User preference shape |
| `alert/` | Alert-related types |

## Angular Services (`src/app/services/`)

| Service | Purpose |
|---------|---------|
| `alert-alias.service.ts` | Manages human-readable aliases for alert identifiers |
| `user-preferences.service.ts` | Stores and retrieves user preferences |

HTTP communication to the backend is handled via `HttpClient` injected directly into components/services. API base URLs are defined in `src/app/urls/`.

## API Proxy Configuration

In development, all `/api/**` requests are proxied to the staging backend:

```json
// src/proxy.conf.dev.json
{
  "/api/**": {
    "target": "https://grn.mauderer.work",
    "secure": false,
    "changeOrigin": true
  }
}
```

To use a local backend instead, update `target` in `proxy.conf.dev.json` to `http://localhost:<port>`.

## Code Conventions

### Angular patterns

- Use **standalone components** — no `NgModule` declarations.
- Prefer `inject()` function over constructor injection for cleaner code.
- Use Angular's `HttpClient` with typed responses matching the `dtos/` interfaces.
- Route guards live in `_guards/`, HTTP interceptors in `_interceptors/` (underscore prefix = framework-level, not feature).

### Styling

- **Tailwind utility classes** for layout and spacing.
- **PrimeNG components** for UI elements (buttons, forms, tables, dialogs).
- Global PrimeNG theme customisation is in `src/styles.scss`.
- Component-scoped styles use `.scss` files alongside each component.

### TypeScript

- Strict mode is enabled (`tsconfig.json`).
- All DTOs must have explicit types — avoid `any`.
- Keep interface names consistent with the Rust DTO names in `greenhouse_core`.

### Pre-commit hooks

Husky runs `lint-staged` on commit:
- `*.{js,ts}` → ESLint --fix, then Prettier --write
- `*.html` → ESLint --fix, then Prettier --write
- `*.{scss,css,json}` → Prettier --write

Never bypass hooks with `--no-verify`. Fix lint/format errors before committing.

## CI/CD

### CI (`.github/workflows/node.js.yml`)

Triggers on push and PR to `main`. Runs on Node.js 24:

| Step | Command |
|------|---------|
| Install deps | `npm ci` |
| Install Playwright | `npx playwright install --with-deps chromium` |
| Lint | `npm run lint` |
| Format check | `npm run format:check` |
| Tests | `npm run test:ci` |
| Build | `npm run build` |

**All checks must pass before merging.**

### Release (`.github/workflows/release.yml`)

Builds and publishes the Docker image on release tags.

## Local Development Setup

```bash
# Use correct Node version
nvm use   # reads .nvmrc (Node 24)

# Install dependencies
npm ci

# Install git hooks
npm run prepare

# Start dev server (proxies /api/** to staging)
npm start
# App available at http://localhost:4200
```

## Adding a New Feature Area

1. Create a directory under `src/app/<feature>/`.
2. Add component files (`<feature>.component.ts`, `.html`, `.scss`, `.spec.ts`).
3. Add any new DTO interfaces to `src/app/dtos/`.
4. Register routes in `src/app/app.routes.ts` with `canActivate: [AuthGuard]` if authentication is required.
5. Add API URL constants to `src/app/urls/`.
6. Create an Angular service in `src/app/services/` if the feature requires shared HTTP state.
