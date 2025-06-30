import { onMessage } from "@/messaging";
import { dataUrltoBlob } from "@/utils";

export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });
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