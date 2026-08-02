# AGENTS.md

## Scope
- Work from `JavaScript/vscode-extensions/csharp-helper`. Do not assume repo-root scripts or conventions apply here; this project has its own `package.json` and `pnpm-workspace.yaml`.

## Commands
- Use `pnpm`, not `npm`; `packageManager` is pinned to `pnpm@10.33.0` in `package.json`.
- Main verification steps:
  - `pnpm run check-types`
  - `pnpm run lint`
  - `pnpm run compile`
- `pnpm run compile` already runs `check-types`, `lint`, then bundles with `node esbuild.js`.
- `pnpm run package` is the production bundle path used by `vscode:prepublish`.
- `pnpm test` runs `pretest` first, which compiles tests to `out/`, compiles the extension to `dist/`, and lints again before launching the VS Code test runner.
- `pnpm run self-host` creates a `.vsix` with `vsce`. `install.sh` packages and installs that `.vsix` through the `code` CLI.

## Wiring
- Runtime entrypoint is `src/extension.ts`; bundled output is `dist/extension.js`.
- When adding or renaming a command, update both places:
  - `package.json` `contributes.commands`
  - `src/extension.ts` command registration in `activate()`
- Feature implementations live in `src/features/*.ts`. Shared path/namespace helpers are in `src/utility.ts`.

## VS Code Dev Flow
- The checked-in launch config runs the extension in an Extension Development Host using the default build task from `.vscode/tasks.json`.
- That default task is `watch`, which runs both `pnpm run watch:tsc` and `pnpm run watch:esbuild`.
- Tests are discovered from `out/test/**/*.test.js` via `.vscode-test.mjs`; test sources stay in `src/test` but must be transpiled to `out` to run.

## Project Quirks
- This extension ships built files, not source: `.vscodeignore` excludes `src/**`, `*.ts`, `tsconfig.json`, and `eslint.config.mjs`. Changes are not runnable from the packaged extension unless `dist/extension.js` is rebuilt.
- `findCsProjFile()` in `src/utility.ts` searches upward at most 10 directories for the nearest `.csproj`. Features that depend on namespace/template generation only work when the active file is inside that window.
- `generateNamespace()` derives the root namespace from the project directory name, not from the `.csproj` contents. Preserve that behavior unless intentionally changing extension semantics.
- ESLint uses the unified `typescript-eslint` package (not the legacy `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` pair). `eslint.config.mjs` uses `tseslint.config()` with `tseslint.configs.recommended` extended inline.
- `tsconfig.json` explicitly declares `"types": ["node", "mocha"]`. This is required by TypeScript 6's stricter type resolution — removing it will cause `fs`, `path`, `os`, `Buffer`, `suite`, and `test` to become unresolved errors.
- `package.json` contains a `pnpm.overrides` block that pins `diff` and `serialize-javascript` to patched versions. These override vulnerable transitive deps pulled in by `mocha`. Do not remove without re-running `pnpm audit`.
- `npm-run-all2` is the maintained fork of the abandoned `npm-run-all`. It exposes the same `npm-run-all` binary, so the `watch` script (`npm-run-all -p watch:*`) works unchanged.

## Testing Reality
- `src/test/extension.test.ts` is still the default sample test. Do not assume meaningful automated coverage exists for feature behavior.
