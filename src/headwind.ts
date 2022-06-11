import { spawn } from 'child_process';
import { commands, ExtensionContext, OutputChannel, Range, Uri, window, workspace } from 'coc.nvim';
import { rustyWindPath } from 'rustywind';

// ---- util ----

export const sortClassString = (classString: string, sortOrder: string[], shouldRemoveDuplicates: boolean): string => {
  let classArray = classString.split(/\s+/g);

  if (shouldRemoveDuplicates) {
    classArray = removeDuplicates(classArray);
  }

  classArray = sortClassArray(classArray, sortOrder);

  return classArray.join(' ');
};

const sortClassArray = (classArray: string[], sortOrder: string[]): string[] => [
  ...classArray
    .filter((el) => sortOrder.indexOf(el) !== -1) // take the classes that are in the sort order
    .sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)), // and sort them
  ...classArray.filter((el) => sortOrder.indexOf(el) === -1), // prepend the classes that were not in the sort order
];

const removeDuplicates = (classArray: string[]): string[] => [...new Set(classArray)];

let outputChannel: OutputChannel | undefined;

export const logger = {
  init(ch: OutputChannel) {
    outputChannel = ch;
  },

  getLog(name: string) {
    return (message: string) => {
      if (outputChannel) {
        outputChannel.appendLine(`[${name}]: ${message}`);
      }
    };
  },
};

// ---- main ----

const log = logger.getLog('headwind');

const config = workspace.getConfiguration();
const configRegex: { [key: string]: string } = config.get('tailwindCSS.headwind.classRegex') || {};

const sortOrder = config.get('tailwindCSS.headwind.defaultSortOrder');

const shouldRemoveDuplicatesConfig = config.get('tailwindCSS.headwind.removeDuplicates');
const shouldRemoveDuplicates = typeof shouldRemoveDuplicatesConfig === 'boolean' ? shouldRemoveDuplicatesConfig : true;

let isActive = false;
export function activateHeadwind(context: ExtensionContext) {
  if (isActive) {
    return;
  }
  isActive = true;
  context.subscriptions.push({
    dispose() {
      isActive = false;
    },
  });
  const disposable = commands.registerCommand('tailwindCSS.headwind.sortTailwindClasses', async () => {
    const doc = await workspace.document;
    const editorText = doc.textDocument.getText();
    const editorLangId = doc.textDocument.languageId;

    const classWrapperRegex = new RegExp(configRegex[editorLangId] || configRegex['html'], 'gi');
    let classWrapper: RegExpExecArray | null;
    while ((classWrapper = classWrapperRegex.exec(editorText)) !== null) {
      const wrapperMatch = classWrapper[0];
      const valueMatchIndex = classWrapper.findIndex((match, idx) => idx !== 0 && match);
      const valueMatch = classWrapper[valueMatchIndex];

      const startPosition = classWrapper.index + wrapperMatch.lastIndexOf(valueMatch);
      const endPosition = startPosition + valueMatch.length;

      const range = Range.create(doc.textDocument.positionAt(startPosition), doc.textDocument.positionAt(endPosition));

      doc.applyEdits([
        {
          range,
          newText: sortClassString(valueMatch, Array.isArray(sortOrder) ? sortOrder : [], shouldRemoveDuplicates),
        },
      ]);
    }
  });

  const runOnProject = commands.registerCommand('tailwindCSS.headwind.sortTailwindClassesOnWorkspace', () => {
    const workspaceFolder = workspace.workspaceFolders || [];
    if (workspaceFolder[0]) {
      const workspacePath = Uri.parse(workspaceFolder[0].uri).fsPath;
      window.showInformationMessage(`Running Headwind on: ${workspacePath}`);

      const rustyWindArgs = [workspacePath, '--write', shouldRemoveDuplicates ? '' : '--allow-duplicates'].filter(
        (arg) => arg !== ''
      );

      const rustyWindProc = spawn(rustyWindPath, rustyWindArgs);

      rustyWindProc.stdout.on(
        'data',
        (data) => data && data.toString() !== '' && log(`rustywind stdout:\n${data.toString()}`)
      );

      rustyWindProc.stderr.on('data', (data) => {
        if (data && data.toString() !== '') {
          log(`rustywind stderr:\n${data.toString()}`);
          window.showErrorMessage(`Headwind error: ${data.toString()}`);
        }
      });
    }
  });

  context.subscriptions.push(runOnProject);
  context.subscriptions.push(disposable);

  if (config.get('tailwindCSS.headwind.runOnSave')) {
    context.subscriptions.push(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      workspace.onWillSaveTextDocument((_e) => {
        commands.executeCommand('tailwindCSS.headwind.sortTailwindClasses');
      })
    );
  }
}
