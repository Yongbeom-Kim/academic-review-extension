import { ParsedUrl } from "../model/ParsedUrlObject";
import ParserDriver from "./BaseParserDriver";
import { toTitleCase } from "../libs/utils/str_utils";

export default class RafflesBulletinOfZoologyDriver implements ParserDriver {
    // Example: https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-63/
    static URL_REGEX = new RegExp("lkcnhm\.nus\.edu\.sg\/publications\/raffles-bulletin-of-zoology\/volumes\/");
    static EXCERPT_REGEX = /Pp\. \d+–\d+\./;

    get_links(document: Document): ParsedUrl[] {
        return Array.from(document.querySelectorAll('div.publication-layout'))
            .map(node => {
                // TODO: get rid of this
                try {

                    const children = node.children

                    const volume_no = document.querySelector('.title-page')?.textContent?.split(' ')?.slice(-1)[0] ?? "";

                    const authors = toTitleCase(children[0].textContent?.trim() ?? "")

                    const title = toTitleCase(children[1].textContent?.trim() ?? "")

                    const excerpt = children[2].textContent?.trim() ?? "";
                    const excerpt_delimiter_index = excerpt.indexOf('. ');
                    const publication_type = excerpt?.slice(0, excerpt_delimiter_index)?.trim() ?? ""
                    const page_no = excerpt?.slice(excerpt_delimiter_index + 2)?.trim() ?? ""

                    const link = children[3].getAttribute('href') ?? ""

                    const display_string = title.length != 0 ? title : authors

                    return ParsedUrl.from ({
                        volume_no,
                        authors,
                        title,
                        publication_type,
                        page_no,
                        link,
                        display_string
                    })

                } catch (e) {
                    console.error(e);
                    return ParsedUrl.from({});
                }
            })
    }


    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}