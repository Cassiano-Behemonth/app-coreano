import React, { useState, useRef } from 'react';
import { X, Check, Camera, Trash2, Plus, Tag, FileText, Folder } from 'lucide-react';
import type { NFAlbum, PhotoAttachment, OCRQuickResult } from '../types';
import confetti from 'canvas-confetti';

interface EditAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (album: NFAlbum) => void;
  initialData?: Partial<NFAlbum>;
  ocrData?: OCRQuickResult | null;
  initialPhoto?: string;
}

export const EditAlbumModal: React.FC<EditAlbumModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  ocrData,
  initialPhoto
}) => {
  const [nickname, setNickname] = useState(
    initialData?.nickname || ocrData?.suggestedNickname || ''
  );
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoiceNumber || ocrData?.invoiceNumber || ''
  );
  const [category, setCategory] = useState(initialData?.category || 'Geral');
  
  // Fotos anexas
  const [attachments, setAttachments] = useState<PhotoAttachment[]>(() => {
    const existing = initialData?.attachments || [];
    if (initialPhoto && existing.length === 0) {
      return [{
        id: 'att_' + Date.now(),
        dataUrl: initialPhoto,
        caption: 'Foto da NF / Comprovante',
        createdAt: Date.now()
      }];
    }
    return existing;
  });

  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAtt: PhotoAttachment = {
          id: 'att_' + Date.now() + Math.random().toString(36).substring(2, 5),
          dataUrl: reader.result as string,
          caption: `Foto #${attachments.length + 1}`,
          createdAt: Date.now()
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    const finalAlbum: NFAlbum = {
      id: initialData?.id || 'album_' + Date.now(),
      nickname: nickname.trim() || (invoiceNumber ? `NF #${invoiceNumber}` : 'Nova Organização'),
      invoiceNumber: invoiceNumber.trim() || undefined,
      category,
      attachments,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    onSave(finalAlbum);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div 
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-active)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header Fixo */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
              {initialData?.id ? 'Editar Organização' : 'Nova Organização de Fotos'}
            </h2>
            <p className="label-subtle" style={{ marginTop: '2px' }}>Apelido, Número da NF e Fotos vinculadas</p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Apelido Principal */}
          <div>
            <label className="label-subtle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Tag size={13} color="#60A5FA" />
              Apelido da Organização / Serviço
            </label>
            <input
              type="text"
              placeholder="Ex: Reforma Escritório, Conserto Ar, Troca de Peças"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {/* Número da NF & Categoria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label-subtle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <FileText size={13} color="#34D399" />
                Nº da NF (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: 2026/0084"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label className="label-subtle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Folder size={13} />
                Pasta / Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="Geral">Geral</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Reforma & Obras">Reforma & Obras</option>
                <option value="Serviços">Serviços</option>
                <option value="Materiais">Materiais</option>
              </select>
            </div>
          </div>

          {/* Seção Principal de Fotos e Anexos */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={16} color="#34D399" />
                  Fotos do Serviço / Recibos ({attachments.length})
                </span>
                <p className="label-subtle" style={{ fontSize: '11px' }}>Tire fotos ou adicione da galeria</p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {/* Botão Câmera Direta */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleAddPhotos(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Camera size={14} /> Câmera
                </button>

                {/* Botão Galeria */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={attachmentInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleAddPhotos(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Plus size={14} /> Galeria
                </button>
              </div>
            </div>

            {/* Grid de Miniaturas com Opção de Exclusão */}
            {attachments.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {attachments.map((att) => (
                  <div key={att.id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '90px', backgroundColor: '#000' }}>
                    <img src={att.dataUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(att.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} color="#F43F5E" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 10px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Camera size={26} color="#71717A" style={{ margin: '0 auto 6px auto' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nenhuma foto adicionada ainda.</p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé Fixo */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            <Check size={18} />
            Salvar Organização
          </button>
        </div>

      </div>
    </div>
  );
};
