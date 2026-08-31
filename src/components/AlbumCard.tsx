import React, { useState } from 'react';
import { Camera, Calendar, Share2, ChevronRight, FileText, Tag, Check, Download } from 'lucide-react';
import type { NFAlbum } from '../types';
import { shareAlbumPhotos, downloadAlbumPhotos } from '../services/sharePhotos';

interface AlbumCardProps {
  album: NFAlbum;
  onClick: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const [isShared, setIsShared] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleQuickDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = downloadAlbumPhotos(album);
    if (result.success) {
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2500);
    }
  };

  const handleQuickShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareAlbumPhotos(album);
    if (result.success) {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2500);
    }
  };

  const formattedDate = new Date(album.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div 
      className="bento-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        gap: '12px',
        padding: '16px 18px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* Topo do Card: Apelido + Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            {album.nickname}
          </h3>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
            <span className="badge-pill badge-blue" style={{ fontSize: '10px' }}>
              <Tag size={10} /> {album.category || 'Geral'}
            </span>
            {album.invoiceNumber && (
              <span className="badge-pill" style={{ fontSize: '10px' }}>
                <FileText size={10} /> NF #{album.invoiceNumber}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '6px 10px' }}>
            <Camera size={13} />
            {album.attachments?.length || 0} foto(s)
          </span>
        </div>
      </div>

      {/* Miniatura das fotos */}
      {album.attachments && album.attachments.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', overflow: 'hidden', height: '52px', borderRadius: '8px' }}>
          {album.attachments.slice(0, 4).map((att) => (
            <img
              key={att.id}
              src={att.dataUrl}
              alt="Miniatura"
              style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#000' }}
            />
          ))}
          {album.attachments.length > 4 && (
            <div style={{ width: '52px', height: '52px', borderRadius: '6px', backgroundColor: 'var(--bg-card-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#A1A1AA' }}>
              +{album.attachments.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Rodapé do Card com Ações Rápidas: Baixar e Compartilhar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={11} /> {formattedDate}
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Botão Baixar Rápido */}
          <button
            onClick={handleQuickDownload}
            aria-label="Baixar Fotos"
            title="Baixar Fotos no Dispositivo"
            style={{
              background: isDownloaded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: isDownloaded ? '#34D399' : '#A1A1AA',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {isDownloaded ? <Check size={14} /> : <Download size={14} />}
            {isDownloaded ? 'Baixado' : 'Baixar'}
          </button>

          {/* Botão Compartilhar */}
          <button
            onClick={handleQuickShare}
            aria-label="Compartilhar Fotos"
            title="Compartilhar Fotos"
            style={{
              background: isShared ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: isShared ? '#60A5FA' : '#FFFFFF',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {isShared ? <Check size={14} /> : <Share2 size={14} />}
            {isShared ? 'Enviado' : 'Enviar'}
          </button>

          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};
