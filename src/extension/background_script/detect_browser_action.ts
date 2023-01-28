import browser from "webextension-polyfill";

browser.browserAction.onClicked.addListener(t => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const { id } = tabs[0]
        if (typeof id != 'undefined') {
            browser.tabs.sendMessage(id, { message: 'browser_action' })
        }
    })
    console.log("msg sent")
})