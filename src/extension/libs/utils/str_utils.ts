import { cloneDeep } from "lodash";

/**
 * Convert a space-delimited string to titlecase
 * @param s string to convert
 * @returns a new titlecase string
 */
export function toTitleCase(s: string): string {
    return s.split(" ").map(substr => substr.slice(0,1).toLocaleUpperCase() + substr.slice(1).toLocaleLowerCase()).join(' ')
}


/**
 * Find a word, and return all occurrences word with a radius of n other words around it.
 * @param word word to search with
 * @param text text to search
 * @returns an array of search results
 */
export function findWordWithRadius(word: string, text: string, radius: number): string[] {
    const words = text.split(/\s*/).map(x => x.trim());
    let words_copy = cloneDeep(words);

    const indices = [];
    
    let sliced = 0
    while (true) {
        const index = words_copy.indexOf(word);
        if (index === -1)
            break;

        indices.push(index + sliced);
        words_copy = words_copy.slice(index + 1);
        sliced += index + 1;
    }

    const result =  indices.map(index => words.slice(index - radius, index + radius + 1).join(' '));
    // console.log({result})
    return result;

}