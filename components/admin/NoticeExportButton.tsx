"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Document, Packer, Paragraph, AlignmentType, PageBreak, TextRun, InternalHyperlink, Bookmark, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { Notice } from "./EditNotice";

export default function NoticeExportButton({ notices }: { notices: Notice[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!notices || notices.length === 0) return;
    setIsExporting(true);

    try {
      // 1. Generate Custom Index Paragraphs (Hyperlinked)
      const indexParagraphs = notices.map((notice, index) => {
        const noticeDate = new Date(notice.notice_date).toLocaleDateString('en-IN');
        return new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new InternalHyperlink({
              anchor: `notice-${index}`, // Links to the Bookmark ID below
              children: [
                new TextRun({
                  text: `${index + 1}.  ${noticeDate}   -   ${notice.heading}`,
                  color: "0563C1", // Classic Word hyperlink blue
                  underline: {},
                  size: 28, // 14pt standard text size
                }),
              ],
            }),
          ],
        });
      });

      // 2. Generate Notice Pages
      const noticePages = notices.flatMap((notice, index) => {
        const noticeDate = new Date(notice.notice_date).toLocaleDateString('en-IN');

        return [
          // Top Left: Date
          new Paragraph({
            text: `Date: ${noticeDate}`,
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
          }),

          // Middle: Heading (Wrapped in a Bookmark so the Index can jump to it)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new Bookmark({
                id: `notice-${index}`, // The target ID for the hyperlink
                children: [
                  new TextRun({
                    text: notice.heading,
                    bold: true,
                    size: 36, // 18pt Heading size
                  }),
                ],
              }),
            ],
          }),

          // Underneath: Description / Details
          new Paragraph({
            text: notice.details,
            alignment: AlignmentType.LEFT,
            spacing: { after: 800, line: 360 }, // Extra spacing and 1.5 line height for readability
          }),

          // Bottom: Authoriser
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Confirmed By: ${notice.confirmed_by}`,
                bold: true,
                size: 24, // 12pt slightly smaller for signature
              })
            ],
          }),

          // Add a page break after every notice EXCEPT the very last one
          ...(index < notices.length - 1 ? [new Paragraph({ children: [new PageBreak()] })] : [])
        ];
      });

      // 3. Assemble Document with Anek Malayalam base font
      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                size: 28, // 14pt Standard Size
                font: "Anek Malayalam",
              },
            },
            heading2: {
              run: {
                size: 40, // 20pt Title Size
                bold: true,
                font: "Anek Malayalam",
                color: "047857", // Emerald Green
              },
              paragraph: {
                spacing: { before: 300, after: 600 },
                alignment: AlignmentType.CENTER,
              },
            }
          },
        },
        sections: [
          {
            properties: {},
            children: [
              // --- PAGE 1: THE CUSTOM INDEX ---
              new Paragraph({
                text: "PMJ Masjid - Notices Index",
                heading: HeadingLevel.HEADING_2,
              }),
              ...indexParagraphs,
              new Paragraph({
                children: [new PageBreak()], // Force a page break after the Index
              }),

              // --- SUBSEQUENT PAGES: THE NOTICES ---
              ...noticePages,
            ],
          },
        ],
      });

      // 4. Generate and Download the File
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `PMJ_Notices_Export_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.docx`);

    } catch (error) {
      console.error("Export Error:", error);
      alert("Failed to export to DOCX. Make sure you have installed 'docx' and 'file-saver' via npm.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || notices.length === 0}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isExporting ? "Generating DOCX..." : "Export to Word"}
    </button>
  );
}