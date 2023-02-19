/**
 * Type to signify request to download a batch of PDFs from a certain url with a certain filename
 */
export type BatchDownloadPDFRequest = { msg: string, urls: string[], filenames: string[] }
export const BATCH_PDF_DOWNLOAD_MESSAGE = 'download_pdf'