import { cloneDeep } from "lodash";

/**
 * Convert a space-delimited string to titlecase
 * @param s string to convert
 * @returns a new titlecase string
 */
export function toTitleCase(s: string): string {
    return s.split(" ").map(substr => substr.slice(0, 1).toLocaleUpperCase() + substr.slice(1).toLocaleLowerCase()).join(' ')
}


/**
 * Find a word, and return all occurrences word with a radius of n other words around it.
 * @param word word to search with
 * @param text text to search
 * @returns an array of search results
 */
export function findWordWithRadius(word: string | RegExp, text: string, radius: number): string[] {
    const words = text.split(/\s+/).map(x => x.trim());
    let words_copy = cloneDeep(words);

    console.log({words_copy})
    console.log({word})
    const indices = [];

    let sliced = 0
    while (true) {
        let index = -1;

        for (let i = 0; i < words_copy.length; i++) {
            if (typeof word === 'string') {
                if (words_copy[i] === word) {
                    index = i;
                    break;
                }
            } else {
                if (word.test(words_copy[i])) {
                    index = i;
                    break;
                }
            }
        }

        if (index === -1)
            break;

        indices.push(index + sliced);
        words_copy = words_copy.slice(index + 1);
        sliced += index + 1;
    }

    const result = indices.map(index => words.slice(index - radius, index + radius + 1).join(' '));
    // console.log({result})
    return result;

}

/**
 * This function helps you find a word in two passes.
 * First looks for the @param first_word.
 * Then, checks if @param second_phrase is present in the radius (of words) around the @param first_word
 * Returns all snippets of such instances
 * @param first_word first needle
 * @param second_phrase second needle
 * @param text text to search
 * @param radius radius around word to search
 */
export function findPhraseinTwoPasses(first_word: string | RegExp, second_phrase: string | RegExp, text: string, radius: number): string[] {
    const first_pass = findWordWithRadius(first_word, text, radius)
    if (typeof second_phrase === 'string') {
        return first_pass.filter(excerpt => excerpt.includes(second_phrase));
    } else {
        return first_pass.filter(excerpt => second_phrase.test(excerpt));
    }
}

export function get_array_string_representation(array: any[]) {
    return '[' + array.map(item => `${item}`).join(', ') + ']';
}