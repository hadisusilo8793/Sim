import ExcelJS from 'exceljs';
import { DatabaseSIM } from '../types';

/**
 * Converts any image source (data URL, SVG data URL, canvas or URL)
 * into a pure base64 JPEG string and extension suitable for ExcelJS addImage.
 */
export async function prepareImageForExcel(
  imageUrl: string
): Promise<{ base64: string; extension: 'jpeg' | 'png' } | null> {
  if (!imageUrl) return null;

  try {
    // If it's already a base64 JPEG
    if (imageUrl.startsWith('data:image/jpeg;base64,')) {
      return {
        base64: imageUrl.replace('data:image/jpeg;base64,', ''),
        extension: 'jpeg',
      };
    }

    // If it's already a base64 PNG
    if (imageUrl.startsWith('data:image/png;base64,')) {
      return {
        base64: imageUrl.replace('data:image/png;base64,', ''),
        extension: 'png',
      };
    }

    // If it's already a base64 WebP
    if (imageUrl.startsWith('data:image/webp;base64,')) {
      return {
        base64: imageUrl.replace('data:image/webp;base64,', ''),
        extension: 'jpeg',
      };
    }

    // If it's already a raw base64 string
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && imageUrl.length > 80) {
      return {
        base64: imageUrl,
        extension: 'jpeg',
      };
    }

    // If it's an SVG data URL or external URL, draw onto canvas and convert to JPEG
    return new Promise((resolve) => {
      const img = new Image();
      // Only set crossOrigin on remote HTTP/HTTPS images, NEVER on data: URIs
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      // Safety timeout to prevent stalling
      const timer = setTimeout(() => {
        resolve(null);
      }, 3500);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const targetWidth = 600;
          const targetHeight = 380;
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          // White background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          // Draw the loaded image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1];
          resolve({
            base64,
            extension: 'jpeg',
          });
        } catch (err) {
          console.error('Error drawing image on canvas for Excel:', err);
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        // Fallback for SVG data URL: convert to Blob URL
        if (imageUrl.includes('svg')) {
          try {
            const svgMatch = imageUrl.match(/<svg[\s\S]*<\/svg>/i);
            const svgContent = svgMatch ? svgMatch[0] : decodeURIComponent(imageUrl.replace(/^data:image\/svg\+xml;utf8,/, ''));
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const blobUrl = URL.createObjectURL(blob);
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 380;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, 600, 380);
                  ctx.drawImage(fallbackImg, 0, 0, 600, 380);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                  URL.revokeObjectURL(blobUrl);
                  resolve({ base64: dataUrl.split(',')[1], extension: 'jpeg' });
                  return;
                }
              } catch (e) {
                // Ignore
              }
              URL.revokeObjectURL(blobUrl);
              resolve(null);
            };
            fallbackImg.onerror = () => {
              URL.revokeObjectURL(blobUrl);
              resolve(null);
            };
            fallbackImg.src = blobUrl;
            return;
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      img.src = imageUrl;
    });
  } catch (error) {
    console.error('prepareImageForExcel error:', error);
    return null;
  }
}

/**
 * Format date YYYY-MM-DD into format e.g. "13-Oct-25" matching the user's Excel file
 */
