import { ParsedUrl } from "../model/ParsedUrlObject";

export default interface ParserDriver {
    get_links(document: Document): ParsedUrl[];
    
    is_url(url: string): boolean
}
