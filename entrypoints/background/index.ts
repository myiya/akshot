import { onMessage } from "@/messaging";
import { dataUrltoBlob } from "@/utils";

export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });

  onMessage('capture-visible-tab', async message => {
    console.log('Background received message:', message);
    const dataUrl = await browser.tabs.captureVisibleTab();
    const a = await browser.tabs.captureVisibleTab();

    console.log('dataUrl', dataUrl);
    return dataUrl;
    // await downloadImage(dataUrl);
    // console.log('Sending message to content script:')
  });

  // (browser.action ?? browser.browserAction).onClicked.addListener(
  //   async (tab) => {
  //     try {
        
  //     } catch (err) {
  //       console.error("Cannot capture screenshot of current tab", tab, err);
  //     }
  //   },
  // );
});

async function downloadImage(dataUrl: string): Promise<void> {
  const filename = `Screenshot-${new Date().toISOString().replaceAll(":", "-")}.png`;
  console.log(`Downloading image: ${filename}`, { dataUrl });

  if (import.meta.env.MANIFEST_VERSION === 3) {
    // There are known issues with download images in background scripts: https://issues.chromium.org/issues/40774955
    // But this works well enough for small screenshots
    await browser.downloads.download({
      url: dataUrl,
      filename,
    });
  } else {
    // Use "createObjectURL" for MV2
    const blob = dataUrltoBlob(dataUrl);
    const objectUrl = URL.createObjectURL(blob);
    await browser.downloads.download({
      url: objectUrl,
      filename,
    });
  }
}