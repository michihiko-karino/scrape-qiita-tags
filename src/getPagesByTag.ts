import { launch } from 'puppeteer';

type QittaResponse = {
  pages: QiitaPage[];
  hasNextpage: boolean;
};

type QiitaPage = {
  title: string;
  url: string;
  lgtm: number;
  postedAt: string;
};

const getPagesByTag = async (tagname: string): Promise<QittaResponse> => {
  const browser = await launch({
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 882
    },
    // 高速化を期待しているオプションです。どれほど効果を見込めるかは把握していません
    args: [
      '--no-sandbox',
      '--disable-canvas-aa',
      '--disable-2d-canvas-clip-aa',
      '--disable-gl-drawing-for-tests',
      '--use-gl=swiftshader',
      '--enable-webgl',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--disable-infobars',
      '--disable-breakpad',
      '--window-size=1280,882',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.setUserAgent('bot');
  // console.logデバッグしたいときに
  // page.on('console', msg => console.log(msg.text()));

  const res = await page.goto(buildPageURL(tagname));
  if (!res.ok()) {
    return { pages: [], hasNextpage: false };
  }

  await page.waitFor(1000);
  const pages = await page.evaluate(getPages);
  const { hasNextpage } = await page.evaluate(getPageInfo);
  const ret: QittaResponse = { pages, hasNextpage };

  await browser.close();

  return ret;
};

const buildPageURL = (tagname: string): string => {
  return `https://qiita.com/tags/${tagname}`;
};

const getPages = async (): Promise<QiitaPage[]> => {
  // page.evaluateで渡されたメソッドはdocumentやwindowといったおなじみのブラウザオブジェクトにアクセスできる
  // これらのオブジェクトからいい感じに情報を取得する

  // 最近の投稿下にある記事セレクタ
  const targetSelector = '[class^=TagNewestItemList__TagNewestItemListContainer] [class^=ItemListArticleWithAvatar__Item-sc]';

  return Array.from(document.querySelectorAll(targetSelector)).map((e: Element) => {
    const titleElement = e.querySelector('[class^=ItemListArticleWithAvatar__ItemBodyTitle-sc]') as HTMLAnchorElement;
    const title = titleElement.text;
    const url = titleElement.href;
    const lgtmElement = e.querySelector('[class^=ItemListArticleWithAvatar__LgtmCount-sc]') as HTMLElement;
    const lgtm = Number(lgtmElement.textContent);
    const postedAt = (e.querySelector('[class^=ItemListArticleWithAvatar__Timestamp-sc]') as HTMLElement).textContent

    return { title, url, lgtm, postedAt }
  });
};

const getPageInfo = async (): Promise<{ hasNextpage: boolean }> => {
  const pagerElement = document.querySelector('ul.st-Pager > .st-Pager_next');
  const hasNextpage = !!pagerElement
  return { hasNextpage };
};

export default getPagesByTag;
