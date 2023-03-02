import { type } from "os";
import Browser, { Runtime } from "webextension-polyfill";
import {
    BatchDownloadPDFRequest,
    BatchDownloadPDFResponse,
    BATCH_DOWNLOAD_REQUEST_MESSAGE,
    BATCH_DOWNLOAD_RESPONSE_MSG,
    PARSED_PDF_RESPONSE_MSG,
    ParsePDFRequest,
    ParsePDFResponse as ParsedPDFResponse,
    PARSE_PDF_REQUEST_MSG
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
            if (typeof id_to_send === 'undefined') {
                console.error(`invalid tab id, ${id_to_send}`)
                return;
            }

            // console.debug(`Sending Batch Download PDF Response: id: ${id_to_send}, response: ${JSON.stringify(response)}`)
            Browser.tabs.sendMessage(id_to_send, response);
        })

    }
}


/**
 * Function to send a message to parse a PDF in a new tab.
 * Called from content script to background script
 * @param pdf_url url to open
 * @returns a promise of the resulting parse result.
 */
export function send_parse_pdf_message(pdf_url: string): Promise<ParsedPDFResponse> {
    const request: ParsePDFRequest = { msg: PARSE_PDF_REQUEST_MSG, filePath: pdf_url }
    Browser.runtime.sendMessage(request)


    // promise returned
    let parsed_pdf_response_data: ParsedPDFResponse | undefined = undefined;
    const response_promise: Promise<ParsedPDFResponse> = new Promise(resolve => {
        const timer = setInterval(() => {
            if (typeof parsed_pdf_response_data !== 'undefined')
                resolve(parsed_pdf_response_data)
        })
    })

    // listener to get data
    const get_response = (message: ParsedPDFResponse) => {
        if (message.msg === PARSED_PDF_RESPONSE_MSG && message.filePath === request.filePath) { // need extra check as there may be multiple messages concurrently
            parsed_pdf_response_data = message;
            Browser.runtime.onMessage.removeListener(get_response)
        }
    }
    Browser.runtime.onMessage.addListener(get_response)

    return response_promise;
}

/**
 * Function to receive message to open a pdf tab in a background script
 * @param request request
 */
export async function receive_open_pdf_message(request: ParsePDFRequest, sender: Runtime.MessageSender) {
    // from src/extension/components/Sidebar.tsx
    if (request.msg !== PARSE_PDF_MESSAGE_NAME)
        return;

    const tab = await Browser.tabs.create({
        url: `extension_page/pdf_parser/index.html`
    })

    // Send data to new tab on open
    const onTabLoadCompletionListener = (tabId: number, changeInfo: Browser.Tabs.OnUpdatedChangeInfoType) => {
        if (tabId != tab.id)
            return;
        if (!changeInfo.status || changeInfo.status !== 'complete')
            return;

        const message: ParsePDFRequest = { msg: PARSE_PDF_REQUEST_MSG, filePath: request.filePath, from_tab_id: sender.tab?.id }
        Browser.tabs.sendMessage(tabId, message)
        Browser.tabs.onUpdated.removeListener(onTabLoadCompletionListener);
    }

    Browser.tabs.onUpdated.addListener(onTabLoadCompletionListener)

}

/**
 * Function to send a message to a specific tab called from a content script.
 * This function is handled by the @function handle_send_message_to_tab
 * @param tabId tab id to send
 * @param message message to send
 */
export function send_message_to_tab(tabId: number, message_data: Object) {
    console.debug(`Sending message: ${JSON.stringify({ msg: 'send_msg_to_tab', tabId, message_data })}`)
    Browser.runtime.sendMessage({ msg: 'send_msg_to_tab', tabId, message_data });
}

export function handle_send_message_to_tab({ msg, tabId, message_data }: { msg: string, tabId: number, message_data: any }) {
    if (msg !== 'send_msg_to_tab')
        return;

    if (typeof tabId === 'undefined' || tabId === -1)
        console.error(`Received invalid tab id when handling msg ${msg}: ${tabId}`)
    else
        console.debug(`Received msg ${msg}: ${tabId}`)

    Browser.tabs.sendMessage(tabId, message_data)
}

export function send_close_current_tab_message() {
    console.debug(`Sending message: ${JSON.stringify({ msg: 'close_tab' })}`)
    Browser.runtime.sendMessage({ msg: 'close_tab' })
}

export function receive_close_current_tab_message({msg}: { msg: string }, sender: Browser.Runtime.MessageSender) {
    if (msg !== 'close_tab')
        return;

    const sender_tab = sender.tab;
    if (typeof sender_tab === 'undefined') {
        console.error(`Invalid sender tab when receiving ${msg} message: ${sender_tab}`);
        return;
    }

    const sender_id = sender_tab.id;
    if (typeof sender_id === 'undefined' || sender_id === -1) {
        console.error(`Invalid sender tab id when receiving ${msg} message: ${sender_id}`);
        return;
    }
    
    console.debug(`Received msg ${msg} message: ${sender_id}`);

    Browser.tabs.remove(sender_id);

}