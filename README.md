# GreenhouseWeb

Angular frontend for the Open Greenhouse Manager.

## Development

```sh
npm ci
npm start          # ng serve on http://localhost:4200/
npm run test:ci    # unit tests (Vitest in a real chromium)
npm run lint
npm run format:check
```

With Nix, `nix develop` provides Node 24 and a Playwright-managed chromium, so
`npm run test:ci` works without downloading a browser.

The dev server proxies `/api` to a remote backend (`src/proxy.conf.json` for
`--configuration staging`, `src/proxy.conf.dev.json` for `development`). A
production build has no proxy: it calls `/api/...` on its own origin, and the
web server in front of it is responsible for routing that to the backend.

## Deployment

Deployment is a NixOS module. There is no container and no registry in the
path: the flake builds the static bundle, and the module points nginx at the
resulting store path.

Add the flake to the host's configuration:

```nix
{
  inputs.greenhouse-web.url = "github:OpenGreenhouseManager/greenhouse_web";

  # in the nixosSystem module list
  imports = [ inputs.greenhouse-web.nixosModules.default ];

  services.greenhouse-web = {
    enable = true;
    domain = "grn.mauderer.work";
    backendUrl = "http://127.0.0.1:5100";
  };

  security.acme.acceptTerms = true;
  security.acme.defaults.email = "you@example.com";
}
```

Then `nixos-rebuild switch --flake .#<host>`. Releasing a new version means
updating the pinned input on the host (`nix flake update greenhouse-web`) and
rebuilding; `nixos-rebuild --rollback` reverts.

If another reverse proxy already terminates TLS, set `configureNginx = false`
and serve `config.services.greenhouse-web.root` from it, or keep nginx and give
it a plain port:

```nix
services.greenhouse-web = {
  enable = true;
  domain = "grn.mauderer.work";
  enableACME = false;
  port = 8080;
};
```

A staging instance is the same import with a different `domain` and
`backendUrl`. The bundle is identical — only the proxy target differs — so
staging no longer needs its own build.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `domain` | *required* | Hostname served |
| `backendUrl` | `http://127.0.0.1:5100` | `/api` reverse-proxy target |
| `defaultLocale` | first built locale | Where `/` redirects |
| `locales` | from the package | Locale prefixes to serve |
| `configureNginx` | `true` | Set up the nginx vhost |
| `enableACME` / `forceSSL` | `true` | Let's Encrypt for `domain` |
| `port` / `listenAddress` | `null` / `0.0.0.0` | Plain-HTTP listener instead of 80/443 |
| `openFirewall` | `false` | Open the listening ports |
| `root` | read-only | Store path of the built site |

### Locales

`angular.json` sets `localize: ["de-DE"]`, so `ng build` emits a single
`de-DE/` directory with `<base href="/de-DE/">` baked in — there is no
top-level `index.html`. The module reads that list from the package, redirects
`/` (and any non-locale path) to the default locale, and serves each locale
with an SPA fallback. Adding a locale to `localize` is enough; the nginx
config follows automatically.

`i18nMissingTranslation` is `error`, so an untranslated string fails the build,
which now means it fails the deployment too.

### Local checks

```sh
nix build .#greenhouse-web   # result/ is the document root
nix flake check              # builds the site and runs the NixOS VM test
```

The VM test boots the module against a stub backend and asserts the locale
redirect, the SPA fallback and `/api` proxying.

Dependencies come from `package-lock.json` via `importNpmLock`, which fetches
each tarball by the integrity hash already in the lockfile. There is no vendor
hash to regenerate when dependencies change.

### Containers

`Dockerfile` and `docker-compose.yml` remain for local development only. Note
that the image runs `ng serve` — a development server — and is not the
deployment path.
