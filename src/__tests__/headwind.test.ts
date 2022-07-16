import { it, expect } from 'vitest';

it('headwind | Dummy', () => {
  expect('dummy').toBe('dummy');
});

it('headwind | Debugging Custom Regex', () => {
  // REF: https://github.com/heybourn/headwind#debugging-custom-regex

  // text
  const editorText = `
  export const Layout = ({ children }) => (
    <div class="h-screen">
      <div className="w-64 h-full bg-blue-400 relative"></div>
      <div>{children}</div>
    </div>
  )
`;

  // regex
  const regex = /(?:\b(?:class|className)?\s*=\s*{?[\"\']([_a-zA-Z0-9\s\-\:/]+)[\"\']}?)/;
  const classWrapperRegex = new RegExp(regex, 'gi');

  const valueMatchs: string[] = [];

  let classWrapper: any;
  while ((classWrapper = classWrapperRegex.exec(editorText)) !== null) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const wrapperMatch = classWrapper[0];
    const valueMatchIndex = classWrapper.findIndex((match: any, idx: any) => idx !== 0 && match);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const valueMatch = classWrapper[valueMatchIndex];

    // console.log('classWrapper', classWrapper);
    // console.log('wrapperMatch', wrapperMatch);
    // console.log('valueMatchIndex', valueMatchIndex);
    // console.log('valueMatch', valueMatch);

    valueMatchs.push(valueMatch);
  }

  expect(valueMatchs).toStrictEqual(['h-screen', 'w-64 h-full bg-blue-400 relative']);
});
