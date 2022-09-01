import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemProvider,
  DocumentSelector,
  ExtensionContext,
  languages,
  LinesTextDocument,
  Position,
  workspace,
} from 'coc.nvim';

export async function register(context: ExtensionContext, documentSelector: DocumentSelector) {
  if (workspace.getConfiguration('tailwindCSS').get<boolean>('dashForceCompletions')) {
    context.subscriptions.push(
      languages.registerCompletionItemProvider(
        'twcss3-dash',
        'TWCSS3-DASH',
        documentSelector,
        new DashForceCompletionProvider(),
        ['-']
      )
    );
  }
}

export class DashForceCompletionProvider implements CompletionItemProvider {
  async provideCompletionItems(
    _document: LinesTextDocument,
    _position: Position,
    _token: CancellationToken,
    context: CompletionContext
  ): Promise<CompletionItem[]> {
    if (context.triggerCharacter !== '-') return [];
    const dummyItems: CompletionItem[] = [];

    // MEMO: force completion
    //
    // There are a number of tailwindcss completion items that contain dash (-).
    //
    // When you type a "dash", the completion menu disappears, so you can avoid
    // this problem by adding a "dash" with vim's `iskeyword` option
    //
    // However, Since coc.nvim v0.0.82, the `iskeyword` option in vim does not seem to be respected in completion.
    workspace.nvim.call('coc#start');

    return dummyItems;
  }
}
