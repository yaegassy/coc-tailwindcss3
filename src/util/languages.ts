export const htmlLanguages = [
  'aspnetcorerazor',
  'astro',
  'astro-markdown',
  'blade',
  'django-html',
  'edge',
  'ejs',
  'erb',
  'gohtml',
  'GoHTML',
  'haml',
  'handlebars',
  'hbs',
  'html',
  'HTML (Eex)',
  'HTML (EEx)',
  'html-eex',
  'jade',
  'leaf',
  'liquid',
  'markdown',
  'mdx',
  'mustache',
  'njk',
  'nunjucks',
  'phoenix-heex',
  'php',
  'razor',
  'slim',
  'twig',
];

export const cssLanguages = ['css', 'less', 'postcss', 'sass', 'scss', 'stylus', 'sugarss', 'tailwindcss'];

export const jsLanguages = ['javascript', 'javascriptreact', 'reason', 'rescript', 'typescript', 'typescriptreact'];

export const specialLanguages = ['vue', 'svelte'];

// PORTING: https://github.com/tailwindlabs/tailwindcss-intellisense/blob/master/packages/tailwindcss-language-service/src/util/languages.ts
export const languages = [...cssLanguages, ...htmlLanguages, ...jsLanguages, ...specialLanguages];
