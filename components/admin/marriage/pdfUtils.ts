import jsPDF from "jspdf";

export const loadImageAsDataUrl = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const loadFontAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load font: ${url}`);

  const arrayBuffer = await response.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

export const registerAnekMalayalamFont = async (pdf: jsPDF) => {
  const fontBase64 = await loadFontAsBase64("/AnekMalayalam-Variable.ttf");

  pdf.addFileToVFS("AnekMalayalam-Variable.ttf", fontBase64);
  pdf.addFont(
    "AnekMalayalam-Variable.ttf",
    "AnekMalayalam",
    "normal",
    "Identity-H"
  );
  pdf.addFont(
    "AnekMalayalam-Variable.ttf",
    "AnekMalayalam",
    "bold",
    "Identity-H"
  );
};

export const createA4Pdf = (orientation: "portrait" | "landscape") =>
  new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
    compress: true,
  });

export const downloadBlankTemplatePdf = async ({
  templatePath,
  fileName,
  orientation,
}: {
  templatePath: string;
  fileName: string;
  orientation: "portrait" | "landscape";
}) => {
  const pdf = createA4Pdf(orientation);
  const imgData = await loadImageAsDataUrl(templatePath);

  const pageWidth = orientation === "landscape" ? 297 : 210;
  const pageHeight = orientation === "landscape" ? 210 : 297;

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
  pdf.save(fileName);
};