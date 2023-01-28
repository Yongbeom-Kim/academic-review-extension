/**
 * Convert a space-delimited string to titlecase
 * @param s string to convert
 * @returns a new titlecase string
 */
export function toTitleCase(s: string): string {
    return s.split(" ").map(substr => substr.slice(0,1).toLocaleUpperCase() + substr.slice(1).toLocaleLowerCase()).join(' ')
}