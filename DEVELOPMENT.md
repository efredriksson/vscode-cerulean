# Development

## Extension Development Host

1. `npm install && npm run compile`.
2. Open this repository as the workspace root in VSCode (`File → Open
   Folder…`). F5 needs to resolve `.vscode/launch.json` from the root.
3. Press `F5`. VSCode runs `npm: compile` (preLaunchTask), then opens a
   second window titled `[Extension Development Host]`.
4. In that host, open any `.tl` file, set the `[teal]` formatter / save
   settings (see [README](README.md#quick-start)), edit, save.

The dev host invokes the installed `ceru` binary. After rebuilding the daemon in the upstream Cerulean repo, reload the dev host (`Cmd/Ctrl+R`) to discard the old daemon process.

To point the dev host at a locally built `ceru` without touching `PATH`, set `cerulean.cliPath` to an absolute path in the dev host's user settings.

## Architecture

- [src/extension.ts](src/extension.ts) — activation, formatter registration.
- [src/formatter.ts](src/formatter.ts) — VSCode `DocumentFormattingEditProvider`.
- [src/daemon.ts](src/daemon.ts) — spawns and supervises one `ceru daemon`
  child process per editor session.
- [src/protocol.ts](src/protocol.ts) — stdio framing between extension and
  daemon.

## Packaging

```sh
npm run package   # produces cerulean.vsix via @vscode/vsce
```
