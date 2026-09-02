import React, { useState, useEffect, useMemo } from 'react';
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
  getAlbumById,
  saveAlbum, 
  deleteAlbum, 
  getAllFolders,
  createCustomFolder,
  deleteFolderAndContents
} from './services/db';
import { Plus, Camera, Folder, ArrowRight, FolderPlus, Trash2 } from 'lucide-react';

export const App: React.FC = () => {
  const [albums, setAlbums] = useState<NFAlbum[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'folders'>('grid');

  // Filtro de Data Específica (formato YYYY-MM-DD ou "")
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  const refreshAll = async () => {
    const list = await getAllAlbums();
    const folderList = await getAllFolders();
    setAlbums(list);
    setFolders(folderList);
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const list = await getAllAlbums();
      const folderList = await getAllFolders();
      if (isMounted) {
        setAlbums(list);
        setFolders(folderList);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Captura instantânea de fotos
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
    if (window.confirm('Excluir este registro e todas as suas fotos?')) {
      await deleteAlbum(id);
      await refreshAll();
      setIsDetailOpen(false);
      setSelectedAlbum(null);
    }
  };

  const handleDeleteFolder = async (folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir a pasta "${folderName}" e todas as fotos dentro dela?`)) {
      await deleteFolderAndContents(folderName);
      if (selectedCategory === folderName) {
        setSelectedCategory(null);
      }
      await refreshAll();
    }
  };

  const handleAddPhotosToAlbum = async (
    albumId: string, 
    newPhotos: PhotoAttachment[],
    insertAfterPhotoId?: string
  ) => {
    const currentAlbum = (await getAlbumById(albumId)) || albums.find((a) => a.id === albumId);
    if (!currentAlbum) return;

    let updatedAttachments = [...(currentAlbum.attachments || [])];

    if (insertAfterPhotoId) {
      // Localiza o índice da foto pai
      const parentIdx = updatedAttachments.findIndex((p) => p.id === insertAfterPhotoId);
      if (parentIdx !== -1) {
        // Encontra o ponto de inserção após a foto pai e suas variantes já existentes
        let insertIdx = parentIdx + 1;
        while (
          insertIdx < updatedAttachments.length &&
          updatedAttachments[insertIdx].parentPhotoId === insertAfterPhotoId
        ) {
          insertIdx++;
        }
        updatedAttachments.splice(insertIdx, 0, ...newPhotos);
      } else {
        updatedAttachments.push(...newPhotos);
      }
    } else {
      updatedAttachments.push(...newPhotos);
    }

    const updated: NFAlbum = {
      ...currentAlbum,
      attachments: updatedAttachments,
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

  // Filtro combinado: Busca + Pasta + Data Específica
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      // 1. Busca textual
      const matchesSearch = searchQuery === '' || 
        album.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.category?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Categoria / Pasta
      const matchesCategory = selectedCategory === null || album.category === selectedCategory;

      // 3. Filtro de Data
      let matchesDate = true;
      if (selectedDate) {
        const albumDate = new Date(album.createdAt);
        const year = albumDate.getFullYear();
        const month = String(albumDate.getMonth() + 1).padStart(2, '0');
        const day = String(albumDate.getDate()).padStart(2, '0');
        const albumDateLocalStr = `${year}-${month}-${day}`;
        matchesDate = albumDateLocalStr === selectedDate;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [albums, searchQuery, selectedCategory, selectedDate]);

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

      {/* Banner de Instalação */}
      <InstallAppBanner />

      {/* Conteúdo Principal com Espaçamentos Arejados */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '6px' }}>
        
        {/* Visualização de Pastas */}
        {activeTab === 'folders' ? (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>Pastas no Dispositivo</h2>
                <p className="label-subtle" style={{ marginTop: '2px' }}>{folders.length} pasta(s) organizadas</p>
              </div>
              <button
                onClick={() => setIsNewFolderModalOpen(true)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '12px' }}
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
                    style={{ cursor: 'pointer', gap: '12px', padding: '18px 20px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Folder size={22} color="#60A5FA" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>{cat}</h3>
                          <p className="label-subtle" style={{ marginTop: '2px' }}>{catAlbums.length} pacote(s) • {catPhotos} foto(s)</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={(e) => handleDeleteFolder(cat, e)}
                          title="Excluir esta pasta"
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            borderRadius: '8px',
                            padding: '8px',
                            color: '#F43F5E',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <span style={{ fontSize: '12px', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{
                padding: '44px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-card)',
                border: '1px dashed var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}>
                <Folder size={36} color="#71717A" />
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Nenhuma pasta criada</h4>
                  <p className="label-subtle" style={{ marginTop: '4px' }}>
                    Crie pastas para categorizar suas notas fiscais e fotos
                  </p>
                </div>
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="btn-primary"
                  style={{ marginTop: '8px' }}
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
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Lista de Registros */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label-subtle" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px', fontWeight: 700 }}>
                  {selectedCategory ? `Pastas em "${selectedCategory}"` : 'Registros'} ({filteredAlbums.length})
                </span>
                
                {(selectedCategory || selectedDate) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedDate('');
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Limpar Todos Filtros
                  </button>
                )}
              </div>

              {filteredAlbums.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredAlbums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      album={album}
                      onClick={() => handleCardClick(album)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <Camera size={34} color="#71717A" />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Nenhum registro encontrado</h4>
                    <p className="label-subtle" style={{ marginTop: '4px' }}>
                      {selectedDate || selectedCategory || searchQuery
                        ? 'Nenhuma foto encontrada com os filtros selecionados.'
                        : 'Tire uma foto com a câmera ou crie uma organização.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
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

      {/* Barra de Navegação Inferior Flutuante */}
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
        onAddPhotos={handleAddPhotosToAlbum}
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
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="animate-slide-up" style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-active)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.7)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Criar Nova Pasta
            </h3>
            <input
              type="text"
              className="input-custom"
              placeholder="Nome da pasta (ex: Obra Matriz, Compras)"
              value={newFolderNameInput}
              onChange={(e) => setNewFolderNameInput(e.target.value)}
              autoFocus
              style={{ fontSize: '14px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                onClick={() => {
                  setIsNewFolderModalOpen(false);
                  setNewFolderNameInput('');
                }}
                className="btn-secondary"
                style={{ padding: '9px 16px', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewFolder}
                className="btn-primary"
                style={{ padding: '9px 18px', fontSize: '13px' }}
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
