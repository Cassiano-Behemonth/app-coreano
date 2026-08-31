import React from 'react';
import { LayoutGrid, Camera, FolderOpen } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'grid' | 'list' | 'folders';
  onTabChange: (tab: 'grid' | 'list' | 'folders') => void;
  onScanClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onScanClick
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 40px)',
      maxWidth: '440px',
      backgroundColor: 'rgba(20, 20, 24, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: 'var(--radius-pill)',
      padding: '8px 16px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 900,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
    }}>
      
      {/* Tab Grid / Dashboard */}
      <button
        onClick={() => onTabChange('grid')}
        style={{
          background: 'transparent',
          border: 'none',
          color: activeTab === 'grid' ? '#FFFFFF' : '#71717A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '6px 12px',
          position: 'relative'
        }}
      >
        <LayoutGrid size={22} color={activeTab === 'grid' ? '#FFFFFF' : '#71717A'} />
        {activeTab === 'grid' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#FFFFFF', position: 'absolute', bottom: '0px' }} />
        )}
      </button>

      {/* Botão Central de Scan / OCR */}
      <button
        onClick={onScanClick}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
          transition: 'transform 0.15s ease'
        }}
        aria-label="Escanear nota"
      >
        <Camera size={22} color="#09090B" />
      </button>

      {/* Tab Pastas / Categorias */}
      <button
        onClick={() => onTabChange('folders')}
        style={{
          background: 'transparent',
          border: 'none',
          color: activeTab === 'folders' ? '#FFFFFF' : '#71717A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '6px 12px',
          position: 'relative'
        }}
      >
        <FolderOpen size={22} color={activeTab === 'folders' ? '#FFFFFF' : '#71717A'} />
        {activeTab === 'folders' && (
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#FFFFFF', position: 'absolute', bottom: '0px' }} />
        )}
      </button>

    </div>
  );
};
