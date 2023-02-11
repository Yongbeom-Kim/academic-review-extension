export class DataFrame<T> {
    cols: number;
    rows: number;
    headers: string[];
    data: T[][];

    constructor(headers: string[], data: T[][]) {
        for (let i = 0; i < data.length; i ++)
            if (headers.length !== data[i].length)
                throw new Error("headers and data width is inconsistent");

        this.headers = headers;
        this.data = data;
        this.cols = headers.length;
        this.rows = data.length;
    }

    
}