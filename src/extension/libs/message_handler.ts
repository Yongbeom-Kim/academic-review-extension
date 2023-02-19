import { type } from "os";
import Browser from "webextension-polyfill";
import { PDF_ID_QUERY_KEY } from "./utils/config_utils";
import {
    BatchDownloadPDFRequest,
    BatchDownloadPDFResponse,
    BATCH_DOWNLOAD_REQUEST_MESSAGE,
    BATCH_DOWNLOAD_RESPONSE_MSG
} from "./utils/messaging_types";

export const PARSE_PDF_MESSAGE_NAME = 'parse_pdf'
export const PDF_URL_QUERY_KEY = 'pdf_url'

// This module is a gathering of sending and receiving message requests.
// Message from function send_X will always be received by function receive_X

/**
 * Does:
 *  1. Send a message from current script to background script to download a number of PDF files
 *  2. Returns a promise that resolves with the downloaded PDF's metadata when downloading has finished.
 * @param urls array of urls to download
 * @param filenames array of filenames to download
 * @returns a promise of download ids that resolve only after the download has completed.
 */
export function send_download_pdfs_message(urls: string[], filenames: string[]): Promise<BatchDownloadPDFResponse> {
    const request: BatchDownloadPDFRequest = { msg: BATCH_DOWNLOAD_REQUEST_MESSAGE, urls, filenames };
    Browser.runtime.sendMessage(request);

    let response: BatchDownloadPDFResponse | undefined = undefined;

    const downloaded: Promise<BatchDownloadPDFResponse> = new Promise((resolve) => {
        const timer = setInterval(() => {
            if (typeof response !== 'undefined') {
                clearInterval(timer);
                console.log("Promise is resolved")
                console.log(response)
                resolve(response);
            }
        }, 1000)
    })

    const wait_for_download_listener = (request: BatchDownloadPDFResponse) => {
        console.log("received request");
        console.log(request);
        if (request.msg === BATCH_DOWNLOAD_RESPONSE_MSG) {
            response = request;
            Browser.runtime.onMessage.removeListener(wait_for_download_listener);
        }
    }
    Browser.runtime.onMessage.addListener(wait_for_download_listener)

    return downloaded;
}

// msg received at background script (send completion to content script)
export async function receive_download_pdf_message(received_request: BatchDownloadPDFRequest) {
    let { msg, urls, filenames } = received_request;
    if (msg !== BATCH_DOWNLOAD_REQUEST_MESSAGE) {
        return;
    }

    // add .pdf
    filenames = filenames.map(filename => filename.toLowerCase().endsWith('.pdf') ? filename : filename + '.pdf')

    // Send messages to download all the other s
    const ids_to_download: number[] = [];
    const ids_downloaded: number[] = [];


    for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        let filename = filenames[i]
        Browser.downloads.download({ url, filename }).then(id => ids_to_download.push(id));
    }

    Browser.downloads.onChanged.addListener(checkForDownloadListener);

    async function checkForDownloadListener(e: Browser.Downloads.OnChangedDownloadDeltaType) {
        if (!e.state || e.state.current !== 'complete')
            return;
        if (!ids_to_download.includes(e.id))
            return; // we are not interested in this file
        if (ids_downloaded.includes(e.id))
            return; // repeat event

        console.log(`Completed download: ${e.id}`);
        ids_downloaded.push(e.id);

        if (ids_downloaded.length !== ids_to_download.length) {
            return; // not all downloads have finished yet
        }

        Browser.downloads.onChanged.removeListener(checkForDownloadListener);

        const downloadItemPromises = ids_downloaded.map(async (id) => (await Browser.downloads.search({ id: id }))[0])
        const downloadedItems = await Promise.all(downloadItemPromises)

        const downloaded_ids = downloadedItems.map(x => x.id)
        const downloaded_paths = downloadedItems.map(x => x.filename)

        const response: BatchDownloadPDFResponse = { msg: BATCH_DOWNLOAD_RESPONSE_MSG, ids: downloaded_ids, paths: downloaded_paths };

        Browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
            const id_to_send = tabs[0].id
            if (typeof id_to_send === 'undefined')
                throw new Error(`invalid tab id, ${id_to_send}`)

            console.log("Sending message");
            console.log(response);
            Browser.tabs.sendMessage(id_to_send, response);
        })

    }
}


/**
 * Function to send a message to open a PDF tab.
 * Called from content script to background script
 * @param pdf_url url to open
 */
export function send_open_pdf_message(pdf_url: string) {
    Browser.runtime.sendMessage({ message: PARSE_PDF_MESSAGE_NAME, url: pdf_url })
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