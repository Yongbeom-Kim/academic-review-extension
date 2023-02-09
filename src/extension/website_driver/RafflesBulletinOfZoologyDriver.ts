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
                try {

                    const children = node.children

                    const volume_no = document.querySelector('.title-page')?.textContent?.split(' ')?.slice(-1)[0] ?? "";

                    const authors = toTitleCase(children[0].textContent?.trim() ?? "")
                    let author_count;
                    if (authors.includes(',')) {
                        author_count = authors.split(',').length + 1;
                    } else {
                        author_count = authors.includes('&') || authors.includes('And') ? 2 : 1;
                    }
                    const title = toTitleCase(children[1].textContent?.trim() ?? "")




                    const excerpt = children[2].textContent?.trim() ?? "";
                    const excerpt_delimiter_index = excerpt.indexOf('. ');
                    const publication_type = excerpt?.slice(0, excerpt_delimiter_index)?.trim() ?? ""
                    const pages = excerpt?.slice(excerpt_delimiter_index + 2)?.trim() ?? ""

                    const link = children[3].getAttribute('href') ?? ""

                    const display_string = title.length != 0 ? title : authors

                    return {
                        volume_no,
                        authors,
                        author_count: author_count.toString(),
                        title,
                        publication_type,
                        pages,
                        link,
                        display_string
                    }
                } catch (e) {
                    console.error(e);
                    return;
                }
            })
            .map(ParsedUrl.parsePlainObject)
    }


    is_url(url: string): boolean {
        return RafflesBulletinOfZoologyDriver.URL_REGEX.test(url);
    }
}