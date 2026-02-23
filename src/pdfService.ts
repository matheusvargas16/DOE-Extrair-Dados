import * as pdfjsLib from 'pdfjs-dist';
import type { ReadingProgress } from './types';

// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PageData {
    number: number;
    text: string;
}

export class PDFService {
    /**
     * Loads a PDF from a File object only.
     * Direct URL fetching is not possible because the RS DOE portal
     * is a Single Page Application (Angular) and does not expose a
     * direct-download PDF endpoint.
     */
    static async loadPDF(source: File): Promise<pdfjsLib.PDFDocumentProxy> {
        const buffer = await source.arrayBuffer();
        const data = new Uint8Array(buffer);

        // Validate PDF magic bytes
        if (data.length < 5) throw new Error('Arquivo muito pequeno');
        const header = String.fromCharCode(...data.slice(0, 5));
        if (!header.startsWith('%PDF')) {
            throw new Error('O arquivo selecionado não é um PDF válido');
        }

        return await pdfjsLib.getDocument({ data }).promise;
    }

    static async readPDF(
        pdf: pdfjsLib.PDFDocumentProxy,
        onProgress: (progress: ReadingProgress) => void
    ): Promise<PageData[]> {
        const totalPages = pdf.numPages;
        const allPages: PageData[] = [];

        for (let i = 1; i <= totalPages; i++) {
            onProgress({
                currentPage: i,
                totalPages: totalPages,
                status: 'reading'
            });

            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            allPages.push({ number: i, text });
        }

        return allPages;
    }

    /**
     * Opens the DOE download page on the official portal.
     */
    static openDownloadPage(dateStr: string): void {
        const url = `https://www.diariooficial.rs.gov.br/diario/baixar-diario?td=DOE&dt=${dateStr}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    static getViewerUrl(dateStr: string, page: number = 1): string {
        return `https://www.diariooficial.rs.gov.br/diario?td=DOE&dt=${dateStr}&pg=${page}`;
    }
}
