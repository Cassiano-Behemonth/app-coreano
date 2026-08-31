import jsPDF from 'jspdf';
import type { NFAlbum } from '../types';

export async function generateAlbumPDF(album: NFAlbum): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 16;

  // 1. Cabeçalho Minimalista Bento Dark
  doc.setFillColor(24, 24, 27); // #18181B
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 4, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(album.nickname || 'Comprovantes e Fotos', margin + 8, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170);
  const nfLabel = album.invoiceNumber ? `NF Nº: ${album.invoiceNumber} • ` : '';
  const photoCount = album.attachments?.length || 0;
  doc.text(`${nfLabel}Pasta: ${album.category || 'Geral'} • ${photoCount} Foto(s) Anexada(s)`, margin + 8, currentY + 19);

  currentY += 34;

  // 2. Galeria de Fotos em Alta Resolução
  if (album.attachments && album.attachments.length > 0) {
    const imgWidth = 85;
    const imgHeight = 65;
    let col = 0;

    for (let i = 0; i < album.attachments.length; i++) {
      const att = album.attachments[i];
      if (currentY + imgHeight > 270) {
        doc.addPage();
        currentY = 20;
        col = 0;
      }

      const xPos = margin + col * (imgWidth + 10);
      try {
        doc.addImage(att.dataUrl, 'JPEG', xPos, currentY, imgWidth, imgHeight, undefined, 'FAST');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(39, 39, 42);
        const caption = att.caption || `Foto #${i + 1}`;
        doc.text(caption, xPos, currentY + imgHeight + 5);
      } catch (err) {
        console.warn('Erro ao inserir foto no PDF:', err);
      }

      col++;
      if (col >= 2) {
        col = 0;
        currentY += imgHeight + 14;
      }
    }
  } else {
    doc.setTextColor(113, 113, 122);
    doc.setFontSize(11);
    doc.text('Nenhuma foto vinculada a este registro.', margin, currentY + 10);
  }

  return doc;
}

export async function shareOrDownloadPDF(album: NFAlbum): Promise<{ success: boolean; message: string }> {
  try {
    const doc = await generateAlbumPDF(album);
    const fileName = `${(album.nickname || album.invoiceNumber || 'Comprovantes').replace(/[^a-zA-Z0-9_-]/g, '_')}_Fotos.pdf`;
    const pdfBlob = doc.output('blob');

    // 1. Tenta compartilhamento nativo no celular (WhatsApp, E-mail, Drive, etc.)
    if (navigator.share) {
      try {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: album.nickname || 'Comprovantes',
            text: `Fotos e comprovantes: ${album.nickname} ${album.invoiceNumber ? `(NF #${album.invoiceNumber})` : ''}`,
            files: [file]
          });
          return { success: true, message: 'Compartilhado com sucesso!' };
        }
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: true, message: 'Compartilhamento cancelado' };
        }
        console.warn('Fallback para download direto após erro no share:', shareErr);
      }
    }

    // 2. Download direto automático como fallback 100% garantido
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

    return { success: true, message: 'PDF baixado com sucesso no dispositivo!' };
  } catch (error) {
    console.error('Erro ao gerar/compartilhar PDF:', error);
    return { success: false, message: 'Erro ao gerar o arquivo PDF.' };
  }
}
