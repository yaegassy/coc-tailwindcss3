import {
  commands,
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  OutputChannel,
  RelativePattern,
  ServerOptions,
  TextDocument,
  Thenable,
  TransportKind,
  Uri,
  window,
  workspace,
  WorkspaceFolder,
} from 'coc.nvim';
import fs from 'fs';
import minimatch from 'minimatch';
import path from 'path';
import {
  getConfigCustomCssModeServerPath,
  getConfigCustomServerPath,
  getConfigExcludePatterns,
  getConfigTailwindCssEnable,
} from './config';
import { dedupe, equal } from './util/array';
import isObject from './util/isObject';
import { languages as defaultLanguages } from './util/languages';

export type ConfigurationScope = Uri | TextDocument | WorkspaceFolder | { uri?: Uri; languageId: string };

const CONFIG_FILE_GLOB = '{tailwind,tailwind.config}.{js,cjs}';

const clients: Map<string, LanguageClient | null> = new Map();
const languages: Map<string, string[]> = new Map();

let _sortedWorkspaceFolders: string[] | undefined;
function sortedWorkspaceFolders(): string[] {
  if (_sortedWorkspaceFolders === void 0) {
    _sortedWorkspaceFolders = workspace.workspaceFolders
      ? workspace.workspaceFolders
          .map((folder) => {
            let result = folder.uri.toString();
            if (result.charAt(result.length - 1) !== '/') {
              result = result + '/';
            }
            return result;
          })
          .sort((a, b) => {
            return a.length - b.length;
          })
      : [];
  }
  return _sortedWorkspaceFolders;
}

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
  const sorted = sortedWorkspaceFolders();
  for (const element of sorted) {
    let uri = folder.uri.toString();
    if (uri.charAt(uri.length - 1) !== '/') {
      uri = uri + '/';
    }
    if (uri.startsWith(element)) {
      const workdir = workspace.getWorkspaceFolder(element);
      if (workdir) {
        return workdir;
      }
    }
  }
  return folder;
}

function getUserLanguages(folder?: WorkspaceFolder): Record<string, string> {
  const langs = folder ? workspace.getConfiguration('tailwindCSS', folder.uri.toString()).includeLanguages : undefined;
  return isObject(langs) ? langs : {};
}

function isExcluded(file: string, folder: WorkspaceFolder): boolean {
  const exclude = getConfigExcludePatterns();

  for (const pattern of exclude) {
    if (minimatch(file, path.join(Uri.parse(folder!.uri).fsPath, pattern))) {
      return true;
    }
  }

  return false;
}

