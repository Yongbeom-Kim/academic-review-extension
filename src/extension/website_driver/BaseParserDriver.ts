import { DataFrame } from "../model/DataFrame";

export default interface ParserDriver {
    get_links(document: Document): DataFrame<string>;
    
    is_url(url: string): boolean
}
