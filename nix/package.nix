{
  lib,
  stdenv,
  nodejs,
  importNpmLock,
  # Overridden by the flake with something more informative (git tag / rev).
  version ? "0-unstable",
}:

let
  fs = lib.fileset;

  # Only the files the production build actually reads. Keeping this tight means
  # editing the README, CI workflows or the Dockerfile does not invalidate the
  # build and force the deployment host to recompile the app.
  src = fs.toSource {
    root = ../.;
    fileset = fs.unions [
      ../src
      ../angular.json
      ../package.json
      ../package-lock.json
      ../tsconfig.json
      ../tsconfig.app.json
      ../.postcssrc.json
      ../vite.config.js
    ];
  };

  angularJson = lib.importJSON ../angular.json;
  project = angularJson.projects.greenhouse_web;
  buildOptions = project.architect.build.options;

  # `localize` in angular.json decides which locale subdirectories `ng build`
  # emits, and each gets <base href="/<locale>/">. Reading it here instead of
  # hardcoding keeps the nginx locale routing in nix/module.nix in sync with the
  # app automatically.
  #
  # Note this is *only* the locales listed in `localize`; the sourceLocale
  # (en-US) is not built unless it is added there, so today the deployed site is
  # German-only and there is no top-level index.html.
  locales = buildOptions.localize;
  outputPath = buildOptions.outputPath;
in

stdenv.mkDerivation (finalAttrs: {
  pname = "greenhouse-web";
  inherit version src;

  nativeBuildInputs = [
    nodejs
    # Links a node_modules built straight from package-lock.json into the build
    # directory. Every tarball is fetched by the integrity hash already recorded
    # in the lockfile, so there is no vendor hash to regenerate when
    # dependencies change -- unlike buildNpmPackage's npmDepsHash.
    importNpmLock.hooks.linkNodeModulesHook
  ];

  npmDeps = importNpmLock.buildNodeModules {
    npmRoot = src;
    inherit nodejs;
  };

  env = {
    # The build is offline and non-interactive; angular.json already sets
    # cli.analytics = false, this is belt and braces for the sandbox.
    NG_CLI_ANALYTICS = "false";
    CI = "true";
  };

  buildPhase = ''
    runHook preBuild

    # The Angular CLI wants a writable HOME for its cache; the sandbox default
    # (/homeless-shelter) does not exist.
    export HOME=$(mktemp -d)

    # Called directly rather than through npx so the build can never reach out
    # to the registry. defaultConfiguration is "production" (angular.json),
    # which turns on optimization, budgets and outputHashing=all.
    ./node_modules/.bin/ng build

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p "$out"
    cp -R ${outputPath}/browser/. "$out"/

    runHook postInstall
  '';

  # Fail loudly at build time rather than serving a broken root: the nginx
  # config in nix/module.nix assumes one directory per locale, each with its
  # own index.html.
  doInstallCheck = true;
  installCheckPhase = ''
    runHook preInstallCheck

    ${lib.concatMapStringsSep "\n" (locale: ''
      if [ ! -f "$out/${locale}/index.html" ]; then
        echo "expected $out/${locale}/index.html to exist; ng build output layout changed" >&2
        exit 1
      fi
    '') locales}

    runHook postInstallCheck
  '';

  passthru = {
    inherit locales;
  };

  meta = {
    description = "Web frontend for the Open Greenhouse Manager";
    homepage = "https://github.com/OpenGreenhouseManager/greenhouse_web";
    platforms = lib.platforms.linux ++ lib.platforms.darwin;
  };
})
