import {
  workspace,
  ColorInformation,
  Color,
  LanguageClient,
  DidChangeTextDocumentParams,
  OutputChannel,
  Range,
} from 'coc.nvim';

export const colorNamespace = 'tailwind_lsp_color';

const hlPrefix = 'coc_tailwind';

const cacheHlGroups = new Set<string>();

function getHlGroup(color: string): [boolean, string] {
  if (cacheHlGroups.has(color)) {
    return [true, `${hlPrefix}_${color}`];
  }
  cacheHlGroups.add(color);
  return [false, `${hlPrefix}_${color}`];
}

function fixNum(num: string) {
  if (num.length < 2) {
    return '0' + num;
  }
  return num;
}

/**
 * return a hex but without #
 */
function toHexCons(color: Color): string {
  return (
    fixNum(Math.floor(color.red * 255 * color.alpha).toString(16)) +
    fixNum(Math.floor(color.green * 255 * color.alpha).toString(16)) +
    fixNum(Math.floor(color.blue * 255 * color.alpha).toString(16))
  );
}

export async function attchHighlight(
  e: DidChangeTextDocumentParams,
  namespaceId: number,
  client: LanguageClient,
  outputChannel?: OutputChannel
) {
  if (
    e.textDocument.uri.toString() === (await workspace.getCurrentState()).document.uri.toString() &&
    (workspace.isNvim || (workspace.isVim && workspace.env.textprop))
  ) {
    const nvim = workspace.nvim;

    const buffer = await workspace.nvim.buffer;
    const pairs = await client.sendRequest<ColorInformation[]>('textDocument/documentColor', {
      textDocument: {
        uri: e.textDocument.uri,
      },
    });
    const rangeWithHexArray = pairs.map(({ range, color }) => {
      return {
        hex: toHexCons(color),
        range,
      };
    });

    const array = rangeWithHexArray.map((unit) => {
      const hgStatus = getHlGroup(unit.hex);
      return {
        group: hgStatus[1],
        range: unit.range,
        have: hgStatus[0],
      };
    });
    const script = array
      .filter((hg) => hg.have === false)
      .map((hg) => `hi ${hlPrefix}_${hg.group} guibg=#${hg.group}`)
      .join('\n');

    outputChannel?.appendLine(script);
    if (script.length > 0) {
      await nvim.exec(script);
    }

    [
      ...array
        .reduce((result, unit) => {
          if (result.has(unit.group)) {
            result.get(unit.group)?.push(unit.range as Range);
            // result.set(unit.group, result.get(unit.group)!.push(unit.))
          } else {
            result.set(unit.group, [unit.range]);
          }
          return result;
        }, new Map<string, Range[]>())
        .entries(),
    ].map(([group, ranges]) => {
      buffer.highlightRanges(namespaceId, group, ranges);
    });
  }
}
