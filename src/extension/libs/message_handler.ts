import Browser from "webextension-polyfill";
import { PDF_ID_QUERY_KEY } from "./utils/config_utils";
import { BatchDownloadPDFRequest, BATCH_PDF_DOWNLOAD_MESSAGE } from "./utils/messaging_types";

const PDF_DOWNLOAD_DONE_MESSAGE = 'donwload_pdf_done'
export const PARSE_PDF_MESSAGE_NAME = 'parse_pdf'
export const PDF_URL_QUERY_KEY = 'pdf_url'

// This module is a gathering of sending and receiving message requests.
// Message from function send_X will always be received by function receive_X

/**
 * Send a message from the content to background script to download a number of PDF files.
 * Returns a promise that resolves when said PDF files are all done.
 * @param urls array of urls to download
 * @param filenames array of filenames to download
 * @returns a promise of download ids that resolve only after the download has completed.
 */
export function send_download_pdfs_message(urls: string[], filenames: string[]): Promise<{ ids: number[], paths: string[] }> {
    const request: BatchDownloadPDFRequest = { msg: BATCH_PDF_DOWNLOAD_MESSAGE, urls, filenames };
    Browser.runtime.sendMessage(request);

    let download_ids: undefined | number[] = undefined;
    let download_paths: string[] = []

    const p: Promise<{ ids: number[], paths: string[] }> = new Promise((resolve) => {
        const timer = setInterval(() => {
            if (typeof download_ids !== 'undefined') {
                clearInterval(timer);
                resolve({ ids: download_ids, paths: download_paths });
            }
        }, 1000)
    })


    const wait_for_download_listener = (response) => {
        if (response.msg === PDF_DOWNLOAD_DONE_MESSAGE) {
            download_ids = response.ids;
            download_paths = response.paths;

            Browser.runtime.onMessage.removeListener(wait_for_download_listener);
        }
    }
    Browser.runtime.onMessage.addListener(wait_for_download_listener)

    return p;
}

// msg received at background script (send completion to content script)
export async function receive_download_pdf_message(received_request: BatchDownloadPDFRequest) {
    const { msg, urls, filenames } = received_request;

    // Send messages to download all the other s
    const ids_to_download: number[] = [];
    const ids_downloaded: number[] = [];
    if (msg === BATCH_PDF_DOWNLOAD_MESSAGE) {
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
                Browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
                    // we have to use msg here because message field is overridden by browser
                    const downloadItemPromises = ids_downloaded.map(async (id) => (await Browser.downloads.search({ id: id }))[0])
                    const downloadedItems = await Promise.all(downloadItemPromises)

                    const ids = downloadedItems.map(x => x.id)
                    const paths = downloadedItems.map(x => x.filename)
                    //@ts-ignore
                    Browser.tabs.sendMessage(tabs[0].id, { msg: PDF_DOWNLOAD_DONE_MESSAGE, ids: ids_downloaded, paths: paths });
                })
            }
        }
    }

    Browser.downloads.onChanged.addListener(checkForDownloadListener);
}

/**
 * Function to send a message to open a PDF tab.
 * Called from content script to background script
 * @param pdf_url url to open
 */
export function send_open_pdf_message(pdf_url: string) {
    Browser.runtime.sendMessage({message: PARSE_PDF_MESSAGE_NAME, url: pdf_url})
}

// Just an identifier to be used
let id = 0;
/**
 * Function to receive message to open a pdf tab in a background script
 * @param request request
 */
export async function receive_open_pdf_message(request: Record<string, string>) {
    // from src/extension/components/Sidebar.tsx
    if (request.message === PARSE_PDF_MESSAGE_NAME) {
        const tab = await Browser.tabs.create({
            url: `extension_page/pdf_parser/index.html?${PDF_URL_QUERY_KEY}=${request.url}&${PDF_ID_QUERY_KEY}=${id++}`
        })

        console.log(Browser.extension.getViews().map(x => x.document));
        
    }
}