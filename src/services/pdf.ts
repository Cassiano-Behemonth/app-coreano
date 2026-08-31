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
  doc.setFillColor(24, 24, 27); // Dark zinc #18181B
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 26, 4, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(album.nickname || 'Álbum de Comprovantes', margin + 8, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170);
  const nfLabel = album.invoiceNumber ? `NF Nº: ${album.invoiceNumber} • ` : '';
  const photoCount = album.attachments?.length || 0;
  doc.text(`${nfLabel}Categoria: ${album.category || 'Geral'} • ${photoCount} Foto(s) Anexada(s)`, margin + 8, currentY + 19);

  currentY += 34;

  // 2. Galeria de Fotos e Comprovantes
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

export async function shareAlbumPDF(album: NFAlbum): Promise<void> {
  const doc = await generateAlbumPDF(album);
  const pdfBlob = doc.output('blob');
  const fileName = `${(album.nickname || album.invoiceNumber || 'Comprovantes').replace(/[^a-zA-Z0-9_-]/g, '_')}_Fotos.pdf`;

  const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: album.nickname || 'Comprovantes de NF',
        text: `Comprovantes e fotos: ${album.nickname} ${album.invoiceNumber ? `(NF #${album.invoiceNumber})` : ''}`,
        files: [file]
      });
      return;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
    }
  }

  doc.save(fileName);
}
