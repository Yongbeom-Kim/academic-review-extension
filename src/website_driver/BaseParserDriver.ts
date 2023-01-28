export default interface ParserDriver {
    get_links(document: Document): ParsedUrl[];
    
    is_url(url: string): boolean
}

export type ParsedUrl = {
    authors: string,
    title: string,
    publication_type: string,
    pages: string,
    link: string,
    display_string: string
}

