import ParserDriver, { ParsedUrl } from "./BaseParserDriver";

export default class DefaultParserDriver implements ParserDriver {
    get_links(document: Document): ParsedUrl[] {
        return Array.from(document.querySelectorAll('a[href]'))
            .map(x => {
                return {
                    authors: "",
                    title: "",
                    publication_type: "",
                    pages: "",
                    link: x.getAttribute('href') ?? "",
                    display_string: x.textContent?.trim() ?? ""
                }
            })
            .filter(x => x.display_string?.length ?? 0 > 0)
            .filter(x => (x.link?.startsWith("https://") || x.link?.startsWith("http://") || x.link?.startsWith("www.")))
    }
    is_url(url: string): boolean {
        return true;
    }

}