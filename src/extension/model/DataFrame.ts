/**
 * A DataFrame class - an abstraction of a table of data with headers.
 */
export class DataFrame<T> {
    static EMPTY_CELL = undefined;

    cols: number;
    rows: number;
    headers: string[];
    data: (T | undefined)[][];

    constructor(headers: string[], data: (T | undefined)[][]) {
        for (let i = 0; i < data.length; i++)
            if (headers.length !== data[i].length)
                throw new Error("headers and data width is inconsistent");

        this.headers = headers;
        this.data = data;
        this.cols = headers.length;
        this.rows = data.length;
    }

    /**
     * Create an "uneven" dataframe. Any data missing will be automatically filled in.
     * If there are insufficient headers, throws an error.
     * @param headers headers for the table
     * @param data data for the table
     * @returns a new DataFrame object.
     */
    static CreateUnevenDF<T>(headers: string[], data: (T | undefined)[][]): DataFrame<T> {
        let max_width = headers.length;
        data.forEach(row => max_width = Math.max(max_width, row.length))
        if (max_width > headers.length)
            throw new Error('max width of data cannot be greater than header length')

        data.forEach(row => {
            while (row.length < max_width)
                row.push(DataFrame.EMPTY_CELL)
        })

        return new DataFrame(headers, data)
    }

    /**
     * Create a dataframe from an array of plain objects.
     * Headers will be the collective union of all keys.
     * Entries will be the values of each object (DataFrame.EMPTY_CELL if missing).
     * @param objects an array of plain objects to parse into a DataFrame.
     * @returns a DataFrame object.
     */
    static FromPlainObject<T>(objects: Record<string, T>[]): DataFrame<T> {
        const columns: string[] = []
        objects.forEach(object => {
            Object.keys(object).forEach(key => {
                if (!columns.includes(key))
                    columns.push(key)
            })
        })

        const data = objects.map(object => {
            const row: (T | undefined)[] = []
            columns.forEach(column => {
                if (column in object)
                    row.push(object[column])
                else
                    row.push(this.EMPTY_CELL)
            })
            return row;
        })

        return new DataFrame(columns, data);
    }

    static EMPTY_CSV_CELL = '""';
    /**
     * Get a CSV representation of the target dataframe.
     * @returns a string
     */
    toCsvString(): string {
        const header_str = this.headers
            .map(header => header.replaceAll('"', '""'))
            .map(header => '"' + header + '"')
            .join(',')

        const body_str = this.data
            .map(row =>
                row.map(cell => {
                    if (cell === DataFrame.EMPTY_CELL) {
                        return DataFrame.EMPTY_CSV_CELL;
                    } else {
                        return '"' + `${cell}`.replaceAll('"', '""')  + '"'
                    }
                }).join(',')
            ).join('\n')

        return header_str + '\n' + body_str;
    }

    toPlainObjectArray(): Record<string, T>[] {
        const result: Record<string, T>[]= []
        this.data.forEach(row => {
            result.push({})
            row.forEach((cell, i) => {
                if (cell !== DataFrame.EMPTY_CELL)
                    result.at(-1)![this.headers[i]] = cell;
            })
        })

        return result;
    }


}