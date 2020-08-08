import getPagesByTag from './getPagesByTag';

(async () => {
  // npx ts-node test.ts
  console.log(await getPagesByTag('puppeteer'));
})();