export function formatDateExcel(dateStr: string): string {
  if (!dateStr) return '-';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const shortYear = year.slice(-2);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day}-${months[monthIdx]}-${shortYear}`;
    }
  }
  return dateStr;
}

/**
 * Generates an authentic DC Bandung Excel spreadsheet with embedded SIM card photos
 * in Column I ("FOTO SIM DRIVER"), exactly as shown in the user's reference image.
 */
export async function exportSIMDatabaseToExcelWithImages(
  simList: DatabaseSIM[],
  fileNamePrefix = 'G027-DC BDG SIM DRIVER (update)'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DC BANDUNG LOGISTICS';
  workbook.lastModifiedBy = 'Admin Logistics DC Bandung';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create "DATA" worksheet (matches the screenshot tab name)
  const worksheet = workbook.addWorksheet('DATA', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
    views: [{ showGridLines: true }],
  });

  // Setup Column Widths (matching columns A to I in the screenshot)
  worksheet.columns = [
    { key: 'colA', width: 4 },   // Column A: margin/empty
    { key: 'colB', width: 7 },   // Column B: NO
    { key: 'colC', width: 16 },  // Column C: NIK
    { key: 'colD', width: 28 },  // Column D: NAMA DRIVER
    { key: 'colE', width: 18 },  // Column E: STATUS IDM / GBN / PINJAMAN (DC ?)
    { key: 'colF', width: 22 },  // Column F: DRIVER KIRIM DRY/BUAH/ROTI/YUMMI/TAKAKI/MISDO/LPG
    { key: 'colG', width: 17 },  // Column G: JENIS SIM (A/B1/B1 UMUM/B2)
    { key: 'colH', width: 16 },  // Column H: TANGGAL BERLAKU SIM
    { key: 'colI', width: 34 },  // Column I: FOTO SIM DRIVER
  ];

  // Thin black border style
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  // Row 1: Header title "DC BANDUNG" and total count indicator
  const row1 = worksheet.getRow(1);
  row1.height = 22;
  row1.getCell('B').value = 'DC BANDUNG';
  row1.getCell('B').font = { name: 'Calibri', size: 11, bold: true };
  row1.getCell('B').alignment = { vertical: 'middle', horizontal: 'left' };

  row1.getCell('G').value = simList.length;
  row1.getCell('G').font = { name: 'Calibri', size: 11, bold: true };
  row1.getCell('G').alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 2: Table Column Headers (Matching exact screenshot labels)
  const row2 = worksheet.getRow(2);
  row2.height = 48; // Tall enough for wrapped header text

  const headers: { col: string; text: string }[] = [
    { col: 'B', text: 'NO' },
    { col: 'C', text: 'NIK' },
    { col: 'D', text: 'NAMA DRIVER' },
    { col: 'E', text: 'STATUS IDM / GBN\n/ PINJAMAN (DC ?)' },
    { col: 'F', text: 'DRIVER KIRIM\nDRY/BUAH/ROTI/YU\nMMI/TAKAKI/MISDO/\nLPG' },
    { col: 'G', text: 'JENIS SIM (A/B1/B1\nUMUM/B2)' },
    { col: 'H', text: 'TANGGAL\nBERLAKU SIM' },
    { col: 'I', text: 'FOTO SIM DRIVER' },
  ];

  headers.forEach(({ col, text }) => {
    const cell = row2.getCell(col);
    cell.value = text;
    cell.font = { name: 'Calibri', size: 10, bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  // Data Rows starting from Row 3
  const startRowIndex = 3;
  for (let i = 0; i < simList.length; i++) {
    const item = simList[i];
    const currentRowNumber = startRowIndex + i;
    const row = worksheet.getRow(currentRowNumber);
    row.height = 92; // 92pt gives ideal height for a 3:2 or 1.58:1 SIM card photo

    // Col B: NO
    const cellB = row.getCell('B');
    cellB.value = i + 1;
    cellB.font = { name: 'Calibri', size: 11 };
    cellB.alignment = { vertical: 'middle', horizontal: 'center' };
    cellB.border = thinBorder;

    // Col C: NIK
    const cellC = row.getCell('C');
    cellC.value = item.nik;
    cellC.font = { name: 'Calibri', size: 11 };
    cellC.alignment = { vertical: 'middle', horizontal: 'center' };
    cellC.border = thinBorder;

    // Col D: NAMA DRIVER
    const cellD = row.getCell('D');
    cellD.value = item.namaDriver.toUpperCase();
    cellD.font = { name: 'Calibri', size: 11 };
    cellD.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    cellD.border = thinBorder;

    // Col E: STATUS
    const cellE = row.getCell('E');
    cellE.value = item.statusDriver;
    cellE.font = { name: 'Calibri', size: 11 };
    cellE.alignment = { vertical: 'middle', horizontal: 'center' };
    cellE.border = thinBorder;

    // Col F: DRIVER KIRIM
    const cellF = row.getCell('F');
    cellF.value = item.driverKirim;
    cellF.font = { name: 'Calibri', size: 11 };
    cellF.alignment = { vertical: 'middle', horizontal: 'center' };
    cellF.border = thinBorder;

    // Col G: JENIS SIM
    const cellG = row.getCell('G');
    cellG.value = item.jenisSIM;
    cellG.font = { name: 'Calibri', size: 11 };
    cellG.alignment = { vertical: 'middle', horizontal: 'center' };
    cellG.border = thinBorder;

    // Col H: TANGGAL BERLAKU SIM
    const cellH = row.getCell('H');
    cellH.value = formatDateExcel(item.tglBerlakuSIM);
    cellH.font = { name: 'Calibri', size: 11 };
    cellH.alignment = { vertical: 'middle', horizontal: 'center' };
    cellH.border = thinBorder;

    // Col I: FOTO SIM DRIVER cell border
    const cellI = row.getCell('I');
    cellI.value = ''; // empty text, image will sit inside this cell
    cellI.border = thinBorder;

    // Process & embed image into Column I
    if (item.urlFotoSIM) {
      try {
        const imgData = await prepareImageForExcel(item.urlFotoSIM);
        if (imgData) {
          const imageId = workbook.addImage({
            base64: imgData.base64,
            extension: imgData.extension,
          });

          // Column I is index 8 (0-indexed: A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8)
          // Span from Col 8 (left of Column I) to Col 9 (right of Column I / start of Col J)
          // and from top of current row to bottom of current row, perfectly filling the cell
          worksheet.addImage(imageId, {
            tl: { col: 8, row: currentRowNumber - 1 } as any,
            br: { col: 9, row: currentRowNumber } as any,
            editAs: 'oneCell',
          } as any);
        }
      } catch (imgError) {
        console.warn(`Could not embed image for NIK ${item.nik}:`, imgError);
      }
    }
  }

  // Also add "INFO" tab (matching the screenshot where there is an INFO tab and DATA tab)
  const infoSheet = workbook.addWorksheet('INFO');
  infoSheet.addRow(['SISTEM STOCK OPNAME SIM DRIVER - PT INDOMARCO PRISMATAMA DC BANDUNG']);
  infoSheet.addRow(['Tanggal Export:', new Date().toLocaleString('id-ID')]);
  infoSheet.addRow(['Total Driver Terdata:', simList.length]);
  infoSheet.addRow(['Departemen:', 'Logistics & Fleet Operations DC Bandung']);

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const now = new Date();
  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  const downloadFileName = `${fileNamePrefix} per ${currentMonth} ${currentYear}.xlsx`;

  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = downloadFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(blobUrl);
}
