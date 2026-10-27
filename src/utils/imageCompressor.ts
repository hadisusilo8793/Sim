/**
 * Compresses an image file client-side using HTML Canvas.
 * Target max file size: ~300KB
 * Generates standardized filename format: [NIK]_[NAMA]_[JENIS_SIM].jpg
 */
export async function compressSIMPhoto(
  file: File | Blob,
  nik: string,
  nama: string,
  jenisSIM: string,
  maxWidth = 1024,
  maxHeight = 768,
  quality = 0.8
): Promise<{ dataUrl: string; fileName: string; fileSizeKB: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while constraining dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas context'));
          return;
        }

        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark standard header for SIM verification
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(0, height - 32, width, 32);
        ctx.font = '12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`STOCK OPNAME DC BANDUNG - ${nik} (${jenisSIM})`, 12, height - 12);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const fileSizeKB = Math.round((dataUrl.length * (3 / 4)) / 1024);

        // Clean name format for filename: [NIK]_[NAMA]_[JENIS_SIM].jpg
        const cleanNama = nama.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
        const cleanJenis = jenisSIM.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
        const fileName = `${nik}_${cleanNama}_${cleanJenis}.jpg`;

        resolve({
          dataUrl,
          fileName,
          fileSizeKB,
        });
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
