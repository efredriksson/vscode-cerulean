<div align="center">

# Cerulean: a formatter for Teal

Fast formatter for [Teal](https://github.com/teal-language/tl). Save your `.tl` files and directly have them formatted.

[![License: MIT](https://img.shields.io/badge/License-MIT-0d7eaa)](https://opensource.org/licenses/MIT)
[![Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-0d7eaa)](https://marketplace.visualstudio.com/items?itemName=efredriksson.cerulean-teal)

</div>

![demo](https://raw.githubusercontent.com/efredriksson/vscode-cerulean/main/media/demo.gif)

## Features

- **Format-on-save** for Teal (`.tl`) files.
- **Fast** session daemon with no startup cost on save.
- **Zero config** when `ceru` is on your `PATH`. One setting (`cerulean.cliPath`)
  if it isn't.
- **Coexists** with [`pdesaulniers.vscode-teal`](https://marketplace.visualstudio.com/items?itemName=pdesaulniers.vscode-teal), install both.

## Requirements

The `ceru` binary must be on `PATH`, or `cerulean.cliPath` must point at it. Run `luarocks install cerulean` to install it. See [Cerulean repo](https://github.com/efredriksson/cerulean) for documentation.

Verify the install:

```sh
ceru --version
```

## Quick start

1. In user or workspace settings, set Cerulean as the Teal formatter and
   enable format-on-save:

   ```jsonc
   "[teal]": { "editor.defaultFormatter": "efredriksson.cerulean-teal" },
   "editor.formatOnSave": true
   ```

1. Open a `.tl` file, make changes, and save.

## Configuration

| Setting             | Default  | Purpose                                                                     |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `cerulean.cliPath`  | `"ceru"` | Path to the `ceru` binary. Override when not on `PATH` or to test a build. |

## Changelogs

- [This plugin](https://github.com/efredriksson/vscode-cerulean/releases)
- [Cerulean formatter (upstream)](https://github.com/efredriksson/cerulean/releases)


