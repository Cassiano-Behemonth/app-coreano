import React, { useState, useRef } from 'react';
import { X, Share2, Edit3, Trash2, Tag, FileText, Camera, Plus, CheckCircle2 } from 'lucide-react';
import type { NFAlbum, PhotoAttachment } from '../types';
import { shareAlbumPDF } from '../services/pdf';
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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !album) return null;

  const handleShare = async () => {
    setIsSharing(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
    try {
      await shareAlbumPDF(album);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
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
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Apelido Principal */}
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
              {album.attachments?.length || 0} fotos salvas • Criado em {new Date(album.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Galeria de Fotos e Comprovantes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={16} color="#34D399" />
                Galeria de Fotos
              </h4>

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

            {album.attachments && album.attachments.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {album.attachments.map((att, idx) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedPhoto(att.dataUrl)}
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      height: '130px',
                      backgroundColor: '#000000',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      position: 'relative'
                    }}
                  >
                    <img src={att.dataUrl} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                ))}
              </div>
            ) : (
              <div style={{ padding: '30px 10px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Camera size={28} color="#71717A" style={{ margin: '0 auto 6px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhuma foto adicionada ainda.</p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé Fixo com Botão de Compartilhamento em PDF */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            <Share2 size={18} />
            {isSharing ? 'Gerando PDF com Fotos...' : 'Exportar / Compartilhar Fotos em PDF'}
          </button>
        </div>

      </div>

      {/* Modal de Zoom de Imagem */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
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
          <img src={selectedPhoto} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
          <button
            onClick={() => setSelectedPhoto(null)}
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
