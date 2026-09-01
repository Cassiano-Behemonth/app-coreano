import React, { useRef } from 'react';
import { Camera, ArrowUpRight, FolderOpen, Layers, Plus, Calendar, X } from 'lucide-react';
import type { NFAlbum } from '../types';

interface BentoGridProps {
  albums: NFAlbum[];
  categories: string[];
  onSelectCategory: (category: string | null) => void;
  selectedCategory: string | null;
  onAlbumClick: (album: NFAlbum) => void;
  onAddNewFolder: () => void;
  selectedDate: string; // Formato YYYY-MM-DD ou ""
  onSelectDate: (date: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  albums,
  categories,
  onSelectCategory,
  selectedCategory,
  onAlbumClick,
  onAddNewFolder,
  selectedDate,
  onSelectDate
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const totalPhotos = albums.reduce((acc, a) => acc + (a.attachments?.length || 0), 0);
  const latestAlbum = albums.length > 0 ? albums[0] : null;

  // Formatação DD/MM/AAAA para exibição limpa
  const formattedSelectedDate = selectedDate ? (() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return selectedDate;
  })() : null;

  const handleOpenPicker = () => {
    try {
      if (dateInputRef.current) {
        if ('showPicker' in HTMLInputElement.prototype) {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      }
    } catch {
      dateInputRef.current?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '0 20px' }}>
      
      {/* 1. Top Card Largo: Total de Fotos Armazenadas */}
      <div 
        className="bento-card bento-card-elevated"
        style={{ minHeight: '110px', cursor: latestAlbum ? 'pointer' : 'default', padding: '20px' }}
        onClick={() => latestAlbum && onAlbumClick(latestAlbum)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="label-subtle">Total de Fotos Salvas</span>
            <div className="metric-huge" style={{ marginTop: '6px' }}>
              {totalPhotos} <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)' }}>fotos</span>
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={20} color="#A1A1AA" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '12px', color: '#8E8E99', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            {latestAlbum ? `Último: ${latestAlbum.nickname}` : 'Nenhum registro adicionado'}
          </span>
          <span style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700 }}>
            {albums.length} pacote(s)
          </span>
        </div>
      </div>

      {/* 2. Grid de 2 Colunas: Pacotes vs Fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        
        <div className="bento-card" style={{ height: '125px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="#60A5FA" />
            </div>
            <span className="label-subtle">Pacotes</span>
          </div>

          <div>
            <div className="metric-huge" style={{ fontSize: '28px' }}>{albums.length}</div>
            <div className="label-subtle" style={{ marginTop: '2px' }}>Registros</div>
          </div>
        </div>

        <div className="bento-card" style={{ height: '125px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={18} color="#34D399" />
            </div>
            <span className="label-subtle">Mídia</span>
          </div>

          <div>
            <div className="metric-huge" style={{ fontSize: '28px' }}>{totalPhotos}</div>
            <div className="label-subtle" style={{ marginTop: '2px' }}>Fotos Salvas</div>
          </div>
        </div>

      </div>

      {/* 3. FILTRO POR DATA DIRETO */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Botão Todos */}
        <button
          onClick={() => onSelectDate('')}
          className="badge-pill"
          style={{
            padding: '8px 16px',
            backgroundColor: !selectedDate ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
            color: !selectedDate ? '#09090B' : 'var(--text-secondary)',
            cursor: 'pointer',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          Todas as datas
        </button>

        {/* Botão com Trigger para o Calendário Nativo */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              pointerEvents: 'none'
            }}
          />
          <button
            type="button"
            onClick={handleOpenPicker}
            className="badge-pill"
            style={{
              padding: '8px 14px',
              backgroundColor: selectedDate ? '#3B82F6' : 'rgba(255, 255, 255, 0.05)',
              color: selectedDate ? '#FFFFFF' : 'var(--text-secondary)',
              border: selectedDate ? '1px solid #60A5FA' : '1px solid var(--border-subtle)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Calendar size={14} color={selectedDate ? '#FFFFFF' : '#60A5FA'} />
            <span style={{ fontWeight: selectedDate ? 700 : 500 }}>
              {formattedSelectedDate || 'Escolher dia (dd/mm/aaaa)'}
            </span>
            {selectedDate && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDate('');
                }}
                style={{
                  marginLeft: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '50%',
                  padding: '2px'
                }}
                title="Limpar data"
              >
                <X size={12} />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4. Filtros por Pastas */}
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
