/**
 * Converts an array of plain objects to csv format
 * Assumes that each field of the object array is a string (or likewise primitive)
 * @param oa object array to be converted
 * @returns csv string
 */
export function objArrayToCsv(oa: Record<any, any>[]): string {
    let headers = Object.keys(oa[0])
    console.log({ oa });

    let str = headers.map(x => `"${x}"`).join(",");
    str += "\n";
    str += oa
        .map(o => Object.values(o)
            .map(x => `${x}`.replaceAll('"', '""')) // Replace " with "" to avoid csv parse errors
            .map(x => x.length === 9 ? '' : '"' + x + '"')
            .join(','))
        .join('\n');

    console.log({ str });
    console.log(str);
    return str;
}

/**
 * Categorizes a string table with unknown columns to known columns via a series of predicate functions.
 * @param table A 2-D string array to categorise (with unknown columns)
 * @param columns An array of column headers to categorise string into
 * @param column_predicate An array of predicates that return true if string belongs in said column, false otherwise.
 * @returns the same data, but with column headers as the first row.
 */
export function categorizeStringTable(
    table: string[][],
    columns: string[],
    column_predicate: ((arg0: string) => (boolean))[]
): string[][] {
    if (columns.length !== column_predicate.length)
        throw Error("column and column predicate array length must be the same")
    for (let i = 0; i < table.length - 1; i++)
        if (table[i].length !== table[i + 1].length)
            throw Error("table must have consistent width")
    if (new Set(columns).size !== columns.length)
        throw Error("column cannot have duplicate headers")

    const column_predicate_mapping: Record<string, ((arg0: string) => (boolean))> = {};
    columns.forEach((val, i) => column_predicate_mapping[val] = column_predicate[i]);

    return [];


}

/**
 * Converts a 'table' of strings (2-D string array) with given columns into a JS plain object.
 * Columns and table must have same number of columns
 * @param columns an array of column headers
 * @param table a 2-d array of strings
 * @returns a JS object array
 */
export function tableToObject(columns: string[], table: string[][]): Record<string, string>[] {
    // TODO: Support columns that are too long and too short
    if (table[0].length != columns.length)
        throw new Error("Table and column must have same length")

    for (let i = 0; i < table.length - 1; i++)
        if (table[i].length != table[i + 1].length)
            throw new Error("All rows in table must have same length")

    if (new Set(columns).size != columns.length)
        throw new Error("Column must not have duplicate headers")

    let result: Record<string, string>[] = []
    table.forEach((row) => {
        result.push({});
        row.forEach((value, index) => {
            result[result.length - 1][columns[index]] = value;
        })
    })

    return result;
}


/**
 * Get a 'score' for each column of table on how well it matches to the column predicate.
 * @param table a 2d array of strings
 * @param column_predicate an array of predicates (string) => bool
 * @returns an array on the fraction of values in each column that match the predicate for said column.
 */
function get_predicate_score(table: string[][], column_predicate: ((arg0: string) => (boolean))[]): number[] {
    const matches = Array(10).fill(0);
    table.forEach((row) => {
        row.forEach((val, i) => {
            if (column_predicate[i](val))
                matches[i]++;
        })
    })

    return matches.map(value => value * 1.0 / table.length);
}

/**
 * Get all permutations of an array
 * @param arr array to permute
 * @returns an array of permutations of said array
 */
function permute<T>(arr: T[]): T[][] {
    const permutations: T[][] = []
    function permute_helper(k: number, A: T[]) {
        if (k === 1) {
            permutations.push(Array.from(A))
            console.log(permutations)
        } else {
            permute_helper(k-1, A)

            for (let i = 0; i < k-1; i ++) {
                if (k%2 == 0) {
                    const temp = A[i]
                    A[i] = A[k-1]
                    A[k-1] = temp
                } else {
                    const temp = A[0]
                    A[0] = A[k-1]
                    A[k-1] = temp
                }
                permute_helper(k-1, A)
            }
        }
    }
    permute_helper(arr.length, arr);
    return permutations;

}

export const test_export = { permute }