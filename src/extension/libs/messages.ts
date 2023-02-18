import Browser from "webextension-polyfill";

export function send_download_pdf_message(url: string, filename: string) {
    Browser.runtime.sendMessage({message: 'download_pdf', url, filename});
}

export function receive_downloaded_pdf_message({message, url, filename}: Record<string,string> ) {
    if (message === 'download_pdf') {
        if (!filename.toLowerCase().endsWith('.pdf'))
            filename += '.pdf';
        console.log(`downloading ${url}, ${filename}`)
        Browser.downloads.download({url, filename});
    }
}