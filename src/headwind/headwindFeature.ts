import { commands, ExtensionContext, OutputChannel, Range, workspace } from 'coc.nvim';
import { buildMatchers, getTextMatch, sortClassString } from './headwindUtils';

export type LangConfig =
  | string
  | string[]
  | { regex?: string | string[]; separator?: string; replacement?: string }
  | undefined;

const config = workspace.getConfiguration();
const langConfig: { [key: string]: LangConfig | LangConfig[] } = config.get('tailwindCSS.headwind.classRegex') || {};

const sortOrder = config.get('tailwindCSS.headwind.defaultSortOrder');

const customTailwindPrefixConfig = config.get('tailwindCSS.headwind.customTailwindPrefix');
const customTailwindPrefix = typeof customTailwindPrefixConfig === 'string' ? customTailwindPrefixConfig : '';

const shouldRemoveDuplicatesConfig = config.get('tailwindCSS.headwind.removeDuplicates');
const shouldRemoveDuplicates = typeof shouldRemoveDuplicatesConfig === 'boolean' ? shouldRemoveDuplicatesConfig : true;

const shouldPrependCustomClassesConfig = config.get('tailwindCSS.headwind.prependCustomClasses');
const shouldPrependCustomClasses =
  typeof shouldPrependCustomClassesConfig === 'boolean' ? shouldPrependCustomClassesConfig : false;

let isActive = false;

export function activate(context: ExtensionContext, outputChannel: OutputChannel) {
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

    outputChannel.appendLine(`\n${'#'.repeat(10)} headwind exec\n`);
    outputChannel.appendLine(`editorLangId: ${editorLangId}`);
    outputChannel.appendLine(`langConfig: ${JSON.stringify(langConfig[editorLangId], null, 2)}\n`);

    const matchers = buildMatchers(langConfig[editorLangId] || langConfig['html']);

    for (const matcher of matchers) {
      getTextMatch(matcher.regex, editorText, (text, startPosition) => {
        outputChannel.appendLine(`Regex: ${matcher.regex}`);
        outputChannel.appendLine(`MatchText: ${text}\n`);
        const endPosition = startPosition + text.length;
        const range = Range.create(
          doc.textDocument.positionAt(startPosition),
          doc.textDocument.positionAt(endPosition)
        );

        const options = {
          shouldRemoveDuplicates,
          shouldPrependCustomClasses,
          customTailwindPrefix,
          separator: matcher.separator,
          replacement: matcher.replacement,
        };

        doc.applyEdits([
          {
            range,
            newText: sortClassString(text, Array.isArray(sortOrder) ? sortOrder : [], options),
          },
        ]);
      });
    }
  });

  context.subscriptions.push(disposable);

  // if runOnSave is enabled organize tailwind classes before saving
  if (config.get('tailwindCSS.headwind.runOnSave')) {
    context.subscriptions.push(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      workspace.onWillSaveTextDocument((_e) => {
        commands.executeCommand('tailwindCSS.headwind.sortTailwindClasses');
      })
    );
  }
}
