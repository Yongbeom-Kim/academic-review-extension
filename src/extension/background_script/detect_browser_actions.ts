import browser from "webextension-polyfill";
import { receive_downloaded_pdf_message } from "../libs/messages";
import { PARSE_PDF_MESSAGE_NAME, PDF_URL_QUERY_KEY } from "../libs/utils/config_utils";



browser.browserAction.onClicked.addListener(t => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const { id } = tabs[0]
        if (typeof id != 'undefined') {
            browser.tabs.sendMessage(id, { message: 'browser_action' })
        }
    })
})

browser.runtime.onMessage.addListener(async (request) => {
    // src/extension/components/Sidebar.tsx
    if (request.message === PARSE_PDF_MESSAGE_NAME) {
        const tab = await browser.tabs.create({
            url: `extension_page/pdf_parser/index.html?${PDF_URL_QUERY_KEY}=${request.url}`
        })
    }

})

browser.runtime.onMessage.addListener(receive_downloaded_pdf_message)