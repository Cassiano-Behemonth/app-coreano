import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Camera, Trash2, Plus, Tag, FileText, Folder, FolderPlus, Loader2 } from 'lucide-react';
import type { NFAlbum, PhotoAttachment } from '../types';
import { compressImageFile } from '../services/imageOptimizer';
import confetti from 'canvas-confetti';

interface EditAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (album: NFAlbum) => void;
  initialData?: Partial<NFAlbum>;
  initialPhotos?: string[];
  availableFolders: string[];
}

export const EditAlbumModal: React.FC<EditAlbumModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  initialPhotos = [],
  availableFolders
}) => {
  const [nickname, setNickname] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [category, setCategory] = useState('');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [attachments, setAttachments] = useState<PhotoAttachment[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNickname(initialData?.nickname || '');
      setInvoiceNumber(initialData?.invoiceNumber || '');
      
      const hasExistingFolders = availableFolders.length > 0;
      if (initialData?.category) {
        setCategory(initialData.category);
        setIsCreatingNewFolder(false);
      } else if (hasExistingFolders) {
        setCategory(availableFolders[0]);
        setIsCreatingNewFolder(false);
      } else {
        setCategory('');
        setIsCreatingNewFolder(true);
      }

      setNewFolderName('');

      if (initialData?.attachments && initialData.attachments.length > 0) {
        setAttachments(initialData.attachments);
      } else if (initialPhotos && initialPhotos.length > 0) {
        const mapped: PhotoAttachment[] = initialPhotos.map((url, idx) => ({
          id: 'att_' + Date.now() + '_' + idx + Math.random().toString(36).substring(2, 5),
          dataUrl: url,
          caption: `Foto #${idx + 1}`,
          createdAt: Date.now()
        }));
        setAttachments(mapped);
      } else {
        setAttachments([]);
      }
    }
  }, [isOpen, initialData, initialPhotos, availableFolders]);

  if (!isOpen) return null;

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsOptimizing(true);
    try {
      const fileArray = Array.from(files);
      const compressPromises = fileArray.map((file) => compressImageFile(file));
      const compressedUrls = await Promise.all(compressPromises);

      const newAtts: PhotoAttachment[] = compressedUrls.map((url, idx) => ({
        id: 'att_' + Date.now() + '_' + idx + Math.random().toString(36).substring(2, 5),
        dataUrl: url,
        caption: `Foto #${attachments.length + idx + 1}`,
        createdAt: Date.now()
      }));

      setAttachments((prev) => [...prev, ...newAtts]);
    } catch (err) {
      console.error('Erro ao comprimir fotos no modal de edição:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    const finalCategory = isCreatingNewFolder && newFolderName.trim() 
      ? newFolderName.trim() 
      : (category.trim() || 'Minhas Fotos');

    const finalAlbum: NFAlbum = {
      id: initialData?.id || 'album_' + Date.now(),
      nickname: nickname.trim() || (invoiceNumber ? `NF #${invoiceNumber}` : 'Nova Organização'),
      invoiceNumber: invoiceNumber.trim() || undefined,
      category: finalCategory,
      attachments: attachments,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    confetti({
      particleCount: 40,
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
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-active)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header Fixo */}
        <div style={{ 
          padding: '20px 22px', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {initialData?.id ? 'Editar Organização' : 'Nova Organização de Fotos'}
            </h2>
            <p className="label-subtle" style={{ marginTop: '3px' }}>
              {attachments.length} foto(s) organizada(s)
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '38px', height: '38px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Apelido Principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="label-subtle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={13} color="#60A5FA" />
              Apelido do Serviço / Nome do Registro
            </label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ex: Reforma Escritório, Conserto Ar, Troca de Peças"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoFocus
              style={{ fontSize: '15px', fontWeight: 600 }}
            />
          </div>

          {/* Número da NF */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="label-subtle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} color="#34D399" />
              Nº da NF (Opcional)
            </label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ex: 2026/0084"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>

          {/* Pasta no Celular */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="label-subtle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={13} color="#F59E0B" />
                Pasta Física no Celular
              </label>
              {availableFolders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewFolder(!isCreatingNewFolder)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#60A5FA',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FolderPlus size={13} />
                  {isCreatingNewFolder ? 'Escolher existente' : '+ Nova pasta'}
                </button>
              )}
            </div>

            {isCreatingNewFolder || availableFolders.length === 0 ? (
              <input
                type="text"
                className="input-custom"
                placeholder="Nome da pasta (ex: Obras, Compras, Manutenções)..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus={availableFolders.length === 0}
                style={{ borderColor: 'var(--accent-blue)' }}
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-custom"
                style={{ cursor: 'pointer' }}
              >
                {availableFolders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            )}
          </div>

          {/* Galeria de Fotos */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={15} color="#34D399" />
                  Fotos ({attachments.length})
                </span>
                <p className="label-subtle" style={{ fontSize: '11px', marginTop: '2px' }}>Adicione mais comprovantes</p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
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
                  disabled={isOptimizing}
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-primary"
                  style={{ padding: '7px 12px', fontSize: '12px' }}
                >
                  <Camera size={13} /> Câmera
                </button>

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
                  disabled={isOptimizing}
                  onClick={() => attachmentInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ padding: '7px 12px', fontSize: '12px' }}
                >
                  <Plus size={13} /> Galeria
                </button>
              </div>
            </div>

            {/* Grid de Miniaturas */}
            {isOptimizing ? (
              <div style={{ padding: '24px 10px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <Loader2 size={24} className="pulse-glow" style={{ margin: '0 auto 8px auto', color: '#60A5FA' }} />
                <p style={{ fontSize: '12px', color: '#9494A3' }}>Otimizando imagens...</p>
              </div>
            ) : attachments.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {attachments.map((att) => (
                  <div key={att.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '95px', backgroundColor: '#000', border: '1px solid var(--border-subtle)' }}>
                    <img src={att.dataUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(att.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: 'rgba(0,0,0,0.8)',
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
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nenhuma foto anexada ainda.</p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé Fixo */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={isOptimizing}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            <Check size={18} />
            Salvar na Pasta ({attachments.length} fotos)
          </button>
        </div>

      </div>
    </div>
  );
};
