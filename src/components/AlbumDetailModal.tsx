import React, { useState, useRef } from 'react';
import { X, Share2, Edit3, Trash2, Tag, FileText, Camera, Plus, CheckCircle2, CheckSquare, Square, Download, Sparkles } from 'lucide-react';
import type { NFAlbum, PhotoAttachment } from '../types';
import { shareAlbumPhotos, downloadAlbumPhotos } from '../services/sharePhotos';
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

  const handleDownloadPhotos = () => {
    if (allPhotos.length === 0) return;
    const photosToDownload = selectedCount > 0 
      ? allPhotos.filter((p) => selectedPhotoIds.includes(p.id))
      : allPhotos;

    const result = downloadAlbumPhotos(album, photosToDownload);
    if (result.success) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
      setActionFeedback(result.message);
      setTimeout(() => setActionFeedback(null), 3500);
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
      setActionFeedback('Erro ao processar fotos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAtt: PhotoAttachment = {
          id: 'att_' + Date.now() + Math.random().toString(36).substring(2, 5),
          dataUrl: reader.result as string,
          caption: `Foto #${(album.attachments?.length || 0) + 1}`,
          createdAt: Date.now()
        };
        onAddPhoto(album.id, newAtt);
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
          overflow: 'hidden'
        }}
      >
        {/* Header com Ações */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge-pill badge-emerald">
              <CheckCircle2 size={12} /> Salvo Localmente
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => onEdit(album)} 
              className="btn-icon" 
              style={{ width: '36px', height: '36px' }}
              title="Editar"
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={() => onDelete(album.id)} 
              className="btn-icon" 
              style={{ width: '36px', height: '36px', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              title="Excluir"
            >
              <Trash2 size={16} color="#F43F5E" />
            </button>
            <button 
              onClick={onClose} 
              className="btn-icon" 
              style={{ width: '36px', height: '36px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo com Rolagem */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Apelido e Pasta */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge-pill badge-blue">
                <Tag size={12} /> {album.category || 'Geral'}
              </span>
              {album.invoiceNumber && (
                <span className="badge-pill">
                  <FileText size={12} /> NF #{album.invoiceNumber}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '4px' }}>
              {album.nickname}
            </h2>
            <p className="label-subtle" style={{ marginTop: '4px' }}>
              {allPhotos.length} fotos salvas • Criado em {new Date(album.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* BANNER DE INSTRUÇÃO E BAIXAR FOTOS */}
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Sparkles size={18} color="#60A5FA" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                Opções de Envio e Armazenamento
              </div>
              <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px', lineHeight: 1.4 }}>
                Você pode <b>Baixar</b> as fotos direto para a galeria do seu celular/PC ou <b>Compartilhar</b> no WhatsApp e outros aplicativos.
              </p>
            </div>
          </div>

          {/* Feedback de Ação */}
          {actionFeedback && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              {actionFeedback}
            </div>
          )}

          {/* Galeria de Fotos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {selectedPhotoIds.length === allPhotos.length ? 'Desmarcar todas' : 'Selecionar todas'}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
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
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Camera size={13} /> Tirar Foto
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
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Plus size={13} /> Galeria
                </button>
              </div>
            </div>

            {allPhotos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {allPhotos.map((att, idx) => {
                  const isSelected = selectedPhotoIds.includes(att.id);
                  return (
                    <div
                      key={att.id}
                      onClick={() => setSelectedPhotoZoom(att.dataUrl)}
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        height: '130px',
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
                          backgroundColor: isSelected ? '#3B82F6' : 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '6px',
                          width: '26px',
                          height: '26px',
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
              <div style={{ padding: '30px 10px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Camera size={28} color="#71717A" style={{ margin: '0 auto 6px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhuma foto adicionada ainda.</p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé Fixo com 2 Botões Claros: BAIXAR e COMPARTILHAR */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          {/* Botão 1: Baixar */}
          <button
            onClick={handleDownloadPhotos}
            disabled={allPhotos.length === 0}
            className="btn-secondary"
            style={{ width: '100%', padding: '14px 10px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            <Download size={16} />
            {selectedCount > 0 ? `Baixar (${selectedCount})` : `Baixar Todas (${allPhotos.length})`}
          </button>

          {/* Botão 2: Compartilhar */}
          <button
            onClick={handleSharePhotos}
            disabled={isProcessing || allPhotos.length === 0}
            className="btn-primary"
            style={{ width: '100%', padding: '14px 10px', fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            <Share2 size={16} />
            {isProcessing ? 'Enviando...' : selectedCount > 0 ? `Enviar (${selectedCount})` : 'Compartilhar'}
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
