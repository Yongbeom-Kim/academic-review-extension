// https://bobbyhadz.com/blog/javascript-find-highest-z-index-on-page
export function getMaxZIndex() {
    return Math.max(
        ...Array.from(document.querySelectorAll('body *'),
            e => parseFloat(window.getComputedStyle(e).zIndex))
            .filter(zIndex => !Number.isNaN(zIndex))
    )
}