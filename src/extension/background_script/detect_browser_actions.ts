import browser from "webextension-polyfill";
import { handle_send_message_to_tab, receive_download_pdf_message, receive_open_pdf_message } from "../libs/message_handler";



browser.browserAction.onClicked.addListener(t => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const { id } = tabs[0]
        if (typeof id != 'undefined') {
            browser.tabs.sendMessage(id, { message: 'browser_action' })
        }
    })
})

browser.runtime.onMessage.addListener(receive_open_pdf_message)
browser.runtime.onMessage.addListener(receive_download_pdf_message)
browser.runtime.onMessage.addListener(handle_send_message_to_tab)