import ParserDriver, { ParsedUrl } from "./BaseParserDriver";
import { toTitleCase } from "./utils/str_utils";

export default class RafflesBulletinOfZoologyDriver implements ParserDriver {
    // Example: https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-63/
    static URL_REGEX = new RegExp("lkcnhm\.nus\.edu\.sg\/publications\/raffles-bulletin-of-zoology\/volumes\/");
    static EXCERPT_REGEX = /Pp\. \d+–\d+\./;

    get_links(document: Document): ParsedUrl[] {
        return Array.from(document.querySelectorAll('div.publication-layout'))
            .map(node => {
                const children = node.children
                const exerpt = children[2].textContent?.trim()

                const authors = toTitleCase(children[0].textContent?.trim() ?? "")
                const title = toTitleCase(children[1].textContent?.trim() ?? "")
                const publication_type = exerpt?.slice(0, exerpt.search(RafflesBulletinOfZoologyDriver.EXCERPT_REGEX))?.trim() ?? ""
                const pages = exerpt?.slice(exerpt.search(RafflesBulletinOfZoologyDriver.EXCERPT_REGEX))?.trim() ?? ""
                const link = children[3].getAttribute('href') ?? ""

                const display_string = title.length != 0 ? title : authors

                return {authors, title, publication_type, pages, link, display_string}
            })
    }


    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}