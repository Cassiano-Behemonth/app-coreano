import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Sparkles, Loader2 } from 'lucide-react';
import { performQuickOCR } from '../services/ocr';
import type { OCRQuickResult } from '../types';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: OCRQuickResult, photoDataUrl: string) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      processOCR(base64);
    };
    reader.readAsDataURL(file);
  };

  const processOCR = async (source: string) => {
    setIsProcessing(true);
    setProgress(0);
    setStatusText('Lendo documento...');

    try {
      const parsedData = await performQuickOCR(source, (prog, status) => {
        setProgress(prog);
        setStatusText(status);
      });

      setTimeout(() => {
        setIsProcessing(false);
        onScanComplete(parsedData, source);
      }, 300);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      onScanComplete({ rawText: '' }, source);
    }
  };

  const handleTestDemoNF = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 400);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, 570, 370);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('NOTA FISCAL DE SERVIÇOS ELETRÔNICA', 35, 60);
    ctx.fillText('Nº DA NOTA: 2026/0914', 35, 100);

    ctx.font = 'normal 16px sans-serif';
    ctx.fillText('Prestador: Reforma Express Soluções e Manutenção', 35, 145);
    ctx.fillText('Data de Emissão: 29/08/2026', 35, 180);

    const demoDataUrl = canvas.toDataURL('image/jpeg');
    processOCR(demoDataUrl);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-active)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Header do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>Tirar Foto da NF / Comprovante</h2>
            <p className="label-subtle" style={{ marginTop: '2px' }}>O app identifica o número e cria a pasta</p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Estado de Processamento */}
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '30px 10px', textAlign: 'center' }}>
            <Loader2 size={46} color="#3B82F6" className="pulse-glow" style={{ animation: 'spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Lendo Documento...</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{statusText}</div>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#3B82F6', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={cameraInputRef} 
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />
            <button 
              className="btn-primary"
              onClick={() => cameraInputRef.current?.click()}
              style={{ width: '100%', padding: '16px', fontSize: '15px' }}
            >
              <Camera size={20} />
              Tirar Foto com a Câmera
            </button>

            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />
            <button 
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', padding: '14px' }}
            >
              <Upload size={18} />
              Escolher da Galeria
            </button>

            <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                onClick={handleTestDemoNF}
                style={{
                  width: '100%',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px dashed rgba(59, 130, 246, 0.4)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '12px',
                  color: '#60A5FA',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={16} />
                Testar com Exemplo Demo (1 Clique)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
