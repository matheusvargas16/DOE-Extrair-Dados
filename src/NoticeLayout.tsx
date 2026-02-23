import React from 'react';
import type { ExtractedData, NoticeConfig } from './types';

interface NoticeLayoutProps {
    items: ExtractedData[];
    configs: Record<number, NoticeConfig>;
    doeDate: string;
}

export const NoticeLayout: React.FC<NoticeLayoutProps> = ({ items, configs, doeDate }) => {
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
        ["Ratifica o ato Exp: ...", "Exonera a pedido Exp: ..."]
    ];

    const isChecked = (subject: string, label: string) => {
        const s = subject.toUpperCase();
        const l = label.toUpperCase();

        if (l.includes("ADMISSÃO") && s.includes("ADMITE")) return true;
        if (l.includes("REVOGA") && s.includes("REVOGA")) return true;
        if (l.includes("CONCEDE") && s.includes("CONCEDE")) return true;
        if (l.includes("RETIFICA") && s.includes("RETIFICA")) return true;
        if (l.includes("EXONERA") && s.includes("EXONERA")) return true;
        if (l.includes("PROMOVE") && s.includes("PROMOVE")) return true;

        return s.includes(l.split(' ')[0]);
    };

    return (
        <div className="print-only">
            <div className="notices-grid">
                {items.map((item, idx) => (
                    <div key={idx} className="notice-page-segment">
                        <div className="notice-content">
                            <div className="notice-header">
                                <strong>COMUNICADO DRH/SDP {configs[idx]?.number || '___'}/{configs[idx]?.year || '2026'}</strong>
                            </div>

                            <div className="notice-fields">
                                <div className="field"><strong>NOME:</strong> {item.name}</div>
                                <div className="field"><strong>ID FUNCIONAL:</strong> {item.id}</div>
                                <div className="field"><strong>ESCOLA:</strong> {configs[idx]?.school || '_________________'}</div>
                                <div className="field"><strong>MUNICÍPIO:</strong> {configs[idx]?.city || '_________________'}</div>
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
                                                {label.includes("Exp:") && <span className="underline">_________</span>}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="notice-footer">
                                <div className="footer-line">
                                    <span>_________________________________</span>
                                    <span>{doeDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .print-only {
          display: none;
        }

        @media print {
          .print-only {
            display: block;
            background: white;
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
            height: 210mm;
          }

          .notices-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 297mm;
            height: 210mm;
            page-break-after: always;
          }

          .notice-page-segment {
            padding: 10mm;
            border-right: 1px dashed #000;
            height: 210mm;
            box-sizing: border-box;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .notice-page-segment:nth-child(2n) {
            border-right: none;
          }

          .notice-content {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10.5pt;
            line-height: 1.3;
            color: black;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .notice-header {
            text-align: center;
            margin-bottom: 25pt;
            font-size: 12pt;
            border-bottom: 1.5pt solid black;
            padding-bottom: 10pt;
          }

          .notice-fields {
            margin-bottom: 20pt;
            display: grid;
            grid-template-columns: 1fr;
            gap: 6pt;
          }

          .field {
            border-bottom: 0.5pt solid #eee;
            padding-bottom: 2pt;
          }

          .intro-text {
            margin-top: 15pt;
            margin-bottom: 15pt;
            font-style: italic;
          }

          .checkboxes-table {
            display: flex;
            flex-direction: column;
            gap: 4pt;
            flex: 1;
          }

          .checkbox-row {
            display: flex;
            gap: 15pt;
          }

          .checkbox-cell {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 6pt;
            font-size: 9pt;
          }

          .square-box {
            width: 11pt;
            height: 11pt;
            border: 1pt solid black;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
            flex-shrink: 0;
            font-weight: bold;
          }

          .square-box.checked {
            background: #f0f0f0;
          }

          .notice-footer {
            margin-top: auto;
            border-top: 1pt solid black;
            padding-top: 15pt;
            padding-bottom: 10mm;
          }

          .footer-line {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
        }
      `}</style>
        </div>
    );
};
