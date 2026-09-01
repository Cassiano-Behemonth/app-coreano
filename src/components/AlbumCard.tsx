import React, { useState } from 'react';
import { Camera, Calendar, Share2, ChevronRight, FileText, Tag, Check } from 'lucide-react';
import type { NFAlbum } from '../types';
import { shareAlbumPhotos } from '../services/sharePhotos';

interface AlbumCardProps {
  album: NFAlbum;
  onClick: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const [isShared, setIsShared] = useState(false);

  const handleQuickShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareAlbumPhotos(album);
    if (result.success) {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2500);
    }
  };

  const formattedDate = new Date(album.createdAt).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      className="bento-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        gap: '14px',
        padding: '18px 20px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      {/* Topo do Card: Apelido + Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {album.nickname}
          </h3>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
            <span className="badge-pill badge-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>
              <Tag size={10} /> {album.category || 'Geral'}
            </span>
            {album.invoiceNumber && (
              <span className="badge-pill" style={{ fontSize: '11px', padding: '3px 8px' }}>
                <FileText size={10} /> NF #{album.invoiceNumber}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '6px 10px', whiteSpace: 'nowrap' }}>
            <Camera size={13} />
            {album.attachments?.length || 0} foto(s)
          </span>
        </div>
      </div>

      {/* Miniatura das fotos */}
      {album.attachments && album.attachments.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflow: 'hidden', height: '58px', borderRadius: '10px' }}>
          {album.attachments.slice(0, 4).map((att) => (
            <img
              key={att.id}
              src={att.dataUrl}
              alt="Miniatura"
              style={{ width: '58px', height: '58px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#000' }}
            />
          ))}
          {album.attachments.length > 4 && (
            <div style={{ 
              width: '58px', 
              height: '58px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--bg-card-elevated)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px', 
              fontWeight: 700, 
              color: '#A1A1AA',
              border: '1px solid var(--border-subtle)'
            }}>
              +{album.attachments.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Rodapé do Card com Data e Ação Rápida de Compartilhar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={12} /> {formattedDate}
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {isShared ? <Check size={14} /> : <Share2 size={14} />}
            {isShared ? 'Enviado' : 'Compartilhar'}
          </button>

          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};