export async function activate(context: ExtensionContext) {
  if (!getConfigTailwindCssEnable()) return;

  let module = getConfigCustomServerPath();
  if (module && fs.existsSync(module)) {
    module = module;
  } else {
    module = context.asAbsolutePath(
      path.join('node_modules', '@tailwindcss', 'language-server', 'bin', 'tailwindcss-language-server')
    );
  }

  const outputChannel: OutputChannel = window.createOutputChannel('tailwindcss-language-server');
  context.subscriptions.push(
    commands.registerCommand('tailwindCSS.showOutput', () => {
      if (outputChannel) {
        outputChannel.show();
      }
    })
  );

  const watcher = workspace.createFileSystemWatcher(`**/${CONFIG_FILE_GLOB}`, false, true, true);

  watcher.onDidCreate((uri) => {
    let folder = workspace.getWorkspaceFolder(uri.toString());
    if (!folder) {
      return;
    }
    if (!isExcluded(uri.fsPath, folder)) {
      folder = getOuterMostWorkspaceFolder(folder);
      bootWorkspaceClient(folder);
    }
  });

  context.subscriptions.push(watcher);

  // TODO: check if the actual language MAPPING changed
  // not just the language IDs
  // e.g. "plaintext" already exists but you change it from "html" to "css"
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      clients.forEach((client, key) => {
        const folder = workspace.getWorkspaceFolder(Uri.parse(key).toString());
        if (!folder) return;

        if (event.affectsConfiguration('tailwindCSS', folder.uri.toString())) {
          const userLanguages = getUserLanguages(folder);
          if (userLanguages) {
            const userLanguageIds = Object.keys(userLanguages);
            const newLanguages = dedupe([...defaultLanguages, ...userLanguageIds]);
            if (!equal(newLanguages, languages.get(folder.uri.toString()) as any[])) {
              languages.set(folder.uri.toString(), newLanguages);

              if (client) {
                clients.delete(folder.uri.toString());
                client.stop();
                bootWorkspaceClient(folder);
              }
            }
          }
        }
      });
    })
  );

  let cssServerBooted = false;
  async function bootCssServer() {
    if (cssServerBooted) return;
    cssServerBooted = true;

    let module = getConfigCustomCssModeServerPath();
    if (!module) return;
    if (fs.existsSync(module)) {
      module = module;
    }

    const client = new LanguageClient(
      'tailwindCSS-css-mode',
      'Tailwind CSS',
      {
        run: {
          module,
          transport: TransportKind.ipc,
        },
        debug: {
          module,
          transport: TransportKind.ipc,
          options: {
            execArgv: ['--nolazy', '--inspect=6051'],
          },
        },
      },
      {
        documentSelector: [{ language: 'tailwindcss' }],
        outputChannelName: 'Tailwind CSS Language Mode',
        synchronize: { configurationSection: ['css'] },
      }
    );

    context.subscriptions.push(client.start());
  }

  workspace.onDidOpenTextDocument(
    async () => {
      const { document } = await workspace.getCurrentState();
      if (document.languageId === 'tailwindcss') {
        bootCssServer();
      }
    },
    null,
    context.subscriptions
  );

  function bootWorkspaceClient(folder: WorkspaceFolder) {
    if (clients.has(folder.uri.toString())) {
      return;
    }

    clients.set(folder.uri.toString(), null);

    if (!languages.has(folder.uri.toString())) {
      languages.set(folder.uri.toString(), dedupe([...defaultLanguages, ...Object.keys(getUserLanguages(folder))]));
    }

    const configuration = {
      edidor: workspace.getConfiguration('editor'),
      tailwindCSS: workspace.getConfiguration('tailwindCSS'),
    };

    // MEMO: // If defaultValue (null) is omitted, LS will output the following log
    // ----
    // Unable to resolve "undefined": unknown node or service
    const inspectPort = configuration.tailwindCSS.get('inspectPort', null);

    const serverOptions: ServerOptions = {
      run: {
        module,
        transport: TransportKind.ipc,
        options: { execArgv: inspectPort === null ? [] : [`--inspect=${inspectPort}`] },
      },
      debug: {
        module,
        transport: TransportKind.ipc,
        options: {
          execArgv: ['--nolazy', `--inspect=${6011 + clients.size}`],
        },
      },
    };

    const languageObj = languages.get(folder.uri.toString());
    if (!languageObj) return;

    const clientOptions: LanguageClientOptions = {
      documentSelector: languageObj.map((language) => ({
        scheme: 'file',
        language,
        pattern: `${Uri.parse(folder!.uri).fsPath}/**/*`,
      })),
      diagnosticCollectionName: 'tailwindcss-language-server',
      workspaceFolder: folder,
      outputChannel: outputChannel,
      synchronize: {
        fileEvents: workspace.createFileSystemWatcher(CONFIG_FILE_GLOB),
      },
      middleware: {
        workspace: {
          configuration: (params) => {
            return params.items.map(({ section, scopeUri }) => {
              let scope: ConfigurationScope = folder;
              if (scopeUri) {
                const doc = workspace.textDocuments.find((doc) => doc.uri.toString() === scopeUri);
                if (doc) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  scope = {
                    languageId: doc.languageId,
                  };
                }
              }
              return workspace.getConfiguration(section);
            });
          },
        },
      },
      initializationOptions: {
        userLanguages: getUserLanguages(folder),
      },
    };
    const client = new LanguageClient('tailwindCSS', 'Tailwind CSS Language Server', serverOptions, clientOptions);

    client.start();
    clients.set(folder.uri.toString(), client);
  }

  async function didOpenTextDocument(document: TextDocument): Promise<void> {
    const uri = Uri.parse(document.uri);

    if (uri.scheme !== 'file') return;

    let folder = workspace.getWorkspaceFolder(document.uri);
    // Files outside a folder can't be handled. This might depend on the language.
    // Single file languages like JSON might handle files outside the workspace folders.
    if (!folder) {
      return;
    }

    // If we have nested workspace folders we only start a server on the outer most workspace folder.
    folder = getOuterMostWorkspaceFolder(folder);

    const [configFile] = await workspace.findFiles(
      new RelativePattern(folder, `**/${CONFIG_FILE_GLOB}`),
      `{${getConfigExcludePatterns().join(',')}}`,
      1
    );

    if (!configFile) return;

    bootWorkspaceClient(folder);
  }

  context.subscriptions.push(workspace.onDidOpenTextDocument(didOpenTextDocument));
  workspace.textDocuments.forEach(didOpenTextDocument);
  context.subscriptions.push(
    workspace.onDidChangeWorkspaceFolders((event) => {
      _sortedWorkspaceFolders = undefined;

      for (const folder of event.removed) {
        const client = clients.get(folder.uri.toString());
        if (client) {
          clients.delete(folder.uri.toString());
          client.stop();
        }
      }
    })
  );
}

export async function deactivate(): Promise<void> {
  const promises: Thenable<void>[] = [];
  for (const client of clients.values()) {
    if (client) {
      promises.push(client.stop());
    }
  }
  return Promise.all(promises).then(() => undefined);
}
