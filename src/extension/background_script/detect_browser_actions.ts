import browser from "webextension-polyfill";
import { receive_downloaded_pdf_message, receive_open_pdf_message } from "../libs/messages";



browser.browserAction.onClicked.addListener(t => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const { id } = tabs[0]
        if (typeof id != 'undefined') {
            browser.tabs.sendMessage(id, { message: 'browser_action' })
        }
    })
})

browser.runtime.onMessage.addListener(receive_open_pdf_message)

browser.runtime.onMessage.addListener(receive_downloaded_pdf_message)