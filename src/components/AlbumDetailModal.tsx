import React, { useState, useRef } from 'react';
import { X, Share2, Edit3, Trash2, Tag, FileText, Camera, Plus, CheckSquare, Square, Loader2 } from 'lucide-react';
import type { NFAlbum, PhotoAttachment } from '../types';
import { shareAlbumPhotos } from '../services/sharePhotos';
import { compressImageFile } from '../services/imageOptimizer';
import confetti from 'canvas-confetti';

interface AlbumDetailModalProps {
  isOpen: boolean;
  album: NFAlbum | null;
  onClose: () => void;
  onEdit: (album: NFAlbum) => void;
  onDelete: (id: string) => void;
  onAddPhoto: (albumId: string, photo: PhotoAttachment) => void;
}

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  isOpen,
  album,
  onClose,
  onEdit,
  onDelete,
  onAddPhoto
}) => {
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !album) return null;

  const allPhotos = album.attachments || [];
  const selectedCount = selectedPhotoIds.length;

  const toggleSelectPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPhotoIds.length === allPhotos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(allPhotos.map((p) => p.id));
    }
  };

  const handleSharePhotos = async () => {
    if (allPhotos.length === 0) return;
    setIsProcessing(true);
    setActionFeedback(null);

    const photosToShare = selectedCount > 0 
      ? allPhotos.filter((p) => selectedPhotoIds.includes(p.id))
      : allPhotos;

    try {
      const result = await shareAlbumPhotos(album, photosToShare);
      if (result.success) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setActionFeedback(result.message);
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setActionFeedback('Erro ao processar compartilhamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsAddingPhoto(true);
    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const compressedUrl = await compressImageFile(file);
        const newAtt: PhotoAttachment = {
          id: 'att_' + Date.now() + Math.random().toString(36).substring(2, 5),
          dataUrl: compressedUrl,
          caption: `Foto #${(album.attachments?.length || 0) + 1}`,
          createdAt: Date.now()
        };
        onAddPhoto(album.id, newAtt);
      }
    } catch (err) {
      console.error('Erro ao adicionar e comprimir foto:', err);
    } finally {
      setIsAddingPhoto(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
        {/* Header Equilibrado: Categoria na Esquerda + Ações na Direita */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-pill badge-blue" style={{ fontSize: '12px', padding: '5px 12px' }}>
              <Tag size={12} /> {album.category || 'Geral'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => onEdit(album)} 
              className="btn-icon" 
              style={{ width: '38px', height: '38px' }}
              title="Editar Organização"
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={() => onDelete(album.id)} 
              className="btn-icon" 
              style={{ width: '38px', height: '38px', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              title="Excluir"
            >
              <Trash2 size={16} color="#F43F5E" />
            </button>
            <button 
              onClick={onClose} 
              className="btn-icon" 
              style={{ width: '38px', height: '38px' }}
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo com Rolagem */}
        <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Apelido e Informações */}
          <div>
            {album.invoiceNumber && (
              <div style={{ marginBottom: '6px' }}>
                <span className="badge-pill" style={{ fontSize: '11px', padding: '4px 10px' }}>
                  <FileText size={11} /> NF #{album.invoiceNumber}
                </span>
              </div>
            )}

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              {album.nickname}
            </h2>
            <p className="label-subtle" style={{ marginTop: '5px' }}>
              {allPhotos.length} foto(s) salvas • {new Date(album.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Feedback de Ação */}
          {actionFeedback && (
            <div className="animate-slide-up" style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {actionFeedback}
            </div>
          )}

          {/* Seção de Fotos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              
              {/* Lado Esquerdo: Título e Marcar Todas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <Camera size={16} color="#34D399" />
                  Fotos ({allPhotos.length})
                </h4>
                {allPhotos.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#60A5FA',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      padding: '2px 4px'
                    }}
                  >
                    {selectedPhotoIds.length === allPhotos.length ? 'Desmarcar' : 'Marcar todas'}
                  </button>
                )}
              </div>

              {/* Lado Direito: Botões de Ação */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleAddPhotos(e.target.files)}
                />
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isAddingPhoto}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  <Camera size={14} /> Tirar Foto
                </button>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={galleryInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => handleAddPhotos(e.target.files)}
                />
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isAddingPhoto}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> Galeria
                </button>
              </div>
            </div>

            {isAddingPhoto && (
              <div style={{ padding: '12px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <Loader2 size={20} className="pulse-glow" style={{ margin: '0 auto 6px auto', color: '#60A5FA' }} />
                <p style={{ fontSize: '12px', color: '#9494A3' }}>Otimizando e salvando foto...</p>
              </div>
            )}

            {allPhotos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {allPhotos.map((att, idx) => {
                  const isSelected = selectedPhotoIds.includes(att.id);
                  return (
                    <div
                      key={att.id}
                      onClick={() => setSelectedPhotoZoom(att.dataUrl)}
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        height: '140px',
                        backgroundColor: '#000000',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #3B82F6' : '1px solid var(--border-subtle)',
                        position: 'relative'
                      }}
                    >
                      <img src={att.dataUrl} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      {/* Checkbox de seleção */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelectPhoto(att.id, e)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: isSelected ? '#3B82F6' : 'rgba(0,0,0,0.65)',
                          border: 'none',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>

                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '6px 8px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#FFFFFF'
                      }}>
                        {att.caption || `Foto #${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '32px 10px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Camera size={28} color="#71717A" style={{ margin: '0 auto 6px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhuma foto adicionada ainda.</p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé com Botão Único e Destaque: Compartilhar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <button
            onClick={handleSharePhotos}
            disabled={isProcessing || allPhotos.length === 0}
            className="btn-primary"
            style={{ 
              width: '100%', 
              padding: '15px', 
              fontSize: '15px', 
              whiteSpace: 'nowrap'
            }}
          >
            <Share2 size={18} />
            {isProcessing 
              ? 'Enviando fotos...' 
              : selectedCount > 0 
                ? `Compartilhar (${selectedCount} fotos)` 
                : `Compartilhar Todas (${allPhotos.length} fotos)`}
          </button>
        </div>

      </div>

      {/* Modal de Zoom de Imagem */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <img src={selectedPhotoZoom} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
          <button
            onClick={() => setSelectedPhotoZoom(null)}
            className="btn-icon"
            style={{ position: 'absolute', top: '20px', right: '20px' }}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
