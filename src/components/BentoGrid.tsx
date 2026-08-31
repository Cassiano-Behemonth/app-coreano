import React from 'react';
import { Camera, ArrowUpRight, FolderOpen, Layers, Plus } from 'lucide-react';
import type { NFAlbum } from '../types';

interface BentoGridProps {
  albums: NFAlbum[];
  categories: string[];
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
  onAlbumClick: (album: NFAlbum) => void;
  onAddNewFolder: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  albums,
  categories,
  onSelectCategory,
  selectedCategory,
  onAlbumClick,
  onAddNewFolder
}) => {
  const totalPhotos = albums.reduce((acc, a) => acc + (a.attachments?.length || 0), 0);
  const latestAlbum = albums.length > 0 ? albums[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 20px' }}>
      
      {/* 1. Top Card Largo: Total de Fotos Armazenadas */}
      <div 
        className="bento-card bento-card-elevated"
        style={{ minHeight: '100px', cursor: latestAlbum ? 'pointer' : 'default' }}
        onClick={() => latestAlbum && onAlbumClick(latestAlbum)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="label-subtle">Total de Fotos Salvas</span>
            <div className="metric-huge" style={{ marginTop: '4px' }}>
              {totalPhotos} <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)' }}>fotos</span>
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={18} color="#A1A1AA" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '11px', color: '#71717A' }}>
            {latestAlbum ? `Último: ${latestAlbum.nickname}` : 'Nenhum registro adicionado'}
          </span>
          <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>
            {albums.length} pacote(s)
          </span>
        </div>
      </div>

      {/* 2. Grid de 2 Colunas: Registros vs Fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        
        <div className="bento-card" style={{ height: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Layers size={20} color="#60A5FA" />
            <span className="label-subtle">Pacotes</span>
          </div>

          <div>
            <div className="metric-huge" style={{ fontSize: '30px' }}>{albums.length}</div>
            <div className="label-subtle" style={{ marginTop: '2px' }}>Registros</div>
          </div>
        </div>

        <div className="bento-card" style={{ height: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Camera size={20} color="#34D399" />
            <span className="label-subtle">Mídia</span>
          </div>

          <div>
            <div className="metric-huge" style={{ fontSize: '30px' }}>{totalPhotos}</div>
            <div className="label-subtle" style={{ marginTop: '2px' }}>Fotos Salvas</div>
          </div>
        </div>

      </div>

      {/* 3. Filtros por Pastas */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
        <button
          onClick={() => onSelectCategory(null)}
          className="badge-pill"
          style={{
            padding: '8px 14px',
            backgroundColor: selectedCategory === null ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
            color: selectedCategory === null ? '#09090B' : 'var(--text-secondary)',
            cursor: 'pointer',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <FolderOpen size={13} />
          Todas ({albums.length})
        </button>

        {categories.map((cat) => {
          const count = albums.filter((a) => a.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className="badge-pill"
              style={{
                padding: '8px 14px',
                backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#09090B' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {cat} ({count})
            </button>
          );
        })}

        <button
          onClick={onAddNewFolder}
          className="badge-pill"
          style={{
            padding: '8px 14px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#60A5FA',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            border: '1px dashed rgba(59, 130, 246, 0.4)'
          }}
        >
          <Plus size={13} />
          Criar Pasta
        </button>
      </div>

    </div>
  );
};
