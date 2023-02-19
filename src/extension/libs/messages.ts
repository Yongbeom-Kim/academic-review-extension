import Browser from "webextension-polyfill";

const PDF_DOWNLOAD_MESSAGE = 'download_pdf'
const PDF_DOWNLOAD_DONE_MESSAGE = 'donwload_pdf_done'
/**
 * Send a message from the content to background script to download a number of PDF files.
 * Returns a promise that resolves when said PDF files are all done.
 * @param urls array of urls to download
 * @param filenames array of filenames to download
 * @returns a promise of download ids that resolve only after the download has completed.
 */
export function send_download_pdfs_message(urls: string[], filenames: string[]): Promise<number[]> {
    Browser.runtime.sendMessage({ message: PDF_DOWNLOAD_MESSAGE, urls, filenames });

    let download_ids: undefined | number[] = undefined;

    const p: Promise<number[]> = new Promise((resolve) => {
        const timer = setInterval(() => {
            console.log("waiting for download...")
            if (typeof download_ids !== 'undefined') {
                console.log("download finished!")
                clearInterval(timer);
                resolve(download_ids);
            }
        }, 1000)
    })


    const wait_for_download_listener = (response) => {
        if (response.msg === PDF_DOWNLOAD_DONE_MESSAGE) {
            download_ids = response.ids;
            Browser.runtime.onMessage.removeListener(wait_for_download_listener);
        }
    }
    Browser.runtime.onMessage.addListener(wait_for_download_listener)

    return p;
}

// msg received at background script (send completion to content script)
export async function receive_downloaded_pdf_message({ message, urls, filenames }: { message: string, urls: string[], filenames: string[] }) {
    const ids_to_download: number[] = [];
    const ids_downloaded: number[] = [];
    if (message === PDF_DOWNLOAD_MESSAGE) {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i]
            let filename = filenames[i]
            if (!filename.toLowerCase().endsWith('.pdf'))
                filename += '.pdf';

            Browser.downloads.download({ url, filename }).then(id => ids_to_download.push(id));
        }
    }

    const checkForDownloadListener = (e) => {
        if (e.state && e.state.current === 'complete' && ids_to_download.includes(e.id) && !ids_downloaded.includes(e.id)) {
            console.log(`Completed download: ${e.id}`);
            ids_downloaded.push(e.id);

            if (ids_downloaded.length === ids_to_download.length) {
                Browser.downloads.onChanged.removeListener(checkForDownloadListener);
                Browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
                    // we have to use msg here because message field is overridden by browser
                    //@ts-ignore
                    Browser.tabs.sendMessage(tabs[0].id, { msg: PDF_DOWNLOAD_DONE_MESSAGE, ids: ids_downloaded });
                })
            }
        }
    }

    Browser.downloads.onChanged.addListener(checkForDownloadListener);
}