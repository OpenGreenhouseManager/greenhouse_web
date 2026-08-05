{ config, lib, ... }:

let
  cfg = config.services.greenhouse-web;

  # The app is a static bundle, so "deploying" is just pointing a web server at
  # a store path. There is no service to run and nothing to restart.
  locales = cfg.locales;

  # proxy_pass without a URI part makes nginx forward the original request path
  # unchanged, which is what the backend expects: the Angular app calls
  # /api/... (see src/app/urls/urls.ts) and the old dev-server proxy did not
  # rewrite the path either. A trailing slash here would silently strip /api.
  backend = lib.removeSuffix "/" cfg.backendUrl;

  staticAssetPattern = "~* \\.(?:js|mjs|css|map|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico)$";
in
{
  options.services.greenhouse-web = {
    enable = lib.mkEnableOption "the Open Greenhouse Manager web frontend";

    package = lib.mkOption {
      type = lib.types.package;
      description = ''
        The built static site. Defaults to the package from this flake when the
        module is imported via `greenhouse-web.nixosModules.default`.
      '';
    };

    domain = lib.mkOption {
      type = lib.types.str;
      example = "grn.mauderer.work";
      description = "Hostname the site is served under.";
    };

    backendUrl = lib.mkOption {
      type = lib.types.str;
      default = "http://127.0.0.1:5100";
      example = "http://127.0.0.1:5100";
      description = ''
        Base URL of the greenhouse API. Requests to /api/ are reverse-proxied
        here, so the browser only ever talks to {option}`domain` and the
        auth-token cookie stays same-origin.
      '';
    };

    locales = lib.mkOption {
      type = lib.types.listOf lib.types.str;
      default = cfg.package.passthru.locales or [ ];
      defaultText = lib.literalExpression "config.services.greenhouse-web.package.passthru.locales";
      description = ''
        Locale directories the package provides, each served under its own path
        prefix. Read from the package by default; only set this if you supply a
        {option}`package` built outside this flake.
      '';
    };

    defaultLocale = lib.mkOption {
      type = lib.types.str;
      default = if locales == [ ] then "de-DE" else lib.head locales;
      defaultText = lib.literalExpression "the first entry of `locales`";
      description = ''
        Locale that requests outside a locale prefix are redirected to. Each
        built locale lives under its own path because Angular bakes
        `<base href="/<locale>/">` into every index.html.
      '';
    };

    configureNginx = lib.mkOption {
      type = lib.types.bool;
      default = true;
      description = ''
        Whether to set up an nginx virtual host. Set to false if another
        reverse proxy already fronts this machine; use {option}`root` to point
        it at the built site.
      '';
    };

    enableACME = lib.mkOption {
      type = lib.types.bool;
      default = true;
      description = "Obtain a Let's Encrypt certificate for {option}`domain`.";
    };

    forceSSL = lib.mkOption {
      type = lib.types.bool;
      default = cfg.enableACME;
      defaultText = lib.literalExpression "config.services.greenhouse-web.enableACME";
      description = "Redirect plain HTTP to HTTPS.";
    };

    listenAddress = lib.mkOption {
      type = lib.types.str;
      default = "0.0.0.0";
      description = "Address to listen on when {option}`port` is set.";
    };

    port = lib.mkOption {
      type = lib.types.nullOr lib.types.port;
      default = null;
      example = 8080;
      description = ''
        Listen on this single plain-HTTP port instead of the usual 80/443. Use
        together with `enableACME = false` when TLS is terminated upstream.
      '';
    };

    openFirewall = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Open the ports nginx listens on in the firewall.";
    };

    root = lib.mkOption {
      type = lib.types.path;
      readOnly = true;
      default = "${cfg.package}";
      defaultText = lib.literalExpression "\${config.services.greenhouse-web.package}";
      description = ''
        Document root of the built site, exposed so an externally managed web
        server can serve it when {option}`configureNginx` is false.
      '';
    };
  };

  config = lib.mkIf cfg.enable {
    assertions = [
      {
        assertion = cfg.domain != "";
        message = "services.greenhouse-web.domain must be set.";
      }
      {
        assertion = locales != [ ];
        message =
          "services.greenhouse-web.locales is empty; the package exposes no locale directories.";
      }
      {
        assertion = lib.elem cfg.defaultLocale locales;
        message =
          "services.greenhouse-web.defaultLocale is ${cfg.defaultLocale}, but the package only "
          + "provides ${lib.concatStringsSep ", " locales}. Add the locale to `localize` in "
          + "angular.json to build it.";
      }
      {
        assertion = cfg.enableACME -> cfg.forceSSL;
        message = "services.greenhouse-web.enableACME requires forceSSL.";
      }
      {
        assertion = cfg.enableACME -> config.security.acme.acceptTerms;
        message =
          "services.greenhouse-web.enableACME requires security.acme.acceptTerms = true and "
          + "security.acme.defaults.email to be set.";
      }
      {
        assertion = cfg.enableACME -> cfg.port == null;
        message =
          "services.greenhouse-web.port cannot be combined with enableACME; ACME's HTTP-01 "
          + "challenge needs port 80.";
      }
    ];

    services.nginx = lib.mkIf cfg.configureNginx {
      enable = true;
      recommendedProxySettings = lib.mkDefault true;
      recommendedGzipSettings = lib.mkDefault true;
      recommendedOptimisation = lib.mkDefault true;
      recommendedTlsSettings = lib.mkDefault true;

      virtualHosts.${cfg.domain} = {
        inherit (cfg) enableACME forceSSL root;

        listen = lib.mkIf (cfg.port != null) [
          {
            addr = cfg.listenAddress;
            port = cfg.port;
            ssl = false;
          }
        ];

        locations = lib.mkMerge [
          (lib.listToAttrs (
            map (locale: {
              name = "/${locale}/";
              value = {
                # SPA fallback: the Angular router owns every path under the
                # locale prefix, so unknown paths must return index.html rather
                # than 404.
                tryFiles = "$uri $uri/ /${locale}/index.html";
                extraConfig = ''
                  add_header Cache-Control "no-cache";
                '';
              };
            }) locales
          ))
          {
            # Assets are content-hashed (outputHashing: "all"), so they can be
            # cached forever. A regex location outranks the prefix locations
            # above, which is what keeps index.html on no-cache while its
            # sibling bundles stay immutable.
            # `expires` is deliberately not used here: it emits its own
            # Cache-Control, which would leave two of them on every response.
            ${staticAssetPattern}.extraConfig = ''
              add_header Cache-Control "public, max-age=31536000, immutable";
              access_log off;
            '';

            # Browsers request this from the root, but it is built into the
            # locale directory.
            "= /favicon.ico".extraConfig = ''
              try_files /${cfg.defaultLocale}/favicon.ico =404;
              access_log off;
            '';

            # "^~" so the static-asset regex below cannot hijack an API path
            # that happens to end in .js, .png and friends.
            "^~ /api/" = {
              proxyPass = backend;
              extraConfig = ''
                proxy_http_version 1.1;
                proxy_read_timeout 60s;
              '';
            };

            # Anything outside a locale prefix (including bookmarks predating
            # the locale layout) is sent to the default locale with its path
            # preserved. The longer locale prefixes match first, so this cannot
            # loop.
            "/".extraConfig = ''
              return 302 /${cfg.defaultLocale}$request_uri;
            '';
          }
        ];
      };
    };

    networking.firewall.allowedTCPPorts = lib.mkIf (cfg.configureNginx && cfg.openFirewall) (
      if cfg.port != null then [ cfg.port ] else [ 80 443 ]
    );
  };
}
