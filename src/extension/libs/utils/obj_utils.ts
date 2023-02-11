/**
 * Converts an array of plain objects to csv format
 * Assumes that each field of the object array is a string (or likewise primitive)
 * @param oa object array to be converted
 * @returns csv string
 */
export function objArrayToCsv(oa: Record<any, any>[]): string {
    let headers = Object.keys(oa[0])

    let str = headers.map(x => `"${x}"`).join(",");
    str += "\n";
    str += oa
        .map(o => Object.values(o)
            .map(x => `${x}`.replaceAll('"', '""')) // Replace " with "" to avoid csv parse errors
            .map(x => x.length === 9 ? '' : '"' + x + '"')
            .join(','))
        .join('\n');

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
): Record<string, string>[] {
    if (columns.length !== column_predicate.length)
        throw Error("column and column predicate array length must be the same")
    for (let i = 0; i < table.length - 1; i++)
        if (table[i].length !== table[i + 1].length)
            throw Error("table must have consistent width")
    if (new Set(columns).size !== columns.length)
        throw Error("column cannot have duplicate headers")

    const column_predicate_mapping: Record<string, ((arg0: string) => (boolean))> = {};
    columns.forEach((val, i) => column_predicate_mapping[val] = column_predicate[i]);

    let max_score = 0;
    let max_columns: string[] = [];
    permute(columns).forEach(column_permutation => {
        const score = get_predicate_score(table, column_permutation.map(header => column_predicate_mapping[header]))

        if (score > max_score) {
            max_score = score;
            max_columns = column_permutation
        }
    })

    // convert table with headers to an array of objects
    // TODO: abstract into separate function
    const result: Record<string, string>[] = Array(table.length);
    for (let i = 0; i < table.length; i ++) {
        result[i] = {};
    }

    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < max_columns.length; j ++) {
            result[i][max_columns[j]] = table[i][j]
        }
    }

    return result;

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
 * @returns an score on how well the column predicates match the table.
 */
function get_predicate_score(table: string[][], column_predicate: ((arg0: string) => (boolean))[]): number {
    const matches: number[] = Array(table[0].length).fill(0);
    table.forEach((row) => {
        row.forEach((val, i) => {
            if (column_predicate[i](val))
                matches[i]++;
        })
    })

    const scores = matches.map(value => value * 1.0 / table.length);
    return scores.reduce((x, y) => x + y) * 1.0 / scores.length;
}

/**
 * Get all permutations of an array
 * Uses heap's algorithm, as seen here: https://en.wikipedia.org/wiki/Heap's_algorithm
 * @param arr array to permute
 * @returns an array of permutations of said array
 */
function permute<T>(arr: T[]): T[][] {
    const permutations: T[][] = []
    function permute_helper(k: number, A: T[]) {
        if (k === 1) {
            permutations.push(Array.from(A))
        } else {
            permute_helper(k - 1, A)

            for (let i = 0; i < k - 1; i++) {
                if (k % 2 == 0) {
                    const temp = A[i]
                    A[i] = A[k - 1]
                    A[k - 1] = temp
                } else {
                    const temp = A[0]
                    A[0] = A[k - 1]
                    A[k - 1] = temp
                }
                permute_helper(k - 1, A)
            }
        }
    }
    permute_helper(arr.length, arr);
    return permutations;

}

export const test_export = { permute, get_predicate_score }