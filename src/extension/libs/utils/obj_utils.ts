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
 * @param data A 2-D string array to categorise (with unknown columns)
 * @param columns An array of column headers to categorise string into
 * @param column_predicate An array of predicates that return true if string belongs in said column, false otherwise.
 * @returns the same data, but with column headers as the first row.
 */
export function categorizeStringTable(
    data: string[][],
    columns: string[],
    column_predicate: ((arg0: string) => (boolean))
): string[][] {
    // TODO
    return null;
}

/**
 * Converts a 'table' of strings (2-D string array) with given columns into a JS plain object.
 * Columns and table must have same number of columns
 * @param columns an array of column headers
 * @param table a 2-d array of strings
 * @returns a JS object array
 */
export function tableToObject (columns: string[], table: string[][]): Record<string, string>[] {
    if (table[0].length != columns.length)
        throw new Error("Table and column must have same length")

    for (let i = 0; i < table.length-1; i ++)
        if (table[i].length != table[i+1].length)
            throw new Error("All rows in table must have same length")
    
    if (new Set(columns).size != columns.length)
        throw new Error("Column must not have duplicate headers")
            
    let result: Record<string, string>[]= []
    table.forEach((row) => {
        result.push({});
        row.forEach((value, index) => {
            result[result.length-1][columns[index]] = value;
        })
    })

    return result;
}