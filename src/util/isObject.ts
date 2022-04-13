// PORTING: https://github.com/tailwindlabs/tailwindcss-intellisense/blob/master/packages/tailwindcss-language-service/src/util/isObject.ts
export default function isObject(variable: any): boolean {
  return Object.prototype.toString.call(variable) === '[object Object]';
}
