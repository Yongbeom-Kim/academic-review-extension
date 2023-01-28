import ParserDriver, { ParsedUrl } from "./BaseParserDriver";

export default class RafflesBulletinOfZoologyDriver implements ParserDriver {
    // Example: https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-63/
    static URL_REGEX = new RegExp("lkcnhm\.nus\.edu\.sg\/publications\/raffles-bulletin-of-zoology\/volumes\/");
    static EXCERPT_REGEX = /Pp\. \d+–\d+\./;
    
    get_links(document: Document): ParsedUrl[] {
        return Array.from(document.querySelectorAll('div.publication-layout'))
            .map(node => {
                const children = node.children
                const exerpt = children[2].textContent?.trim()
                return {
                    authors: children[0].textContent?.trim() ?? "",
                    display_string: children[0].textContent?.trim() ?? "",
                    title: children[1].textContent?.trim() ?? "",
                    publication_type: exerpt?.slice(0, exerpt.search(RafflesBulletinOfZoologyDriver.EXCERPT_REGEX))?.trim() ?? "",
                    pages: exerpt?.slice(exerpt.search(RafflesBulletinOfZoologyDriver.EXCERPT_REGEX))?.trim() ?? "",
                    link: children[3].getAttribute('href') ?? ""
                }
            })
    }

    
    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}