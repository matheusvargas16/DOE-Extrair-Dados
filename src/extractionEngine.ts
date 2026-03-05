import type { ExtractedData } from './types';
import type { PageData } from './pdfService';

/**
 * Extraction Engine - RS DOE
 * Dynamic block-based extraction to handle varying record formats.
 */

const FIELD_LABELS = [
    'Protocolo:',
    'Processo:',
    'Assunto:',
    'Nome:',
    'Identificação Funcional/Vínculo:',
    'Tipo Vínculo:',
    'Cargo/Função:',
    'Lotação:',
    'Município:',
    'Função:',
    'Portaria:',
];

/**
 * Formats the context with clean line breaks for readability.
 */
function formatContext(raw: string): string {
    let result = raw.replace(/\s+/g, ' '); // Normalize all spaces first

    // Add newlines before labels
    for (const label of FIELD_LABELS) {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use double newline for major fields to create visual paragraphs
        const separator = (label === 'Assunto:' || label === 'Nome:' || label === 'Protocolo:' || label === 'Processo:') ? '\n\n' : '\n';
        result = result.replace(new RegExp(`\\s*(${escaped})`, 'gi'), `${separator}$1`);
    }

    // Handle the specific hyphen/newline in user request for Cargo/Função
    result = result.replace(/Cargo\/\s*Função/gi, '\nCargo/\nFunção:');

    // User requested: change disp.permuta to disposição
    result = result.replace(/disp\.?\s*permuta/gi, 'disposição');

    // User requested: remove "promove por ... da classe ..."
    result = result.replace(/promove\s+por\s+.*?\s+da\s+classe\s+[^\s,:]+/gi, '');

    return result.trim();
}

