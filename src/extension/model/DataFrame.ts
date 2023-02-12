import { permute } from '../libs/utils/obj_utils';
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
            
        if (new Set(headers).size != headers.length)
            throw new Error("Column headers cannot have duplicate");

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
    static FromPlainObjectArray<T>(objects: Record<string, T>[]): DataFrame<T> {
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
                        return '"' + `${cell}`.replaceAll('"', '""') + '"'
                    }
                }).join(',')
            ).join('\n')

        return header_str + '\n' + body_str;
    }

    /**
     * Get a JS Plain Object representation of the target dataframe
     * @returns a object
     */
    toPlainObjectArray(): Record<string, T>[] {
        const result: Record<string, T>[] = []
        this.data.forEach(row => {
            result.push({})
            row.forEach((cell, i) => {
                if (cell !== DataFrame.EMPTY_CELL)
                    result.at(-1)![this.headers[i]] = cell;
            })
        })

        return result;
    }



    /*
        Dynamic column matching
    */
    /**
     * Automatically match column headers to table, given headers, data, and a set of predicate functions.
     * @param column_headers an array of column headers
     * @param data a 2-d array of data
     * @param column_header_predicates a plain object of headers mapped to predicate functions 
     */
    static AutoHeaders<T>(
        column_headers: string[],
        data: (T | undefined)[][],
        column_header_predicates: Record<string, ((arg0: T) => (boolean))>
    ): DataFrame<T> {
        let maxScore = 0;
        let best_match: DataFrame<T>;

        permute(column_headers).forEach(column_headers => {
            const df = DataFrame.CreateUnevenDF(column_headers, data);
            const score = df.getMatchScore(column_header_predicates);
            if (score > maxScore) {
                best_match = df;
                maxScore = score;
            }
        })

        return best_match!;
    }

    /**
     * 
     * @param column_predicates 
     * @returns a float score between 0 and 1
     */
    private getMatchScore(column_predicates: Record<string, ((arg0: T) => (boolean))>): number {
        let matches = 0

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = this.data[i][j]
                if (cell === DataFrame.EMPTY_CELL)
                    continue

                if (column_predicates[this.headers[j]](cell))
                    matches++
            }
        }

        return matches * 1.0 / this.rows / this.cols;
    }


}