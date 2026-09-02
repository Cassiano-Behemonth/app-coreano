import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Plus, Loader2 } from 'lucide-react';
import { compressImageFile } from '../services/imageOptimizer';

interface AddPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosSelected: (dataUrls: string[]) => void;
}

export const AddPhotosModal: React.FC<AddPhotosModalProps> = ({
  isOpen,
  onClose,
  onPhotosSelected
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const fileArray = Array.from(files);
      const compressPromises = fileArray.map((file) => compressImageFile(file));
      const compressedDataUrls = await Promise.all(compressPromises);
      setIsProcessing(false);
      onPhotosSelected(compressedDataUrls);
    } catch (err) {
      console.error('Erro ao processar e comprimir fotos:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
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
          gap: '22px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Adicionar Fotos
            </h2>
            <p className="label-subtle" style={{ marginTop: '4px' }}>
              Fotos otimizadas e salvas no seu aparelho
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="btn-icon" 
            style={{ width: '38px', height: '38px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Opções de Captura Instantânea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={cameraInputRef} 
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button 
            className="btn-primary"
            disabled={isProcessing}
            onClick={() => cameraInputRef.current?.click()}
            style={{ width: '100%', padding: '16px', fontSize: '15px' }}
          >
            {isProcessing ? <Loader2 size={20} className="pulse-glow" /> : <Camera size={20} />}
            {isProcessing ? 'Otimizando foto...' : 'Tirar Foto com a Câmera'}
          </button>

          <input 
            type="file" 
            accept="image/*" 
            multiple
            ref={fileInputRef} 
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button 
            className="btn-secondary"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            style={{ width: '100%', padding: '15px', fontSize: '14px' }}
          >
            {isProcessing ? <Loader2 size={18} /> : <Upload size={18} />}
            {isProcessing ? 'Processando galeria...' : 'Escolher da Galeria (Múltiplas)'}
          </button>

          <div style={{ marginTop: '4px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button 
              disabled={isProcessing}
              onClick={() => onPhotosSelected([])}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                padding: '12px',
                color: '#A1A1AA',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isProcessing ? 'default' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={15} />
              Criar Organização sem foto inicial
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
