import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BentoGrid } from './components/BentoGrid';
import { AlbumCard } from './components/AlbumCard';
import { AddPhotosModal } from './components/AddPhotosModal';
import { EditAlbumModal } from './components/EditAlbumModal';
import { AlbumDetailModal } from './components/AlbumDetailModal';
import { InstallAppBanner } from './components/InstallAppBanner';
import { BottomNav } from './components/BottomNav';
import type { NFAlbum, PhotoAttachment } from './types';
import { 
  getAllAlbums, 
  saveAlbum, 
  deleteAlbum, 
  getAllFolders,
  createCustomFolder
} from './services/db';
import { Plus, Camera, Folder, ArrowRight, FolderPlus } from 'lucide-react';

export const App: React.FC = () => {
  const [albums, setAlbums] = useState<NFAlbum[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'folders'>('grid');

  // Modais
  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');

  // Estados dos modais
  const [editingAlbum, setEditingAlbum] = useState<Partial<NFAlbum> | undefined>(undefined);
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<NFAlbum | null>(null);

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    const list = await getAllAlbums();
    const folderList = await getAllFolders();
    setAlbums(list);
    setFolders(folderList);
  };

  // Captura instantânea de fotos (sem delay)
  const handlePhotosSelected = (photoDataUrls: string[]) => {
    setIsAddPhotosOpen(false);
    setInitialPhotos(photoDataUrls);
    setEditingAlbum(undefined);
    setIsEditOpen(true);
  };

  const handleCreateManual = () => {
    setInitialPhotos([]);
    setEditingAlbum(undefined);
    setIsEditOpen(true);
  };

  const handleSaveAlbum = async (album: NFAlbum) => {
    await saveAlbum(album);
    await refreshAll();
    setIsEditOpen(false);
    setInitialPhotos([]);
    setEditingAlbum(undefined);
    setSelectedAlbum(album);
    setIsDetailOpen(true);
  };

  const handleDeleteAlbum = async (id: string) => {
    if (window.confirm('Excluir esta organização e todas as suas fotos?')) {
      await deleteAlbum(id);
      await refreshAll();
      setIsDetailOpen(false);
      setSelectedAlbum(null);
    }
  };

  const handleAddPhotoToAlbum = async (albumId: string, newPhoto: PhotoAttachment) => {
    const album = albums.find((a) => a.id === albumId);
    if (!album) return;

    const updated: NFAlbum = {
      ...album,
      attachments: [...(album.attachments || []), newPhoto],
      updatedAt: Date.now()
    };

    await saveAlbum(updated);
    await refreshAll();
    setSelectedAlbum(updated);
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderNameInput.trim()) return;
    await createCustomFolder(newFolderNameInput.trim());
    setNewFolderNameInput('');
    setIsNewFolderModalOpen(false);
    await refreshAll();
  };

  const handleCardClick = (album: NFAlbum) => {
    setSelectedAlbum(album);
    setIsDetailOpen(true);
  };

  const filteredAlbums = albums.filter((album) => {
    const matchesSearch = searchQuery === '' || 
      album.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || album.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho */}
      <Header
        onScanClick={() => setIsAddPhotosOpen(true)}
        onSearchClick={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Banner de Instalação na Gaveta de Apps */}
      <InstallAppBanner />

      {/* Conteúdo Principal */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '4px' }}>
        
        {/* Visualização de Pastas */}
        {activeTab === 'folders' ? (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>Pastas de Fotos</h2>
              <button
                onClick={() => setIsNewFolderModalOpen(true)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <FolderPlus size={14} /> + Nova Pasta
              </button>
            </div>

            {folders.length > 0 ? (
              folders.map((cat) => {
                const catAlbums = albums.filter((a) => a.category === cat);
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
              })
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
                <Folder size={32} color="#71717A" />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>Nenhuma pasta criada ainda</h4>
                  <p className="label-subtle" style={{ marginTop: '4px' }}>
                    Crie uma pasta física no seu celular para organizar suas fotos
                  </p>
                </div>
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="btn-primary"
                  style={{ marginTop: '6px' }}
                >
                  <Plus size={16} />
                  Criar Primeira Pasta
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Dashboard Principal Bento Grid */
          <>
            <BentoGrid
              albums={albums}
              categories={folders}
              onSelectCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              onAlbumClick={handleCardClick}
              onAddNewFolder={() => setIsNewFolderModalOpen(true)}
            />

            {/* Lista de Organizações de Fotos */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span className="label-subtle" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px' }}>
                  {selectedCategory ? `Pastas em "${selectedCategory}"` : 'Organizações Recentes'} ({filteredAlbums.length})
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
                      Crie um pacote pelo apelido ou tire foto com a câmera
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={handleCreateManual} className="btn-secondary">
                      <Plus size={16} />
                      Criar Apelido
                    </button>
                    <button onClick={() => setIsAddPhotosOpen(true)} className="btn-primary">
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
        onScanClick={() => setIsAddPhotosOpen(true)}
      />

      {/* Modais */}
      <AddPhotosModal
        isOpen={isAddPhotosOpen}
        onClose={() => setIsAddPhotosOpen(false)}
        onPhotosSelected={handlePhotosSelected}
      />

      <EditAlbumModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveAlbum}
        initialData={editingAlbum}
        initialPhotos={initialPhotos}
        availableFolders={folders}
      />

      <AlbumDetailModal
        isOpen={isDetailOpen}
        album={selectedAlbum}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(alb) => {
          setIsDetailOpen(false);
          setEditingAlbum(alb);
          setInitialPhotos([]);
          setIsEditOpen(true);
        }}
        onDelete={handleDeleteAlbum}
        onAddPhoto={handleAddPhotoToAlbum}
      />

      {/* Modal de Criar Nova Pasta Física */}
      {isNewFolderModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="animate-slide-up" style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-active)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>Criar Nova Pasta no Celular</h3>
            <input
              type="text"
              placeholder="Nome da pasta (ex: Obra Matriz, Compras)"
              value={newFolderNameInput}
              onChange={(e) => setNewFolderNameInput(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                onClick={() => {
                  setIsNewFolderModalOpen(false);
                  setNewFolderNameInput('');
                }}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewFolder}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Criar Pasta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
