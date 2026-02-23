import React, { useState, useEffect } from 'react';
import { FileUp, ExternalLink, CheckCircle2, AlertCircle, FileText, Printer, FileSpreadsheet, ChevronDown, ChevronUp, Copy, Check, Trash2, Plus, RefreshCcw, Settings, X, ArrowLeft, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { PDFService } from './pdfService';
import type { PageData } from './pdfService';
import { ExtractionEngine } from './extractionEngine';
import { DEFAULT_TRIGGERS } from './types';
import type { ExtractedData, ReadingProgress, NoticeConfig } from './types';
import { PrintModal } from './PrintModal';
import { NoticeLayout } from './NoticeLayout';
import { exportToCSV } from './utils';

function App() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [triggers, setTriggers] = useState<string[]>(() => {
    const saved = localStorage.getItem('doe_triggers');
    return saved ? JSON.parse(saved) : DEFAULT_TRIGGERS;
  });
  const [newTrigger, setNewTrigger] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [progress, setProgress] = useState<ReadingProgress>({
    currentPage: 0,
    totalPages: 0,
    status: 'idle'
  });
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [allPages, setAllPages] = useState<PageData[]>([]);
  const [results, setResults] = useState<ExtractedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printConfigs, setPrintConfigs] = useState<Record<number, NoticeConfig>>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('doe_triggers', JSON.stringify(triggers));
  }, [triggers]);

  const handleAddTrigger = () => {
    const t = newTrigger.trim();
    if (t && !triggers.includes(t)) {
      setTriggers([...triggers, t]);
      setNewTrigger('');
    }
  };

  const handleRemoveTrigger = (t: string) => {
    setTriggers(triggers.filter(item => item !== t));
  };

  const handleResetTriggers = () => {
    setTriggers(DEFAULT_TRIGGERS);
  };

  // Reset state when loading a new file or going back
  const startNewSession = () => {
    setAllPages([]);
    setResults([]);
    setError(null);
    setProgress({ currentPage: 0, totalPages: 0, status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessPDF = async (file: File) => {
    startNewSession();
    setCurrentFile(file);
    try {
      setProgress(p => ({ ...p, status: 'fetching' }));
      const pdf = await PDFService.loadPDF(file);

      setProgress(p => ({ ...p, status: 'reading', totalPages: pdf.numPages }));
      const pages = await PDFService.readPDF(pdf, (prog) => {
        setProgress(prog);
      });

      setAllPages(pages);
      setProgress(p => ({ ...p, status: 'ready' }));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha ao processar o arquivo PDF. O arquivo pode estar corrompido ou o formato é inválido.');
      setProgress(p => ({ ...p, status: 'error' }));
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessPDF(file);
    }
  };

  const handleExtract = () => {
    setProgress(p => ({ ...p, status: 'extracting' }));

    setTimeout(() => {
      console.group('[DOE Extraction Debug]');
      console.log(`Total páginas lidas: ${allPages.length}`);
      console.log(`Gatilhos ativos:`, triggers);

      // Extract from document as a whole
      const findings = ExtractionEngine.extractFromDocument(allPages, triggers);
      console.log(`Resultados encontrados: ${findings.length}`, findings);

      const deduped = ExtractionEngine.deduplicate(findings);
      console.log(`Total após deduplicação: ${deduped.length}`);
      console.groupEnd();

      setResults(deduped);
      setProgress(p => ({ ...p, status: 'done' }));
    }, 500);
  };

  const handleOpenLocalPDF = (page: number) => {
    if (!currentFile) return;
    const fileURL = URL.createObjectURL(currentFile);
    // Open the local blob URL with the page fragment
    window.open(`${fileURL}#page=${page}`, '_blank');
  };

  const handleDebugRawText = () => {
    console.group('[DOE Raw Text — todas as páginas]');
    allPages.forEach(p => {
      console.groupCollapsed(`=== Página ${p.number} (${p.text.length} chars) ===`);
      console.log(p.text);
      console.groupEnd();
    });
    console.groupEnd();
    alert(`Texto bruto de ${allPages.length} página(s) exportado para o Console do navegador (F12 → Console).`);
  };


  const toggleSelect = (idx: number) => {
    setResults(prev => prev.map((item, i) =>
      i === idx ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setResults(prev => prev.map(item => ({ ...item, selected: isChecked })));
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateNotices = (configs: Record<number, NoticeConfig>) => {
    setPrintConfigs(configs);
    setIsPrintModalOpen(false);
    setTimeout(() => window.print(), 500);
  };

  const selectedResults = results.filter(r => r.selected);

  return (
    <>
      <header>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <h1>RS Diário Oficial Parser</h1>
          <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)} title="Configurações">
            <Settings size={24} />
          </button>
        </div>
        <p className="subtitle">Extrator Automático e Gerador de Comunicados</p>
      </header>

      <main className="main-card">
        {showSettings && (
          <div className="trigger-management">
            <div className="settings-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="icon-badge"><Settings size={20} /></div>
                <div>
                  <h3>Frases de Gatilho (Trigger Phrases)</h3>
                  <p className="subtitle">O sistema inicia a leitura apenas quando encontra uma destas frases na página.</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowSettings(false)}><X size={20} /></button>
            </div>

            <div className="trigger-input-area">
              <input
                type="text"
                placeholder="Ex: 39ª Coordenadoria..."
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrigger()}
              />
              <button className="btn-success" onClick={handleAddTrigger}>
                <Plus size={18} /> Adicionar
              </button>
            </div>

            <div className="triggers-grid">
              {triggers.map(t => (
                <div key={t} className="trigger-chip">
                  <span>{t}</span>
                  <button onClick={() => handleRemoveTrigger(t)} className="remove-trigger">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="settings-footer">
              <button className="btn-text" onClick={handleResetTriggers}>
                <RefreshCcw size={14} /> Restaurar Padrões de Fábrica
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <div style={{ flex: 1 }}>
              <span>{error}</span>
            </div>
            <button className="close-btn" onClick={() => setError(null)} style={{ marginLeft: '0.5rem' }}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="controls">
          <div className="control-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
              Baixar do Portal
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={() => PDFService.openDownloadPage(date)}
              >
                <ExternalLink size={18} /> Abrir Portal
              </button>
            </div>
          </div>

          <div className="control-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
              Carregar PDF baixado
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleManualUpload}
              style={{ display: 'none' }}
              id="file-upload"
              ref={fileInputRef}
            />
            <button className="btn-outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp size={18} /> Escolher Arquivo
            </button>
          </div>
        </div>

        {/* Reading Progress */}
        {(progress.status === 'reading' || progress.status === 'fetching' || progress.status === 'ready') && (
          <div className="progress-container">
            <h3>{progress.status === 'fetching' ? 'Iniciando Download...' : 'Lendo Documento...'}</h3>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${(progress.currentPage / (progress.totalPages || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="subtitle">
              Página {progress.currentPage} de {progress.totalPages || '-'}
            </p>

            {progress.status === 'ready' && (
              <div style={{ marginTop: '2rem' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ marginBottom: '1.5rem' }}>Leitura concluída! <strong>{allPages.length}</strong> página(s) carregadas.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={handleExtract} style={{ padding: '1rem 3rem' }}>
                    Extrair Dados Encontrados
                  </button>
                  <button className="btn-outline" onClick={handleDebugRawText} style={{ padding: '1rem 1.5rem' }} title="Exporta o texto bruto para o console (F12)">
                    🔍 Ver Texto Bruto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {progress.status === 'done' && (
          <section className="results-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  className="btn-text"
                  onClick={startNewSession}
                  title="Voltar para carregar outro arquivo"
                >
                  <ArrowLeft size={20} /> Voltar
                </button>
                <div style={{ borderLeft: '1px solid var(--border)', height: '24px', margin: '0 0.5rem' }}></div>
                <div>
                  <h2 style={{ margin: 0 }}>Resultados da Extração</h2>
                  <p className="subtitle" style={{ margin: 0 }}>Exibindo <strong>{results.length}</strong> registros encontrados.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-outline"
                  onClick={handleExtract}
                  title="Gerar dados novamente com os gatilhos atuais"
                >
                  <RotateCcw size={18} /> Refazer Extração
                </button>
                <button
                  className="btn-outline"
                  onClick={() => exportToCSV(results, `DOE_${date}.csv`)}
                >
                  <FileSpreadsheet size={18} /> Exportar CSV
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setIsPrintModalOpen(true)}
                  disabled={selectedResults.length === 0}
                >
                  <Printer size={18} /> {selectedResults.length > 0 ? `Imprimir ${selectedResults.length}` : 'Imprimir Seleção'}
                </button>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={results.length > 0 && results.every(r => r.selected)}
                        />
                      </th>
                      <th style={{ width: '60px' }}>PÁG.</th>
                      <th>SERVIDOR / INTERESSADO</th>
                      <th>LOTAÇÃO</th>
                      <th>ASSUNTO</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr className={`data-row ${item.selected ? 'selected' : ''}`} onClick={() => toggleSelect(idx)}>
                          <td>
                            <input
                              type="checkbox"
                              checked={!!item.selected}
                              onChange={(e) => { e.stopPropagation(); toggleSelect(idx); }}
                            />
                          </td>
                          <td><span className="page-badge">{item.page}</span></td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{item.name}</div>
                            <div className="id-chip" style={{ marginTop: '0.25rem' }}>{item.id}</div>
                          </td>
                          <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.lotacao}</span></td>
                          <td>
                            <div className={`subject-tag ${item.subject.toUpperCase().includes('ADM') ? 'tag-yellow' : ''}`}>
                              {item.subject}
                            </div>
                          </td>
                          <td>
                            <button
                              className="expand-btn"
                              onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === idx ? null : idx); }}
                            >
                              {expandedRow === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </td>
                        </tr>
                        {expandedRow === idx && (
                          <tr className="expanded-content-row">
                            <td colSpan={6}>
                              <div className="original-context-box">
                                <div className="context-header">
                                  <strong>CONTEXTO ORIGINAL EXTRAÍDO (OCR)</strong>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      className="btn-outline"
                                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                      onClick={() => handleOpenLocalPDF(item.page)}
                                    >
                                      <ExternalLink size={14} /> Abrir na Página {item.page} (Local)
                                    </button>
                                    <button className="btn-copy" onClick={() => handleCopy(item.originalText, idx)}>
                                      {copiedId === idx ? <Check size={14} /> : <Copy size={14} />}
                                      {copiedId === idx ? 'Copiado!' : 'Copiar'}
                                    </button>
                                  </div>
                                </div>
                                <pre className="context-text">{item.originalText}</pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Nenhuma ocorrência encontrada com os gatilhos atuais.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {isPrintModalOpen && (
        <PrintModal
          selectedItems={selectedResults}
          doeDate={format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy')}
          onClose={() => setIsPrintModalOpen(false)}
          onGenerate={handleGenerateNotices}
        />
      )}

      {selectedResults.length > 0 && (
        <NoticeLayout
          items={selectedResults}
          configs={printConfigs}
          doeDate={format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy')}
        />
      )}
    </>
  );
}

export default App;
