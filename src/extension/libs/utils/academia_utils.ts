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