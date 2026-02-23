# DOE-RS Data Extractor (39ª CRE)

A 100% client-side application to parse the Diário Oficial do Rio Grande do Sul (DOE-RS) and extract data relevant to the 39ª Coordenadoria Regional de Educação.

## Features
- **Zero Backend:** All processing happens in your browser using WebWorkers.
- **Auto-Download:** Fetch the latest DOE based on today's date.
- **Intelligent Parsing:** Scans documents page-by-page with live progress tracking.
- **Contextual Extraction:** Uses heuristic patterns to identify subjects, names, and functional IDs associated with the 39ª CRE.

## Tech Stack
- **Framework:** React 19 + Vite 7
- **PDF Engine:** PDF.js (Mozilla)
- **Icons:** Lucide-React
- **Date Handling:** Date-fns
- **Styling:** Vanilla CSS with Glassmorphism

## How to use
1. **Source selection:** Pick a date, click "Baixar DOE de Hoje", or upload a PDF manually.
2. **Reading phase:** Watch the progress bar as the system extracts text from every page.
3. **Extraction phase:** Once reading is done, click "Extrair Dados Encontrados".
4. **Analysis:** Review the structured results in the data grid.

## Architectural Justification
- **PDF.js:** Chosen for its ability to handle text extraction accurately in a multi-threaded manner within the browser.
- **Heuristic Engine:** Since government PDFs often have fragmented text layers, the `ExtractionEngine` uses line-buffering and regex-affinity to reconstruct context.
- **Security & Privacy:** Since no data is sent to a server, this solution is inherently secure for sensitive official documents.

## Limitations
- **CORS:** Browser security policies (CORS) may block direct downloads from the official DOE site if they haven't enabled cross-origin headers. In such cases, please use the **Manual Upload** option.
