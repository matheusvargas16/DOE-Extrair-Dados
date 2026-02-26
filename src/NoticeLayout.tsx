import React from 'react';
import type { ExtractedData, NoticeConfig } from './types';

interface NoticeLayoutProps {
  items: ExtractedData[];
  configs: Record<number, NoticeConfig>;
  doeDate: string;
}

export const NoticeLayout: React.FC<NoticeLayoutProps> = ({ items, configs, doeDate }) => {
  // Removed "Expediente" as requested
  const checkboxes = [
    ["Licença Prêmio", "Quinquênio(s)"],
    ["Avanço(s)", "Concede"],
    ["Dispensa", "Indefere"],
    ["Torna sem Efeito", "Altera o Nível"],
    ["Revoga", "Retifica"],
    ["Apostila", "Designa"],
    ["Enquadra", "Coloca"],
    ["Declara estável", "Aposenta"],
    ["Aut. afastamento", "Declara empossado"],
    ["Regularização Funcional", "Exonera"],
    ["Disposição", ""]
  ];

  const getWinnerLabel = (fullText: string) => {
    if (!fullText) return null;
    const text = fullText.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const candidates = [
      { label: "CONCEDE", keywords: ["CONCEDE"] },
      { label: "DISPENSA", keywords: ["DISPENSA"] },
      { label: "RETIFICA", keywords: ["RETIFICA"] },
      { label: "TORNA SEM EFEITO", keywords: ["TORNA SEM EFEITO"] },
      { label: "LICENÇA PRÊMIO", keywords: ["LICENCA PREMIO"] },
      { label: "QUINQUÊNIO(S)", keywords: ["QUINQUENIO", "ADICIONAL DE TEMPO DE SERVICO"] },
      { label: "AVANÇO(S)", keywords: ["AVANCO"] },
      { label: "INDEFERE", keywords: ["INDEFERE"] },
      { label: "ALTERA O NÍVEL", keywords: ["ALTERA O NIVEL"] },
      { label: "REVOGA", keywords: ["REVOGA"] },
      { label: "APOSTILA", keywords: ["APOSTILA"] },
      { label: "DESIGNA", keywords: ["DESIGNA"] },
      { label: "ENQUADRA", keywords: ["ENQUADRA"] },
      { label: "COLOCA", keywords: ["COLOCA"] },
      { label: "DECLARA ESTÁVEL", keywords: ["DECLARA ESTAVEL"] },
      { label: "APOSENTA", keywords: ["APOSENTA"] },
      { label: "AUT. AFASTAMENTO", keywords: ["AUT. AFASTAMENTO", "AFASTAMENTO"] },
      { label: "DECLARA EMPOSSADO", keywords: ["DECLARA EMPOSSADO"] },
      { label: "REGULARIZAÇÃO FUNCIONAL", keywords: ["REGULARIZACAO FUNCIONAL"] },
      { label: "EXONERA", keywords: ["EXONERA", "EXONERAR"] },
      { label: "DISPOSIÇÃO", keywords: ["DISPOSICAO", "PERMUTA", "DISP.PERMUTA"] },
    ];

    let winner = null;
    let minIdx = Infinity;

    for (const c of candidates) {
      for (const kw of c.keywords) {
        const idx = text.indexOf(kw);
        // We want the match that appears first in the "action" part of the text
        if (idx !== -1 && idx < minIdx) {
          minIdx = idx;
          winner = c.label;
        }
      }
    }
    return winner;
  };

  const isChecked = (fullText: string, label: string) => {
    if (!label) return false;
    const winner = getWinnerLabel(fullText);
    if (!winner) return false;

    // Normalizing both for comparison
    const normLabel = label.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ')[0];
    const normWinner = winner.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ')[0];

    return normLabel === normWinner;
  };

  return (
    <div className="print-only">
      {items.map((item, itemIdx) => {
        const isDisposicao = getWinnerLabel(item.originalText) === 'DISPOSIÇÃO';
        const city = configs[itemIdx]?.city || '_________________';
        const smecLabel = `SMEC de ${city}`;

        return (
          <div key={itemIdx} className="notices-grid">
            {/* Copy 0 = Escola, Copy 1 = SMEC (when Disposição) or identical copy */}
            {[0, 1].map((copyIdx) => {
              const schoolField = (isDisposicao && copyIdx === 1)
                ? smecLabel
                : (configs[itemIdx]?.school || '_________________');

              return (
                <div key={`${itemIdx}-${copyIdx}`} className="notice-page-segment">
                  <div className="notice-content">
                    <div className="notice-logo-container">
                      <img src="/logo-rs.png" alt="Estado RS" className="gov-logo" />
                      <div className="logo-divider"></div>
                      <div className="logo-text">
                        GOVERNO DO ESTADO<br />
                        <strong>RIO GRANDE DO SUL</strong><br />
                        <span style={{ fontSize: '7pt' }}>SECRETARIA DA EDUCAÇÃO</span>
                      </div>
                    </div>

                    <div className="notice-id-header">
                      COMUNICADO DRH/SDP {configs[itemIdx]?.number || '___'}/{configs[itemIdx]?.year || '2026'}
                    </div>

                    <div className="notice-fields">
                      <div className="field"><strong>NOME:</strong> {item.name}</div>
                      <div className="field"><strong>IDENTIDADE FUNCIONAL:</strong> {item.id}</div>
                      <div className="field"><strong>ESCOLA:</strong> {schoolField}</div>
                      <div className="field"><strong>MUNICÍPIO:</strong> {city}</div>
                    </div>

                    <p className="intro-text">
                      Comunicamos a Vossa Senhoria que o D.O.E. {doeDate} Página: {item.page} PUBLICOU:
                    </p>

                    <div className="checkboxes-table">
                      {checkboxes.map((row, rowIdx) => (
                        <div key={rowIdx} className="checkbox-row">
                          {row.map((label, cellIdx) => (
                            <div key={cellIdx} className="checkbox-cell">
                              {label ? (
                                <>
                                  <div className={`square-box ${isChecked(item.originalText, label) ? 'checked' : ''}`}>
                                    {isChecked(item.originalText, label) && '✕'}
                                  </div>
                                  <span className="checkbox-label">{label}</span>
                                </>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="notice-footer">
                      <div className="footer-line">
                        <div className="signature-area">
                          <span className="sign-line">__________________________</span>
                        </div>
                        <div className="date-area">
                          <span>{doeDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <style>{`
        .print-only {
          display: none;
        }

        @media print {
          .print-only {
            display: block;
            background: white;
            color: black!important;
          }

          @page {
            size: A4 landscape;
            margin: 0;
          }

          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact;
          }

          .print-only, .print-only * {
            visibility: visible;
          }

          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 297mm;
          }

          .notices-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 297mm;
            min-height: 210mm;
            page-break-after: always;
          }

          .notice-page-segment {
            padding: 8mm 12mm;
            border-right: 1px dashed #ccc;
            height: 210mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            background: white;
          }

          .notice-page-segment:nth-child(2n) {
            border-right: none;
          }

          .notice-content {
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            line-height: 1.4;
            color: black;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .notice-logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8mm;
          }
          
          .gov-logo {
            height: 38pt;
            width: auto;
          }
          
          .logo-divider {
            width: 0.5pt;
            height: 30pt;
            background-color: #000;
          }
          
          .logo-text {
            font-size: 9pt;
            line-height: 1.1;
            letter-spacing: 0.2pt;
          }

          .notice-id-header {
            text-align: left;
            margin-bottom: 8mm;
            font-size: 11pt;
            font-weight: bold;
          }

          .notice-fields {
            margin-bottom: 12pt;
            display: flex;
            flex-direction: column;
            gap: 2pt;
          }

          .field {
            border-bottom: 0.1pt solid #ddd;
            padding-bottom: 1pt;
            font-size: 10.5pt;
          }

          .field strong {
            margin-right: 5px;
          }

          .intro-text {
            margin-top: 5pt;
            margin-bottom: 15pt;
          }

          .checkboxes-table {
            display: flex;
            flex-direction: column;
            gap: 2.5pt;
            flex: 1;
          }

          .checkbox-row {
            display: flex;
          }

          .checkbox-cell {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 5pt;
            font-size: 9.3pt;
          }

          .square-box {
            width: 9.5pt;
            height: 9.5pt;
            border: 0.8pt solid black;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
            flex-shrink: 0;
            font-weight: bold;
          }

          .notice-footer {
            margin-top: auto;
            padding-top: 10pt;
            padding-bottom: 10mm;
          }

          .footer-line {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .sign-line {
            font-size: 10pt;
          }
          
          .date-area {
            font-size: 10pt;
          }
        }
      `}</style>
    </div>
  );
};