function normalizeForMatch(text: string): string {
    return text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

export class ExtractionEngine {

    static extractFromDocument(pages: PageData[], triggers: string[]): ExtractedData[] {
        const results: ExtractedData[] = [];
        const normalizedTriggers = triggers.map(t => normalizeForMatch(t));

        // 1. Join pages with markers
        const fullText = pages
            .map(p => `__PAGE_START_${p.number}__ ${p.text}`)
            .join(' ')
            .replace(/\s+/g, ' ');

        // 2. Split text into logical blocks based on record starters
        // A block starts with "Assunto:", "Protocolo:" or "Processo:"
        const rawBlocks = fullText.split(/(?=\b(?:Assunto:|Protocolo:|Processo:)\s*)/gi);

        let lastHeadingCRE = ""; // Persistence for section-level CRE headers

        let currentPos = 0;
        for (const block of rawBlocks) {
            if (block.trim().length < 20) {
                currentPos += block.length;
                continue;
            }

            const blockStart = fullText.indexOf(block, currentPos);
            const normalizedBlock = normalizeForMatch(block);

            // Check if this specific block mentions the target CRE
            const blockMentionsTrigger = normalizedTriggers.some(t => normalizedBlock.includes(t));

            // Update the persistent section header if we find a Lotação line that looks like a heading
            const headingLotacaoMatch = block.match(/Lota(?:ção|cao):\s*([^\n:]{5,200}?)(?=\s{2,}|Assunto:|Protocolo:|Processo:|$)/i);
            if (headingLotacaoMatch) {
                const normalizedHeading = normalizeForMatch(headingLotacaoMatch[1]);
                if (normalizedTriggers.some(t => normalizedHeading.includes(t))) {
                    lastHeadingCRE = headingLotacaoMatch[1].trim();
                } else {
                    lastHeadingCRE = ""; // New section for a different CRE
                }
            }

            // --- SAFEGUARDS against false positives ---
            // 1. Skip blocks that are too long (individual records are typically < 3000 chars)
            if (block.length > 3000) {
                currentPos = blockStart + block.length;
                continue;
            }

            // 2. Count how many pages this block spans. If it spans 3+, it's likely not a single record.
            const pageMarkersCheck = [...block.matchAll(/__PAGE_START_(\d+)__/g)];
            if (pageMarkersCheck.length >= 3) {
                currentPos = blockStart + block.length;
                continue;
            }

            // 3. Must contain a "Nome:" field to be a valid person record
            const hasNomeField = /Nome:/i.test(block);

            // A record is valid if the block itself has the trigger OR it's under an active CRE section
            // AND it must have a Nome field to be considered a personal record
            if ((blockMentionsTrigger || lastHeadingCRE) && hasNomeField) {

                // --- DYNAMIC FIELD EXTRACTION ---

                // 1. Subject (Assunto)
                const subjectMatch = block.match(/Assunto:\s*([^:]+?)(?=\s+(?:Processo:|Protocolo:|Nome:|Cargo|Lotação|ID|$))/i);
                const rawSubject = subjectMatch ? subjectMatch[1].trim() : "Diversos";
                const subject = this.cleanField(rawSubject);

                // 2. Name (Nome)
                const nameMatch = block.match(/Nome:\s*([^:]+?)(?=\s+(?:Processo:|Protocolo:|Assunto:|Cargo|Lotação|ID|Identific|$))/i);
                const name = nameMatch ? nameMatch[1].trim() : "Não Identificado";

                // 3. IDs (Priority: ID Funcional > Protocolo > Processo)
                const funcIdMatch = block.match(/Identificação\s+Funcional\/Vínculo:\s*([\d./\-]+)/i);
                const protocolMatch = block.match(/Protocolo:\s*([\d./\-]+)/i);
                const processoMatch = block.match(/Processo:\s*([\d./\-]+)/i);

                // For the "ID FUNCIONAL" field in results
                const id = funcIdMatch
                    ? funcIdMatch[1].trim()
                    : (protocolMatch ? protocolMatch[1].trim() : (processoMatch ? processoMatch[1].trim() : "S/N"));

                // Store processo for future use
                const processo = processoMatch ? processoMatch[1].trim() : undefined;

                // 4. Lotação
                const localLotacaoMatch = block.match(/Lota(?:ção|cao):\s*([^:]+?)(?=\s{2,}|Assunto:|Protocolo:|Processo:|Nome:|$)/i);
                const lotacao = localLotacaoMatch ? localLotacaoMatch[1].trim() : (lastHeadingCRE || "39ª CRE");

                // 5. Page Tracking - find the page where the actual record content (Nome:) is
                const nomePos = block.search(/Nome:/i);
                const textBeforeNome = block.slice(0, nomePos >= 0 ? nomePos : block.length);
                const pageMarkersBeforeNome = [...textBeforeNome.matchAll(/__PAGE_START_(\d+)__/g)];

                // The page of the record is the last page marker before Nome:
                let recordPage: number;
                if (pageMarkersBeforeNome.length > 0) {
                    recordPage = parseInt(pageMarkersBeforeNome[pageMarkersBeforeNome.length - 1][1]);
                } else {
                    // Nome: is before any page marker in this block, so it's on the page that started before the block
                    const prevText = fullText.slice(0, blockStart);
                    const lastPageMatchBefore = [...prevText.matchAll(/__PAGE_START_(\d+)__/g)].pop();
                    recordPage = lastPageMatchBefore ? parseInt(lastPageMatchBefore[1]) : 1;
                }

                // Also check if the record spans into the next page (text after Nome continues past a page marker)
                const textAfterNome = nomePos >= 0 ? block.slice(nomePos) : block;
                // Only look ~1500 chars after Nome for the relevant record content
                const relevantAfterNome = textAfterNome.slice(0, 1500);
                const pageMarkersAfterNome = [...relevantAfterNome.matchAll(/__PAGE_START_(\d+)__/g)];
                const pagesAfterNome = pageMarkersAfterNome.map(m => parseInt(m[1]));

                const allRecordPages = [recordPage, ...pagesAfterNome];
                const uniquePages = [...new Set(allRecordPages)].sort((a, b) => a - b);
                const pageDisplay = uniquePages.join(' e ');

                // 6. Trim originalText to only the relevant portion around the record
                // Find the start position: look for the nearest record-starting keyword before Nome
                let trimStart = 0;
                if (nomePos >= 0) {
                    // Look backwards from Nome for the nearest Assunto:, Protocolo: or Processo:
                    const beforeNome = block.slice(0, nomePos);
                    const lastAssunto = beforeNome.lastIndexOf('Assunto:');
                    const lastProtocolo = beforeNome.lastIndexOf('Protocolo:');
                    const lastProcesso = beforeNome.lastIndexOf('Processo:');
                    trimStart = Math.max(0, lastAssunto, lastProtocolo, lastProcesso);
                }

                // End position: ~1500 chars after the start to capture the full record
                const trimEnd = Math.min(block.length, trimStart + 1500);
                const trimmedBlock = block.slice(trimStart, trimEnd);

                const cleanText = trimmedBlock.replace(/__PAGE_START_\d+__/g, '\n[QUEBRA DE PÁGINA]\n').trim();

                results.push({
                    page: pageDisplay,
                    subject,
                    name,
                    id,
                    processo,
                    lotacao,
                    context: cleanText.slice(0, 150),
                    originalText: formatContext(cleanText),
                    selected: false,
                });
            }
            currentPos = blockStart + block.length;
        }

        return this.deduplicate(results);
    }

    static cleanField(text: string): string {
        return text
            .replace(/__PAGE_START_\d+__/g, '')
            .replace(/DIÁRIO\s+OFICIAL\s+Nº\s*\d+/gi, '')
            // Remove header dates/cities: PORTO ALEGRE, TERÇA-FEIRA, 24 DE FEVEREIRO DE 2026 133
            .replace(/[A-Z]{3,},?\s+[A-Z\-]{3,},\s+\d{1,2}\s+DE\s+[A-Z]{3,}\s+DE\s+\d{4}(\s+\d+)?/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static deduplicate(data: ExtractedData[]): ExtractedData[] {
        const seen = new Set<string>();
        return data.filter(item => {
            const key = `${item.id}-${item.name}-${item.subject}`.toLowerCase().replace(/\s+/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    static extractFromPage(text: string, pageNumber: number, triggers: string[]): ExtractedData[] {
        return this.extractFromDocument([{ number: pageNumber, text }], triggers);
    }
}
