import React, { useState, useEffect } from 'react';
import { X, Printer, MapPin, School, FileText } from 'lucide-react';
import type { ExtractedData, NoticeConfig } from './types';
import { SCHOOLS_BY_CITY } from './types';

interface PrintModalProps {
  selectedItems: ExtractedData[];
  doeDate: string;
  onClose: () => void;
  onGenerate: (configs: Record<number, NoticeConfig>) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ selectedItems, doeDate, onClose, onGenerate }) => {
  const [noticeNumber, setNoticeNumber] = useState(() => localStorage.getItem('doe_last_notice_number') || '___');
  const [year] = useState(new Date().getFullYear().toString());
  const [configs, setConfigs] = useState<Record<number, NoticeConfig>>({});

  const cities = Object.keys(SCHOOLS_BY_CITY).sort();

  useEffect(() => {
    const baseNumber = parseInt(noticeNumber);
    const isNumeric = !isNaN(baseNumber);

    setConfigs(prev => {
      const newConfigs: Record<number, NoticeConfig> = {};
      selectedItems.forEach((_, index) => {
        const currentNum = isNumeric ? (baseNumber + index).toString() : noticeNumber;
        newConfigs[index] = {
          city: prev[index]?.city || '',
          school: prev[index]?.school || '',
          date: doeDate,
          year: year,
          number: currentNum
        };
      });
      return newConfigs;
    });
  }, [selectedItems, noticeNumber, year, doeDate]);

  const handleUpdateConfig = (index: number, field: keyof NoticeConfig, value: string) => {
    if (field === 'number') {
      // If they manually edit one number, we don't necessarily want to re-sequence everything
      // or maybe we do? For now, just update the single one.
      setConfigs(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: value }
      }));
      return;
    }
    setConfigs(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
        // Reset school if city changes
        ...(field === 'city' ? { school: '' } : {})
      }
    }));
  };

  const handleGenerate = () => {
    // Save the LAST number + 1 to localStorage for next time
    const lastIndex = selectedItems.length - 1;
    const lastNum = parseInt(configs[lastIndex]?.number);
    if (!isNaN(lastNum)) {
      localStorage.setItem('doe_last_notice_number', (lastNum + 1).toString());
    }
    onGenerate(configs);
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-badge"><Printer size={20} /></div>
            <div>
              <h3>Configurar Impressão</h3>
              <p className="subtitle">Revise e preencha os dados de lotação para os {selectedItems.length} registros selecionados.</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="global-config">
            <div className="control-group">
              <label>Nº Inicial do Comunicado</label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={noticeNumber}
                  onChange={(e) => setNoticeNumber(e.target.value)}
                  style={{ width: '80px', textAlign: 'center' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>/ {year}</span>
              </div>
            </div>
          </div>

          <div className="items-list">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="item-config-card">
                <div className="item-info">
                  <div className="item-badge">#{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="item-name">{item.name}</div>
                    <div className="item-sub">{item.subject}</div>
                    <div className="item-id-badge"><FileText size={12} /> {item.id}</div>
                  </div>
                </div>

                <div className="item-selectors">
                  <div className="selector-group">
                    <label>Nº COMUNICADO</label>
                    <input
                      type="text"
                      className="item-number-input"
                      value={configs[idx]?.number || ''}
                      onChange={(e) => handleUpdateConfig(idx, 'number', e.target.value)}
                    />
                  </div>

                  <div className="selector-group">
                    <label><MapPin size={12} /> MUNICÍPIO</label>
                    <select
                      value={configs[idx]?.city || ''}
                      onChange={(e) => handleUpdateConfig(idx, 'city', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>

                  <div className="selector-group">
                    <label><School size={12} /> ESCOLA</label>
                    <select
                      value={configs[idx]?.school || ''}
                      onChange={(e) => handleUpdateConfig(idx, 'school', e.target.value)}
                      disabled={!configs[idx]?.city}
                    >
                      <option value="">{configs[idx]?.city ? 'Selecione...' : '-'}</option>
                      {configs[idx]?.city && SCHOOLS_BY_CITY[configs[idx].city].map(school => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={selectedItems.some((_, idx) => !configs[idx]?.city || !configs[idx]?.school)}
          >
            <Printer size={18} /> Gerar Comunicados
          </button>
        </div>

      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .icon-badge {
          background: #f0f9ff;
          color: var(--primary);
          padding: 0.75rem;
          border-radius: 0.75rem;
        }

        .close-btn {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }

        .close-btn:hover {
          background: #f1f5f9;
          color: var(--text-main);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .global-config {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8fafc;
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-config-card {
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--primary);
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: center;
        }

        .item-info {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .item-badge {
          background: #f1f5f9;
          color: #64748b;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
        }

        .item-name {
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          font-size: 0.95rem;
        }

        .item-sub {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0.25rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-id-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.15rem 0.5rem;
          border-radius: 0.35rem;
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
        }

        .item-selectors {
          display: grid;
          grid-template-columns: 0.7fr 1fr 1.5fr;
          gap: 1rem;
        }

        .item-number-input {
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid var(--card-border);
          font-size: 0.85rem;
          background: white;
          outline-color: var(--primary);
          width: 100%;
        }

        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .selector-group label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        select {


          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid var(--card-border);
          font-size: 0.85rem;
          background: white;
          outline-color: var(--primary);
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--card-border);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .item-config-card {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .item-selectors {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
