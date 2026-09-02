import React, { useState, useRef } from 'react';
import { 
  X, 
  Share2, 
  Edit3, 
  Trash2, 
  Tag, 
  FileText, 
  Camera, 
  Plus, 
  CheckSquare, 
  Square, 
  Loader2,
  Layers,
  Upload,
  ArrowRight,
  Eye
} from 'lucide-react';
import type { NFAlbum, PhotoAttachment } from '../types';
import { shareAlbumPhotos } from '../services/sharePhotos';
import { compressImageFile } from '../services/imageOptimizer';
import { 
  formatPhotoCaption, 
  getNextMainCaption, 
  getNextVariantCaption,
  groupPhotosByMain
} from '../services/photoNumbering';
import confetti from 'canvas-confetti';

interface AlbumDetailModalProps {
  isOpen: boolean;
  album: NFAlbum | null;
  onClose: () => void;
  onEdit: (album: NFAlbum) => void;
  onDelete: (id: string) => void;
  onAddPhotos: (albumId: string, photos: PhotoAttachment[], insertAfterPhotoId?: string) => Promise<void>;
}

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  isOpen,
  album,
  onClose,
  onEdit,
  onDelete,
  onAddPhotos
}) => {
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const variantCameraInputRef = useRef<HTMLInputElement>(null);
  const variantGalleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !album) return null;

  const allPhotos = album.attachments || [];
  const selectedCount = selectedPhotoIds.length;

  // Foto pai selecionada (quando exatamente 1 foto está marcada)
  const singleSelectedPhoto = selectedCount === 1 
    ? allPhotos.find((p) => p.id === selectedPhotoIds[0]) || null 
    : null;

  const nextVariantCaption = singleSelectedPhoto 
    ? getNextVariantCaption(singleSelectedPhoto, allPhotos)
    : '';

  const toggleSelectPhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPhotoIds.length === allPhotos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(allPhotos.map((p) => p.id));
    }
  };

  const handleSharePhotos = async () => {
    if (allPhotos.length === 0) return;
    setIsProcessing(true);
    setActionFeedback(null);

    const photosToShare = selectedCount > 0 
      ? allPhotos.filter((p) => selectedPhotoIds.includes(p.id))
      : allPhotos;

    try {
      const result = await shareAlbumPhotos(album, photosToShare);
      if (result.success) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setActionFeedback(result.message);
        setTimeout(() => setActionFeedback(null), 3500);
      } else if (result.message && !result.message.includes('cancelado')) {
        setActionFeedback(result.message);
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setActionFeedback('Erro ao processar compartilhamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Adiciona fotos principais comuns (vai para o fim da lista com #N)
  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsAddingPhoto(true);
    try {
      const fileArray = Array.from(files);
      const compressPromises = fileArray.map((file) => compressImageFile(file));
      const compressedUrls = await Promise.all(compressPromises);

      const workingList = [...allPhotos];
      const newAttachments: PhotoAttachment[] = [];
      const now = Date.now();

      for (let i = 0; i < compressedUrls.length; i++) {
        const nextCap = getNextMainCaption([...workingList, ...newAttachments]);
        const newAtt: PhotoAttachment = {
          id: `att_${now}_${i}`,
          dataUrl: compressedUrls[i],
          caption: nextCap,
          createdAt: now
        };
        newAttachments.push(newAtt);
      }

      await onAddPhotos(album.id, newAttachments);
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
      setActionFeedback(`${newAttachments.length} foto(s) adicionada(s)!`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Erro ao adicionar e comprimir fotos:', err);
      setActionFeedback('Erro ao adicionar fotos.');
    } finally {
      setIsAddingPhoto(false);
    }
  };

  // Adiciona foto variante (#1b, #1c, etc.) vinculada à foto pai selecionada
  const handleVariantFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !singleSelectedPhoto) return;

    setIsVariantModalOpen(false);
    setIsAddingPhoto(true);

    try {
      const fileArray = Array.from(files);
      const compressPromises = fileArray.map((file) => compressImageFile(file));
      const compressedUrls = await Promise.all(compressPromises);

      const newVariants: PhotoAttachment[] = [];
      const tempAll = [...allPhotos];
      const now = Date.now();

      for (let i = 0; i < compressedUrls.length; i++) {
        const variantCap = getNextVariantCaption(singleSelectedPhoto, [...tempAll, ...newVariants]);
        const newAtt: PhotoAttachment = {
          id: `att_var_${now}_${i}`,
          dataUrl: compressedUrls[i],
          caption: variantCap,
          parentPhotoId: singleSelectedPhoto.id,
          createdAt: now
        };
        newVariants.push(newAtt);
      }

      await onAddPhotos(album.id, newVariants, singleSelectedPhoto.id);
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
      setActionFeedback(`Foto variante ${newVariants[0].caption} adicionada!`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar foto variante:', err);
      setActionFeedback('Erro ao salvar variante.');
    } finally {
      setIsAddingPhoto(false);
    }
  };

  // Renderiza um card individual de foto
  const renderPhotoCard = (att: PhotoAttachment, isVariant: boolean, customWidth?: string) => {
    const isSelected = selectedPhotoIds.includes(att.id);
    const cleanCaption = formatPhotoCaption(att.caption);

    return (
      <div
        key={att.id}
        onClick={() => toggleSelectPhoto(att.id)}
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          height: '140px',
          width: customWidth || '100%',
          minWidth: customWidth,
          backgroundColor: '#000000',
          cursor: 'pointer',
          border: isSelected 
            ? '2px solid #3B82F6' 
            : isVariant 
              ? '1px solid rgba(59, 130, 246, 0.45)' 
              : '1px solid var(--border-subtle)',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <img 
          src={att.dataUrl} 
          alt={cleanCaption} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Botão de Zoom / Ver Foto (canto superior esquerdo) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPhotoZoom(att.dataUrl);
          }}
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            backgroundColor: 'rgba(0,0,0,0.65)',
            border: 'none',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            zIndex: 2
          }}
          title="Ver em tela cheia"
        >
          <Eye size={14} />
        </button>

        {/* Checkbox de seleção (canto superior direito) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectPhoto(att.id);
          }}
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            backgroundColor: isSelected ? '#3B82F6' : 'rgba(0,0,0,0.65)',
            border: 'none',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            zIndex: 2
          }}
        >
          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>

        {/* Legenda: Formato "#1", "#1b", etc. */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '6px 8px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          fontSize: '12px',
          fontWeight: 700,
          color: isVariant ? '#93C5FD' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{cleanCaption}</span>
          {isVariant && (
            <span style={{ 
              fontSize: '9px', 
              padding: '1px 5px', 
              borderRadius: '4px', 
              backgroundColor: 'rgba(59, 130, 246, 0.35)',
              color: '#BFDBFE',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              variante
            </span>
          )}
        </div>
      </div>
    );
  };

  const photoGroups = groupPhotosByMain(allPhotos);

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
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header: Categoria na Esquerda + Ações na Direita */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-pill badge-blue" style={{ fontSize: '12px', padding: '5px 12px' }}>
              <Tag size={12} /> {album.category || 'Geral'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => onEdit(album)} 
              className="btn-icon" 
              style={{ width: '38px', height: '38px' }}
              title="Editar Organização"
            >
              <Edit3 size={16} />
            </button>
            <button 
              onClick={() => onDelete(album.id)} 
              className="btn-icon" 
              style={{ width: '38px', height: '38px', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              title="Excluir"
            >
              <Trash2 size={16} color="#F43F5E" />
            </button>
            <button 
              onClick={onClose} 
              className="btn-icon" 
              style={{ width: '38px', height: '38px' }}
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo com Rolagem */}
        <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Apelido e Informações */}
          <div>
            {album.invoiceNumber && (
              <div style={{ marginBottom: '6px' }}>
                <span className="badge-pill" style={{ fontSize: '11px', padding: '4px 10px' }}>
                  <FileText size={11} /> NF #{album.invoiceNumber}
                </span>
              </div>
            )}

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              {album.nickname}
            </h2>
            <p className="label-subtle" style={{ marginTop: '5px' }}>
              {allPhotos.length} foto(s) salvas • {new Date(album.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Feedback de Ação */}
          {actionFeedback && (
            <div className="animate-slide-up" style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {actionFeedback}
            </div>
          )}

          {/* Seção de Fotos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Top Bar da Seção: Título na Esquerda + COMPARTILHAR, FOTO VARIANTE e GALERIA na Direita */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              
              {/* Lado Esquerdo: Título e Marcar Todas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <Camera size={16} color="#34D399" />
                  Fotos ({allPhotos.length})
                </h4>
                {allPhotos.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#60A5FA',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      padding: '2px 4px'
                    }}
                  >
                    {selectedPhotoIds.length === allPhotos.length ? 'Desmarcar' : 'Marcar todas'}
                  </button>
                )}
              </div>

              {/* Lado Direito: Ações contextuais (Compartilhar, Foto Variante do lado e Galeria lá em cima) */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                
                {/* 1. Botão de Foto Variante (exibido do lado quando 1 foto está selecionada) */}
                {singleSelectedPhoto && (
                  <button
                    onClick={() => setIsVariantModalOpen(true)}
                    className="btn-secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      borderColor: 'rgba(59, 130, 246, 0.45)',
                      color: '#60A5FA',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title={`Adicionar foto variante (${nextVariantCaption}) para a foto ${formatPhotoCaption(singleSelectedPhoto.caption)}`}
                  >
                    <Layers size={14} color="#60A5FA" />
                    + Foto Variante ({nextVariantCaption})
                  </button>
                )}

                {/* 2. Botão Compartilhar */}
                <button
                  onClick={handleSharePhotos}
                  disabled={isProcessing || allPhotos.length === 0}
                  className="btn-primary"
                  style={{
                    padding: '7px 13px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#FFFFFF',
                    color: '#09090B'
                  }}
                >
                  <Share2 size={13} />
                  {selectedCount > 0 ? `Compartilhar (${selectedCount})` : 'Compartilhar'}
                </button>

                {/* 3. Botão Galeria mantido lá em cima */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={galleryInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    handleAddPhotos(e.target.files);
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isAddingPhoto}
                  className="btn-secondary"
                  style={{
                    padding: '7px 12px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Galeria
                </button>
              </div>

            </div>

            {isAddingPhoto && (
              <div style={{ padding: '12px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)' }}>
                <Loader2 size={20} className="pulse-glow" style={{ margin: '0 auto 6px auto', color: '#60A5FA' }} />
                <p style={{ fontSize: '12px', color: '#9494A3' }}>Otimizando e salvando imagem...</p>
              </div>
            )}

            {/* Grid de Fotos: Variantes aparecem DO LADO da foto principal */}
            {allPhotos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {photoGroups.map((group) => {
                  if (group.variants.length > 0) {
                    // Foto com variante(s): Ocupa largura total e renderiza a principal com as variantes lado a lado!
                    return (
                      <div
                        key={group.mainPhoto.id}
                        style={{
                          gridColumn: '1 / -1',
                          backgroundColor: 'rgba(255, 255, 255, 0.025)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '16px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Layers size={14} /> {formatPhotoCaption(group.mainPhoto.caption)} e Foto(s) Variante(s)
                          </span>
                          <span className="label-subtle" style={{ fontSize: '11px' }}>
                            {1 + group.variants.length} foto(s) lado a lado
                          </span>
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          overflowX: 'auto', 
                          paddingBottom: '4px',
                          alignItems: 'center' 
                        }}>
                          {/* Foto Principal */}
                          <div style={{ width: '140px', flexShrink: 0 }}>
                            {renderPhotoCard(group.mainPhoto, false, '140px')}
                          </div>

                          {/* Seta indicativa de vínculo lado a lado */}
                          <div style={{ color: '#60A5FA', opacity: 0.6, flexShrink: 0 }}>
                            <ArrowRight size={16} />
                          </div>

                          {/* Fotos Variantes Lado a Lado */}
                          {group.variants.map((v) => (
                            <div key={v.id} style={{ width: '140px', flexShrink: 0 }}>
                              {renderPhotoCard(v, true, '140px')}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Foto avulsa sem variante: renderiza normalmente no grid de 2 colunas
                  return renderPhotoCard(group.mainPhoto, false);
                })}
              </div>
            ) : (
              <div style={{ padding: '32px 10px', textAlign: 'center', backgroundColor: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Camera size={28} color="#71717A" style={{ margin: '0 auto 6px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhuma foto adicionada ainda.</p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé Fixo: Botão grande que vira 2 botões quando uma foto é pressionada */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              handleAddPhotos(e.target.files);
              e.target.value = '';
            }}
          />

          {singleSelectedPhoto ? (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isAddingPhoto}
                className="btn-secondary"
                style={{ 
                  flex: 1, 
                  padding: '13px', 
                  fontSize: '14px', 
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isAddingPhoto ? <Loader2 size={16} className="pulse-glow" /> : <Camera size={16} />}
                Tirar Foto
              </button>

              <button
                onClick={() => setIsVariantModalOpen(true)}
                disabled={isAddingPhoto}
                className="btn-primary"
                style={{ 
                  flex: 1.2, 
                  padding: '13px', 
                  fontSize: '14px', 
                  whiteSpace: 'nowrap',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                }}
              >
                <Layers size={16} />
                + Variante ({nextVariantCaption})
              </button>
            </div>
          ) : (
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isAddingPhoto}
              className="btn-primary"
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: '15px', 
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isAddingPhoto ? <Loader2 size={18} className="pulse-glow" /> : <Camera size={18} />}
              {isAddingPhoto ? 'Salvando fotos...' : 'Tirar Foto'}
            </button>
          )}
        </div>

      </div>

      {/* Modal de Escolha de Captura para Foto Variante */}
      {isVariantModalOpen && singleSelectedPhoto && (
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
          zIndex: 1150,
          padding: '20px'
        }}>
          <div className="animate-slide-up" style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-active)',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div>
              <span className="badge-pill badge-blue" style={{ fontSize: '11px', marginBottom: '8px' }}>
                Nova Variante: {nextVariantCaption}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                Adicionar Variante para {formatPhotoCaption(singleSelectedPhoto.caption)}
              </h3>
              <p className="label-subtle" style={{ marginTop: '4px' }}>
                A nova foto será numerada como <strong>{nextVariantCaption}</strong> e aparecerá imediatamente do lado da foto original.
              </p>
            </div>

            {/* Inputs Ocultos para a Variante */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={variantCameraInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                handleVariantFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <input
              type="file"
              accept="image/*"
              multiple
              ref={variantGalleryInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                handleVariantFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => variantCameraInputRef.current?.click()}
                className="btn-primary"
                style={{ width: '100%', padding: '13px' }}
              >
                <Camera size={16} /> Tirar Foto Variante (Câmera)
              </button>

              <button
                onClick={() => variantGalleryInputRef.current?.click()}
                className="btn-secondary"
                style={{ width: '100%', padding: '13px' }}
              >
                <Upload size={16} /> Escolher da Galeria
              </button>

              <button
                onClick={() => setIsVariantModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Zoom de Imagem */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <img src={selectedPhotoZoom} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }} />
          <button
            onClick={() => setSelectedPhotoZoom(null)}
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
