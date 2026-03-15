import jsPDF from "jspdf";

export interface TokenRecord {
  id: string;
  name: string;
  address: string | null;
  pmj_no: number | null;
  source: "members" | "widows";
}

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

export const generateTokenPdf = async ({
  records,
  headerLabel,
  logoPath = "/logo.png",
}: {
  records: TokenRecord[];
  headerLabel: string;
  logoPath?: string;
}) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const logoDataUrl = await loadImageAsDataUrl(logoPath);

  const pageWidth = 210;
  const pageHeight = 297;

  const pageMarginX = 8;
  const pageMarginY = 8;
  const colGap = 5;
  const rowGap = 5;

  const cols = 3;
  const rows = 5;
  const perPage = 15;

  const tokenWidth = (pageWidth - pageMarginX * 2 - colGap * (cols - 1)) / cols;
  const tokenHeight = (pageHeight - pageMarginY * 2 - rowGap * (rows - 1)) / rows;

  const masjidTitle = "Perunguzhi Muslim Jama'ath Masjid";
  const subTitle = "Token Card";

  const drawToken = (
    token: TokenRecord,
    tokenNumber: number,
    x: number,
    y: number
  ) => {
    pdf.setDrawColor(40, 40, 40);
    pdf.setLineWidth(0.45);
    pdf.roundedRect(x, y, tokenWidth, tokenHeight, 1.6, 1.6);

    // Masjid title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.8);
    pdf.text(masjidTitle, x + tokenWidth / 2, y + 5, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.7);
    pdf.text(subTitle, x + tokenWidth / 2, y + 8.3, { align: "center" });

    // Border below masjid title section
    pdf.setLineWidth(0.3);
    pdf.line(x + 2.5, y + 10.6, x + tokenWidth - 2.5, y + 10.6);

    // Logo + header row
    pdf.addImage(logoDataUrl, "PNG", x + 3, y + 12, 9.5, 9.5);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.2);
    pdf.text(headerLabel, x + tokenWidth / 2 + 3, y + 17.8, {
      align: "center",
    });

    // Border below logo/header row
    pdf.setLineWidth(0.3);
    pdf.line(x + 2.5, y + 23, x + tokenWidth - 2.5, y + 23);

    // Info area
    const infoTop = y + 24.5;
    const infoBottom = y + tokenHeight - 3;
    const c1 = x + tokenWidth * 0.25;
    const c2 = x + tokenWidth * 0.73;

    pdf.setLineWidth(0.22);
    pdf.line(c1, infoTop, c1, infoBottom);
    pdf.line(c2, infoTop, c2, infoBottom);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5.2);
    pdf.text("PMJ Number", x + tokenWidth * 0.125, infoTop + 3, {
      align: "center",
    });
    pdf.text("Name", x + tokenWidth * 0.49, infoTop + 3, {
      align: "center",
    });
    pdf.text("Token Number", x + tokenWidth * 0.865, infoTop + 3, {
      align: "center",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text(String(token.pmj_no ?? ""), x + tokenWidth * 0.125, infoTop + 11.5, {
      align: "center",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.8);
    const splitName = pdf.splitTextToSize(token.name || "", tokenWidth * 0.4);
    pdf.text(splitName, x + tokenWidth * 0.49, infoTop + 8.5, {
      align: "center",
      maxWidth: tokenWidth * 0.4,
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text(String(tokenNumber), x + tokenWidth * 0.865, infoTop + 11.5, {
      align: "center",
    });
  };

  records.forEach((record, index) => {
    if (index > 0 && index % perPage === 0) {
      pdf.addPage();
    }

    const pageIndex = index % perPage;
    const row = Math.floor(pageIndex / cols);
    const col = pageIndex % cols;

    const x = pageMarginX + col * (tokenWidth + colGap);
    const y = pageMarginY + row * (tokenHeight + rowGap);

    drawToken(record, index + 1, x, y);
  });

  pdf.save(`Token_Cards_${headerLabel.replace(/\s+/g, "_")}.pdf`);
};