# coc-tailwindcss3

> fork from [vscode-tailwindcss](https://github.com/tailwindlabs/tailwindcss-intellisense/tree/master/packages/vscode-tailwindcss) and [headwind](https://github.com/heybourn/headwind)

Intelligent Tailwind CSS tooling for [coc.nvim](https://github.com/neoclide/coc.nvim).

<img width="744" alt="coc-tailwindcss3-screenshot" src="https://user-images.githubusercontent.com/188642/163154916-1810be1e-fa23-4936-82c1-14f3ca294e63.png">

## Motivation

There are two coc.nvim extensions to "tailwindcss". Unfortunately, neither is currently maintained and will not work with "tailwindcss3"...

I have created `@yaegassy/coc-tailwindcss3` which supports "tailwindcss3".

## Install

```vim
:CocInstall @yaegassy/coc-tailwindcss3
```

> scoped packages

## Prepare

Create tailwindCSS configuration in your project.

> this extension need the configuration exists in your project

```bash
npx tailwindcss init
```

## TIPS

`coc-tailwindcss3` may not work for some projects such as monorepo or depending on how Vim/Neovim is started. Try one of the following methods

### Open the tailwindcss configuration file

Open the `tailwind.config.js` or `tailwind.config.cjs` file that exists in your project.

### workspaceFolders

`workspaceFolders` may not have been properly recognized. To make coc.nvim recognize `workspaceFolders` correctly, you can set `b:coc_root_patterns` in .vimrc/init.vim

**Example for html filetype**:

```vim
  au FileType html let b:coc_root_patterns = ['.git', '.env', 'tailwind.config.js', 'tailwind.config.cjs']
```

Also, `workspaceFolders` can be adjusted manually. Set the directory where `tailwind.config.js` or `tailwind.config.cjs` exists.

See the coc.nvim wiki for more information.

- <https://github.com/neoclide/coc.nvim/wiki/Using-workspaceFolders>

## Configuration options

- `tailwindCSS.enable`: Enable coc-tailwindcss3 extension, default: `true`
- `tailwindCSS.trace.server`: Trace level of tailwindCSS language server, default: `off`
- `tailwindCSS.custom.serverPath`: Custom path to server module. If there is no setting, the built-in module will be used, default: `""`
- `tailwindCSS.dashForceCompletions`: Enable dash (-) force completions feature, default: `true`
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
- `tailwindCSS.headwind.defaultSortOrder`: Sort order: A string array that determines the default sort order.
  - Check the "Configuration" section of [package.json](package.json) for default values.
- `tailwindCSS.headwind.classRegex`: An object with language IDs as keys and their values determining the regex to search for Tailwind CSS classes.
  - Check the "Configuration" section of [package.json](package.json) for default values.
- `tailwindCSS.headwind.runOnSave`: A flag that controls whether or not Headwind will sort your Tailwind CSS classes on save, default: `false`
- `tailwindCSS.headwind.removeDuplicates`: A flag that controls whether or not Headwind will remove duplicate Tailwind CSS classes, default: `true`
- `tailwindCSS.headwind.prependCustomClasses`: A flag that controls whether or not Headwind will move custom CSS classes before (true) or after (false) the Tailwind CSS classes, default: `false`
- `tailwindCSS.headwind.customTailwindPrefix`: If the Tailwind Prefix function is used, this can be specified here (e.g. tw-), default: `""`

## Commands

- `tailwindCSS.showOutput`: Tailwind CSS: Show Output
- `tailwindCSS.headwind.sortTailwindClasses`: Headwind: Sort Tailwind CSS Classes
- `tailwindCSS.headwind.sortTailwindClassesOnWorkspace`: Headwind: Sort Tailwind CSS Classes on Entire Workspace

## Custom Server Path

> tailwindCSS.custom.serverPath: Custom path to server module. If there is no setting, the built-in module will be used, default: ""

This setting allows you to use the tailwind's language server module installed in any location.

### Usage Example 1 (vsix)

**prepare**:

```bash
mkdir -p /tmp/tailwindcss-language-server
cd /tmp/tailwindcss-language-server
curl -LO https://github.com/tailwindlabs/tailwindcss-intellisense/releases/download/v0.8.7/vscode-tailwindcss-0.8.7.vsix
unzip vscode-tailwindcss-0.8.7.vsix
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
  "tailwindCSS.custom.serverPath": "/path/to/.vscode/extensions/bradlc.vscode-tailwindcss-0.8.7/dist/tailwindServer.js
}
```

### Usage Example 3 (npm)

**prepare**:

```bash
npm i -g @tailwindcss/language-server@0.0.8
```

**setting**:

```jsonc
{
  "tailwindCSS.custom.serverPath": "/path/to/.nvm/versions/node/v16.17.0/bin/tailwindcss-language-server"
}
```

## Thanks

- <https://github.com/tailwindlabs/tailwindcss-intellisense>
- <https://github.com/heybourn/headwind>
- <https://github.com/iamcco/coc-tailwindcss>

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
