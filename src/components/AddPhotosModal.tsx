import React, { useRef } from 'react';
import { X, Camera, Upload, Plus } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const dataUrls: string[] = [];
    let count = 0;
    const total = files.length;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        dataUrls.push(reader.result as string);
        count++;
        if (count === total) {
          onPhotosSelected(dataUrls);
        }
      };
      reader.readAsDataURL(file);
    });
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
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>Adicionar Fotos</h2>
            <p className="label-subtle" style={{ marginTop: '2px' }}>Instantâneo e sem espera</p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Opções de Captura Instantânea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={cameraInputRef} 
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
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
            multiple
            ref={fileInputRef} 
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button 
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ width: '100%', padding: '14px' }}
          >
            <Upload size={18} />
            Escolher da Galeria (Múltiplas Fotos)
          </button>

          <div style={{ marginTop: '6px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button 
              onClick={() => onPhotosSelected([])}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
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
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Criar Organização sem foto inicial
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
