/**
 * Given a string of authors, fetch the author count
 * @param authors string of authors
 * @returns the number of authors inside the string.
 */
export const get_author_count = (authors: string) => {
    let author_count = 0;
    authors.trim().split(/\s*(and|&|,)\s*/i).forEach(author => {
        if (!(/\s/).test(author)) // only one word is not an author (e.g. Frank, Tom & Billy Bob is only 2)
            return

        author_count++;
    })

    return author_count;
}

export const METADATA = {
    VolumeNumber: 'volume_no',
    Year: 'year',
    Authors: 'authors',
    AuthorCount: 'author_count',
    Title: 'title',
    PageNumber: 'page_no',
    PublicationType: 'publication_type',
    Keywords: 'keywords',
    Countries: 'countries',
    Link: 'link',
    Display: 'display_string',
}

export const DATA_ORDERING = [
    METADATA.VolumeNumber,
    METADATA.Year,
    METADATA.Authors,
    METADATA.AuthorCount,
    METADATA.Title,
    METADATA.PageNumber,
    METADATA.PublicationType,
    METADATA.Keywords,
    METADATA.Countries,
    METADATA.Link,
    METADATA.Display
];