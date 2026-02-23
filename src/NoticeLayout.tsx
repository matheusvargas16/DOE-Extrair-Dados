import React from 'react';
import type { ExtractedData, NoticeConfig } from './types';

interface NoticeLayoutProps {
  items: ExtractedData[];
  configs: Record<number, NoticeConfig>;
  doeDate: string;
}

export const NoticeLayout: React.FC<NoticeLayoutProps> = ({ items, configs, doeDate }) => {
  // Group items into pairs for A4 landscape (2 notices per page)
  const pairs: ExtractedData[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }

  const checkboxes = [
    ["Licença Prêmio", "Quinquênio(s)"],
    ["Avanço(s)", "Adicional de pessoas com deficiência"],
    ["Promove por ... da Classe ... / ... a/c de ...", "Concede Exp: ..."],
    ["Dispensa Exp: ...", "Indefere Exp: ..."],
    ["Torna sem Efeito Exp: ...", "Altera o Nível Exp: ..."],
    ["Revoga Exp: ...", "Retifica Exp: ..."],
    ["Apostila Exp: ...", "Designa Exp: ..."],
    ["Enquadra Exp: ...", "Coloca Exp: ..."],
    ["Declara estável Exp: ...", "Aposenta Exp: ..."],
    ["Aut. afastamento Exp: ...", "Admissão Exp: ..."],
    ["Declara empossado Exp: ...", "Regularização Func. Exp: ..."],
    ["Exonera Exp: ...", "Disp. permuta Exp: ..."],
    ["Ratifica o ato Exp: ...", "Torna sem efeito Exp: ..."]
  ];

  const isChecked = (subject: string, label: string) => {
    const s = subject.toUpperCase();
    const l = label.toUpperCase();

    if (l.includes("ADMISSÃO") && s.includes("ADMITE")) return true;
    if (l.includes("REVOGA") && s.includes("REVOGA")) return true;
    if (l.includes("CONCEDE") && (s.includes("CONCEDE") || s.includes("PUBLICAÇÃO"))) return true;
    if (l.includes("RETIFICA") && s.includes("RETIFICA")) return true;
    if (l.includes("EXONERA") && (s.includes("EXONERAR") || s.includes("EXONERADO"))) return true;
    if (l.includes("PROMOVE") && s.includes("PROMOVE")) return true;
    if (l.includes("APOSENTA") && s.includes("APOSENTA")) return true;

    return s.includes(l.split(' ')[0]);
  };

  return (
    <div className="print-only">
      {pairs.map((pair, pageIdx) => (
        <div key={pageIdx} className="notices-grid">
          {pair.map((item, localIdx) => {
            const globalIdx = pageIdx * 2 + localIdx;
            return (
              <div key={globalIdx} className="notice-page-segment">
                <div className="notice-content">
                  <div className="notice-logo-placeholder">
                    <div className="logo-icon">⚜</div>
                    <div className="logo-text">
                      ESTADO DO RIO GRANDE DO SUL<br />
                      <strong>Secretaria da Educação</strong>
                    </div>
                  </div>

                  <div className="notice-id-header">
                    COMUNICADO DRH/SDP {configs[globalIdx]?.number || '___'}/{configs[globalIdx]?.year || '2026'}
                  </div>

                  <div className="notice-fields">
                    <div className="field"><strong>NOME:</strong> {item.name}</div>
                    <div className="field"><strong>IDENTIDADE FUNCIONAL:</strong> {item.id}</div>
                    <div className="field"><strong>ESCOLA:</strong> {configs[globalIdx]?.school || '_________________'}</div>
                    <div className="field"><strong>MUNICÍPIO:</strong> {configs[globalIdx]?.city || '_________________'}</div>
                  </div>

                  <p className="intro-text">
                    Comunicamos a Vossa Senhoria que o D.O.E. {doeDate} Página: {item.page} PUBLICOU:
                  </p>

                  <div className="checkboxes-table">
                    {checkboxes.map((row, rowIdx) => (
                      <div key={rowIdx} className="checkbox-row">
                        {row.map((label, cellIdx) => (
                          <div key={cellIdx} className="checkbox-cell">
                            <div className={`square-box ${isChecked(item.subject, label) ? 'checked' : ''}`}>
                              {isChecked(item.subject, label) && '✕'}
                            </div>
                            <span className="checkbox-label">{label}</span>
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
      ))}

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
            border-bottom: 1px solid transparent;
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

          .notice-logo-placeholder {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5mm;
          }
          
          .logo-icon {
            font-size: 24pt;
          }
          
          .logo-text {
            font-size: 8pt;
            letter-spacing: 0.5pt;
          }

          .notice-id-header {
            text-align: left;
            margin-bottom: 10mm;
            font-size: 11pt;
            font-weight: bold;
          }

          .notice-fields {
            margin-bottom: 15pt;
            display: flex;
            flex-direction: column;
            gap: 2pt;
          }

          .field {
            border-bottom: 0.2pt solid #eee;
            padding-bottom: 1pt;
            font-size: 10.5pt;
          }

          .field strong {
            margin-right: 5px;
          }

          .intro-text {
            margin-top: 10pt;
            margin-bottom: 10pt;
          }

          .checkboxes-table {
            display: flex;
            flex-direction: column;
            gap: 3pt;
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
            font-size: 9.5pt;
          }

          .square-box {
            width: 10pt;
            height: 10pt;
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
            padding-top: 15pt;
            padding-bottom: 12mm;
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
