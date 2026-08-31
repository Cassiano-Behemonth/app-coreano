import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BentoGrid } from './components/BentoGrid';
import { AlbumCard } from './components/AlbumCard';
import { ScanModal } from './components/ScanModal';
import { EditAlbumModal } from './components/EditAlbumModal';
import { AlbumDetailModal } from './components/AlbumDetailModal';
import { BottomNav } from './components/BottomNav';
import type { NFAlbum, PhotoAttachment, OCRQuickResult } from './types';
import { getAllAlbums, saveAlbum, deleteAlbum, seedInitialDataIfEmpty } from './services/db';
import { Plus, Camera, Folder, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [albums, setAlbums] = useState<NFAlbum[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'folders'>('grid');

  // Modais
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Estados dos modais
  const [editingAlbum, setEditingAlbum] = useState<Partial<NFAlbum> | undefined>(undefined);
  const [ocrData, setOcrData] = useState<OCRQuickResult | null>(null);
  const [scannedInitialPhoto, setScannedInitialPhoto] = useState<string | undefined>(undefined);
  const [selectedAlbum, setSelectedAlbum] = useState<NFAlbum | null>(null);

  useEffect(() => {
    async function loadData() {
      await seedInitialDataIfEmpty();
      const list = await getAllAlbums();
      setAlbums(list);
    }
    loadData();
  }, []);

  const refreshAlbums = async () => {
    const list = await getAllAlbums();
    setAlbums(list);
  };

  const handleScanComplete = (data: OCRQuickResult, photoDataUrl: string) => {
    setIsScanOpen(false);
    setOcrData(data);
    setScannedInitialPhoto(photoDataUrl);
    setEditingAlbum(undefined);
    setIsEditOpen(true);
  };

  const handleCreateManual = () => {
    setOcrData(null);
    setScannedInitialPhoto(undefined);
    setEditingAlbum(undefined);
    setIsEditOpen(true);
  };

  const handleSaveAlbum = async (album: NFAlbum) => {
    await saveAlbum(album);
    await refreshAlbums();
    setIsEditOpen(false);
    setOcrData(null);
    setEditingAlbum(undefined);
    setSelectedAlbum(album);
    setIsDetailOpen(true);
  };

  const handleDeleteAlbum = async (id: string) => {
    if (window.confirm('Excluir esta organização e todas as suas fotos?')) {
      await deleteAlbum(id);
      await refreshAlbums();
      setIsDetailOpen(false);
      setSelectedAlbum(null);
    }
  };

  const handleAddPhotoToAlbum = async (albumId: string, newPhoto: PhotoAttachment) => {
    const album = albums.find(a => a.id === albumId);
    if (!album) return;

    const updated: NFAlbum = {
      ...album,
      attachments: [...(album.attachments || []), newPhoto],
      updatedAt: Date.now()
    };

    await saveAlbum(updated);
    await refreshAlbums();
    setSelectedAlbum(updated);
  };

  const handleCardClick = (album: NFAlbum) => {
    setSelectedAlbum(album);
    setIsDetailOpen(true);
  };

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = searchQuery === '' || 
      album.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || (album.category || 'Geral') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categoriesList = Array.from(new Set(albums.map(a => a.category || 'Geral')));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho */}
      <Header
        onScanClick={() => setIsScanOpen(true)}
        onSearchClick={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Conteúdo Principal */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '4px' }}>
        
        {/* Visualização de Pastas */}
        {activeTab === 'folders' ? (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>Pastas de Fotos</h2>
            {categoriesList.map(cat => {
              const catAlbums = albums.filter(a => (a.category || 'Geral') === cat);
              const catPhotos = catAlbums.reduce((acc, a) => acc + (a.attachments?.length || 0), 0);

              return (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveTab('grid');
                  }}
                  className="bento-card"
                  style={{ cursor: 'pointer', gap: '10px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Folder size={20} color="#60A5FA" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{cat}</h3>
                        <p className="label-subtle">{catAlbums.length} pacote(s) • {catPhotos} foto(s)</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Ver <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dashboard Principal Bento Grid */
          <>
            <BentoGrid
              albums={albums}
              onSelectCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              onAlbumClick={handleCardClick}
            />

            {/* Lista de Organizações de Fotos */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span className="label-subtle" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px' }}>
                  {selectedCategory ? `Organizações em "${selectedCategory}"` : 'Organizações Recentes'} ({filteredAlbums.length})
                </span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Limpar Filtro
                  </button>
                )}
              </div>

              {filteredAlbums.length > 0 ? (
                filteredAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => handleCardClick(album)}
                  />
                ))
              ) : (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Camera size={32} color="#71717A" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>Nenhuma foto organizada</h4>
                    <p className="label-subtle" style={{ marginTop: '4px' }}>
                      Crie um pacote pelo apelido ou tire foto da NF para começar
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={handleCreateManual} className="btn-secondary">
                      <Plus size={16} />
                      Criar Apelido
                    </button>
                    <button onClick={() => setIsScanOpen(true)} className="btn-primary">
                      <Camera size={16} />
                      Tirar Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {/* Barra de Navegação Inferior */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onScanClick={() => setIsScanOpen(true)}
      />

      {/* Modais */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanComplete={handleScanComplete}
      />

      <EditAlbumModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveAlbum}
        initialData={editingAlbum}
        ocrData={ocrData}
        initialPhoto={scannedInitialPhoto}
      />

      <AlbumDetailModal
        isOpen={isDetailOpen}
        album={selectedAlbum}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(alb) => {
          setIsDetailOpen(false);
          setEditingAlbum(alb);
          setOcrData(null);
          setIsEditOpen(true);
        }}
        onDelete={handleDeleteAlbum}
        onAddPhoto={handleAddPhotoToAlbum}
      />

    </div>
  );
};
