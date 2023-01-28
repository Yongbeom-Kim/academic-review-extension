import browser from "webextension-polyfill";

browser.browserAction.onClicked.addListener(t => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const { id } = tabs[0]
        if (typeof id != 'undefined') {
            browser.tabs.sendMessage(id, { message: 'browser_action' })
        }
    })
})

browser.runtime.onMessage.addListener((request) => {
    // src/extension/components/Sidebar.tsx
    if (request.message = 'start_review') {
        browser.windows.create({
            url: 'extension_page/index.html',
            type: 'popup'
        })
    }
})