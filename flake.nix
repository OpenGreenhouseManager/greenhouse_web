{
  description = "Open Greenhouse Manager web frontend, plus a NixOS module that serves it";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      version = "1.0.4-unstable-${self.shortRev or self.dirtyShortRev or "dirty"}";
    in
    {
      packages = forAllSystems (pkgs: rec {
        greenhouse-web = pkgs.callPackage ./nix/package.nix {
          inherit version;
          nodejs = pkgs.nodejs_24;
        };
        default = greenhouse-web;
      });

      overlays.default = final: _prev: {
        greenhouse-web = final.callPackage ./nix/package.nix {
          inherit version;
          nodejs = final.nodejs_24;
        };
      };

      # Import this from the home server's configuration:
      #
      #   imports = [ inputs.greenhouse-web.nixosModules.default ];
      #   services.greenhouse-web = {
      #     enable = true;
      #     domain = "grn.mauderer.work";
      #     backendUrl = "http://127.0.0.1:5100";
      #   };
      #
      # The package default is wired up here rather than through an overlay so
      # importing the module does not silently change the consumer's nixpkgs.
      nixosModules.greenhouse-web =
        { pkgs, lib, ... }:
        {
          imports = [ ./nix/module.nix ];
          services.greenhouse-web.package = lib.mkDefault self.packages.${pkgs.stdenv.hostPlatform.system}.greenhouse-web;
        };
      nixosModules.default = self.nixosModules.greenhouse-web;

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_24
            pkgs.playwright-driver.browsers
          ];

          # `npm run test:ci` drives a real chromium through Playwright
          # (angular.json -> test.options.browsers). Point it at the browsers
          # from nixpkgs instead of letting npm download an unpatched one.
          env = {
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
          };
        };
      });

      checks = forAllSystems (
        pkgs:
        let
          site = self.packages.${pkgs.stdenv.hostPlatform.system}.greenhouse-web;
          defaultLocale = nixpkgs.lib.head site.passthru.locales;
        in
        {
          package = site;

          # Boots a VM running the module and checks the routing the app depends
          # on end to end: locale redirect, SPA fallback and the /api proxy.
          # Linting and unit tests stay in GitHub Actions, where the Playwright
          # browser is already available.
          module = pkgs.testers.runNixOSTest {
            name = "greenhouse-web";

            nodes.machine = {
              imports = [ self.nixosModules.default ];

              services.greenhouse-web = {
                enable = true;
                domain = "greenhouse.test";
                enableACME = false;
                forceSSL = false;
                backendUrl = "http://127.0.0.1:5100";
              };

              # Stub backend, so /api routing is exercised without the real API.
              services.nginx.virtualHosts."stub-api" = {
                listen = [
                  {
                    addr = "127.0.0.1";
                    port = 5100;
                  }
                ];
                locations = {
                  "= /api/health".extraConfig = ''
                    add_header Content-Type application/json;
                    return 200 '{"stub":true}';
                  '';
                  # Guards against the static-asset regex hijacking API paths.
                  "= /api/script.js".extraConfig = ''
                    add_header Content-Type application/json;
                    return 200 '{"stub":"js-path"}';
                  '';
                };
              };
            };

            testScript = ''
              locale = "${defaultLocale}"

              machine.wait_for_unit("nginx.service")
              machine.wait_for_open_port(80)


              def get(path, extra=""):
                  return machine.succeed(
                      f"curl -sS {extra} -H 'Host: greenhouse.test' http://127.0.0.1{path}"
                  )


              def status(path):
                  return get(path, "-o /dev/null -w '%{http_code}'").strip()


              # / redirects into the default locale, because Angular bakes
              # <base href="/<locale>/"> into index.html.
              headers = get("/", "-i -o /dev/null -D -")
              assert "302" in headers, headers
              assert f"/{locale}/" in headers, headers

              # The locale root serves the app shell.
              shell = get(f"/{locale}/")
              assert "<grn-root>" in shell, shell[:500]
              assert f'<base href="/{locale}/">' in shell, shell[:500]

              # SPA fallback: a router path that is not a file still returns index.html.
              assert "<grn-root>" in get(f"/{locale}/dashboard")

              # A path outside any locale keeps its path when redirected.
              headers = get("/dashboard", "-i -o /dev/null -D -")
              assert f"/{locale}/dashboard" in headers, headers

              # /api reaches the backend rather than the SPA fallback, including
              # paths that look like static assets.
              assert "stub" in get("/api/health")
              assert "js-path" in get("/api/script.js")

              # Missing assets 404 instead of silently returning index.html.
              assert status(f"/{locale}/does-not-exist.js") == "404"

              # Hashed bundles are immutable, and carry exactly one
              # Cache-Control header (`expires` would add a second).
              asset = machine.succeed(
                  f"ls ${site}/{locale}/main-*.js | head -1 | xargs -n1 basename"
              ).strip()
              headers = get(f"/{locale}/{asset}", "-i -o /dev/null -D -")
              assert "immutable" in headers, headers
              assert headers.lower().count("cache-control:") == 1, headers

              # The favicon is built into the locale directory, but browsers ask
              # for it at the root.
              assert status("/favicon.ico") == "200"
            '';
          };
        }
      );

      formatter = forAllSystems (pkgs: pkgs.nixfmt-rfc-style);
    };
}
