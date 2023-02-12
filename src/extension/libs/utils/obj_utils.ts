import { DataFrame } from "../../model/DataFrame"

/**
 * @deprecated - use DataFrame functions instead
 * Converts an array of plain objects to csv format
 * Assumes that each field of the object array is a string (or likewise primitive)
 * @param oa object array to be converted
 * @returns csv string
 */
export function objArrayToCsv(oa: Record<any, any>[]): string {
    return DataFrame.FromPlainObjectArray(oa).toCsvString();
}

const UNDEFINED_STR = '__undefined__'
/**
 * @deprecated
 * Categorizes a string table with unknown columns to known columns via a series of predicate functions.
 * @param table A 2-D string array to categorise (with unknown columns). Table shoud not have any undefined values
 * @param columns An array of column headers to categorise string into
 * @param column_predicate An array of predicates that return true if string belongs in said column, false otherwise.
 * @returns the same data, but with column headers as the first row.
 */
export function categorizeStringTable(
    table: (string | undefined)[][],
    columns: string[],
    column_predicate: ((arg0: string) => (boolean))[]
): Record<string, string>[] {
    if (columns.length !== column_predicate.length)
        throw Error("column and column predicate array length must be the same")
    
    const column_predicate_mapping: Record<string, (arg0: string) => (boolean)> = {};
    for (let i = 0; i < columns.length; i ++) {
        column_predicate_mapping[columns[i]] = column_predicate[i];
    }
    return DataFrame.AutoHeaders(columns, table, column_predicate_mapping).toPlainObjectArray();
}

/**
 * @deprecated
 * Converts a 'table' of strings (2-D string array) with given columns into a JS plain object.
 * Columns and table must have same number of columns
 * @param columns an array of column headers
 * @param table a 2-d array of strings
 * @returns a JS object array
 */
export function tableToObject(columns: string[], table: (string | undefined)[][]): Record<string, string>[] {

    return new DataFrame(columns, table).toPlainObjectArray();
}


/**
 * @deprecated
 * Use @method DataFrame.getMatchScore instead
 * Get a 'score' for each column of table on how well it matches to the column predicate.
 * @param table a 2d array of strings. undefined values will automatically return false on the predicate.
 * @param column_predicate an array of predicates (string) => bool
 * @returns an score on how well the column predicates match the table.
 */
function get_predicate_score(table: (string | undefined)[][], column_predicate: ((arg0: string) => (boolean))[]): number {
    const columns = [];
    for (let i = 0; i < column_predicate.length; i ++) {
        columns.push(i.toString())
    }
    const pred_maps: Record<string, ((arg0: string) => boolean)> = {};
    column_predicate.forEach((val,i) => pred_maps[i] = column_predicate[i]);

    return DataFrame.CreateUnevenDF(columns, table)['getMatchScore'](pred_maps)
}

/**
 * Get all permutations of an array
 * Uses heap's algorithm, as seen here: https://en.wikipedia.org/wiki/Heap's_algorithm
 * @param arr array to permute
 * @returns an array of permutations of said array
 */
export function permute<T>(arr: T[]): T[][] {
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