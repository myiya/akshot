import { getActTabId } from "@/messaging";

/**
 * @description dataUrl 转 Blob
 * @param dataUrl
 * @returns
 */
export function dataUrltoBlob(dataUrl: string): Blob {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataUrl.split(",")[1]);

  // separate out the mime component
  var mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}

/**
 * @description 获取当前窗口的截图
 * @returns
 */
export async function getCurrentCapture(): Promise<string> {
  const tabId = await getActTabId();
  const tab = await browser.tabs.get(tabId);
  const windowId = tab.windowId;
  console.log("windowId", windowId);
  return new Promise((resolve, reject) => {
    browser.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
        return;
      }
      resolve(dataUrl);
    });
  });
}
