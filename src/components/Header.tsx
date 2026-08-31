import React from 'react';
import { Plus, Search } from 'lucide-react';

interface HeaderProps {
  onScanClick: () => void;
  onSearchClick: () => void;
  searchOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScanClick,
  onSearchClick,
  searchOpen,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header style={{ padding: '20px 20px 10px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title-large" style={{ display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.03em' }}>
            Chongi-Manager
          </h1>
          <p className="label-subtle" style={{ marginTop: '2px' }}>Fotos & Comprovantes</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-icon" 
            onClick={onSearchClick}
            aria-label="Buscar notas"
            style={{ borderColor: searchOpen ? '#60A5FA' : 'var(--border-subtle)' }}
          >
            <Search size={18} color={searchOpen ? '#60A5FA' : '#F4F4F5'} />
          </button>
          
          <button 
            className="btn-icon"
            onClick={onScanClick}
            aria-label="Adicionar foto"
            style={{ backgroundColor: '#FFFFFF', color: '#09090B' }}
          >
            <Plus size={20} strokeWidth={2.5} color="#09090B" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="animate-slide-up" style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Buscar por apelido, pasta ou nº da NF..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-pill)',
              padding: '12px 18px',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      )}
    </header>
  );
};
