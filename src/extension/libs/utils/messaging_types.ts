/**
 * Type to signify request to download a batch of PDFs from a certain url with a certain filename
 */
export type BatchDownloadPDFRequest = { msg: string, urls: string[], filenames: string[] }
export const BATCH_DOWNLOAD_REQUEST_MESSAGE = 'download_pdf' //msg field of above type

/**
 * Type to signify requests containing metadata of batch-downloaded PDFs
 * In some ways, this is a response to the batch-download PDF response.
 */
export type BatchDownloadPDFResponse = {msg: string, ids: number[], paths: string[]}
export const BATCH_DOWNLOAD_RESPONSE_MSG = 'download_pdf_done' //msg field of above type