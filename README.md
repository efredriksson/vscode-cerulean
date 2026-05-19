# Cerulean VSCode extension

Format-on-save for Teal source files. Spawns `ceru daemon` once per editor
session and talks to it over stdio. No LSP, no range formatting, no
marketplace publication yet.

## Prerequisite

`ceru` must be on `PATH`. Install one of:

- `luarocks install cerulean` (recommended).
- `make install` from the Cerulean repo root.

Verify: `which ceru` resolves, and `printf 'PING\n' | ceru daemon` prints
`PONG\n0\n` after the `cerulean-daemon: ready` line.

The official Teal extension `pdesaulniers.vscode-teal` provides syntax,
diagnostics, and completion. Install both; they coexist.

## Install (end user)

From this repo:

```sh
npm install
npm run package        # produces cerulean.vsix
code --install-extension cerulean.vsix
```

Or `Cmd/Ctrl+Shift+P` → `Extensions: Install from VSIX...` and pick the
file.

Then in user or workspace settings:

```jsonc
"[teal]": { "editor.defaultFormatter": "efredriksson.cerulean" },
"editor.formatOnSave": true
```

Open a `.tl` file, save, buffer reformats.

## Develop (Extension Development Host)

1. `npm install && npm run compile`.
2. Open this repository as the workspace root in VSCode (`File → Open
   Folder…`). F5 needs to resolve `.vscode/launch.json` from the root.
3. Press `F5`. VSCode runs `npm: compile` (preLaunchTask), then opens a
   second window titled `[Extension Development Host]`.
4. In that host, open any `.tl` file, set the `[teal]` formatter / save
   settings, edit, save.

The dev host invokes the installed `ceru` binary, not any in-repo Teal
source. After rebuilding the daemon in the upstream Cerulean repo, reload
the dev host (`Cmd/Ctrl+R`) to discard the old daemon process.

## Settings

| Key                | Default | Purpose                                                                       |
| ------------------ | ------- | ----------------------------------------------------------------------------- |
| `cerulean.cliPath` | `"ceru"` | Path to the `ceru` binary. Override when not on `PATH` or to test a build. |

## Troubleshooting

- **"`ceru` not found on PATH"**: install via `luarocks install cerulean`
  or set `cerulean.cliPath` to an absolute path.
- **Silent no-op**: open `View → Output`, select `Cerulean` from the
  dropdown. Spawn / exit / stderr show there.
- **Parse error toast**: file has a Teal syntax error. `tl check <file>`
  confirms.
