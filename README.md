# coc-tailwindcss3

> fork from a [vscode-tailwindcss](https://github.com/tailwindlabs/tailwindcss-intellisense/tree/master/packages/vscode-tailwindcss)

Intelligent Tailwind CSS tooling for [coc.nvim](https://github.com/neoclide/coc.nvim).

<img width="744" alt="coc-tailwindcss3-screenshot" src="https://user-images.githubusercontent.com/188642/163154916-1810be1e-fa23-4936-82c1-14f3ca294e63.png">

## Motivation

There are two coc.nvim extensions to "tailwindcss". Unfortunately, neither is currently maintained and will not work with "tailwindcss3"...

I have created `@yaegassy/coc-tailwindcss3` which supports "tailwindcss3".

## Install

**CocInstall**:

```vim
:CocInstall @yaegassy/coc-tailwindcss3
```

> scoped packages

**vim-plug**:

```vim
Plug 'yaegassy/coc-tailwindcss3', {'do': 'yarn install --frozen-lockfile'}
```

## Prepare

Create tailwindCSS configuration in your project.

> this extension need the configuration exists in your project

```bash
npx tailwindcss init
```

## Configuration options

- `tailwindCSS.enable`: Enable coc-tailwindcss3 extension, default: `true`
- `tailwindCSS.trace.server`: Trace level of tailwindCSS language server, default: `off`
- `tailwindCSS.custom.serverPath`: Custom path to server module. If there is no setting, the built-in module will be used, default: `""`
- `tailwindCSS.emmetCompletions`: Enable class name completions when using Emmet-style syntax, for example `div.bg-red-500.uppercase`, default: `false`
- `tailwindCSS.includeLanguages`: Enable features in languages that are not supported by default. Add a mapping here between the new language and an already supported language. E.g.: `{"plaintext": "html"}`, default: `{ "eelixir": "html", "elixir": "html", "eruby": "html", "htmldjango": "html", "html.twig": "html" }`
- `tailwindCSS.files.exclude`: Configure glob patterns to exclude from all IntelliSense features. Inherits all glob patterns from the `#files.exclude#` setting, default: ["**/.git/**", "**/node_modules/**", "**/.hg/**"]
- `tailwindCSS.classAttributes`: The HTML attributes for which to provide class completions, hover previews, linting etc, default: `["class", "className", "ngClass"]`
- `tailwindCSS.suggestions`: Enable autocomplete suggestions, default: `true`
- `tailwindCSS.hovers`: Enable hovers, default: `true`
- `tailwindCSS.codeActions`: Enable code actions, default: `true`
- `tailwindCSS.validate`: Enable linting. Rules can be configured individually using the `tailwindcss.lint.*` settings, default: `true`
- `tailwindCSS.lint.cssConflict`: Class names on the same HTML element which apply the same CSS property or properties, valid option ["ignore", "warning", "error"], default: `warning`
- `tailwindCSS.lint.invalidApply`: Unsupported use of the [`@apply` directive](https://tailwindcss.com/docs/functions-and-directives/#apply), valid option ["ignore", "warning", "error"], default: `error`
- `tailwindCSS.lint.invalidScreen`: Unknown screen name used with the [`@screen` directive](https://tailwindcss.com/docs/functions-and-directives/#screen), valid option ["ignore", "warning", "error"], default: `error`
- `tailwindCSS.lint.invalidVariant`: Unknown variant name used with the [`@variants` directive](https://tailwindcss.com/docs/functions-and-directives/#variants), valid option ["ignore", "warning", "error"], default: `error`
- `tailwindCSS.lint.invalidConfigPath`: Unknown or invalid path used with the [`theme` helper](https://tailwindcss.com/docs/functions-and-directives/#theme), valid option ["ignore", "warning", "error"], default: `error`
- `tailwindCSS.lint.invalidTailwindDirective`: Unknown value used with the [`@tailwind` directive](https://tailwindcss.com/docs/functions-and-directives/#tailwind), valid option ["ignore", "warning", "error"], default: `error`
- `tailwindCSS.lint.recommendedVariantOrder`: Class variants not in the recommended order (applies in [JIT mode](https://tailwindcss.com/docs/just-in-time-mode) only), valid option ["ignore", "warning", "error"], default: `error`
- `tailwindCSS.experimental.classRegex`: ...
- `tailwindCSS.inspectPort`: Enable the Node.js inspector agent for the language server and listen on the specified port, default: `null`

## Commands

- `tailwindCSS.showOutput`: Tailwind CSS: Show Output

## Custom Server Path

> tailwindCSS.custom.serverPath: Custom path to server module. If there is no setting, the built-in module will be used, default: ""

This setting allows you to use the tailwind's language server module installed in any location.

### Usage Example 1 (vsix)

**prepare**:

```bash
mkdir -p /tmp/tailwindcss-language-server
cd /tmp/tailwindcss-language-server
curl -LO https://github.com/tailwindlabs/tailwindcss-intellisense/releases/download/v0.8.2/vscode-tailwindcss-0.8.2.vsix
unzip vscode-tailwindcss-0.8.2.vsix
```

**setting**:

```jsonc
{
  "tailwindCSS.custom.serverPath": "/tmp/tailwindcss-language-server/extension/dist/tailwindServer.js",
}
```

### Usage Example 2 (Use extensions installed in VSCode)

**setting**:

```jsonc
{
  "tailwindCSS.custom.serverPath": "/path/to/.vscode/extensions/bradlc.vscode-tailwindcss-0.8.2/dist/tailwindServer.js
}
```

### Usage Example 3 (npm)

**prepare**:

```bash
npm i -g @tailwindcss/language-server@0.0.7
```

**setting**:

```jsonc
{
  "tailwindCSS.custom.serverPath": "/path/to/.nvm/versions/node/v16.14.2/bin/tailwindcss-language-server"
}
```

## Thanks

- <https://github.com/tailwindlabs/tailwindcss-intellisense>

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
