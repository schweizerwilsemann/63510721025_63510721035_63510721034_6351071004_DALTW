import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export const BookContent = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentBookPdfURL, setCurrentBookPdfURL] = useState("");
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
  };

  useEffect(() => {
    const currentUrl = window.location.href;
    const pdfUrlFromQuery = currentUrl.split("book=")[1];
    if (pdfUrlFromQuery) {
      setCurrentBookPdfURL(pdfUrlFromQuery);
    }
  }, []);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!currentBookPdfURL) return;
      try {
        const response = await fetch(currentBookPdfURL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setPdfUrl(pdfUrl);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPdf();
  }, [currentBookPdfURL]);

  return (
    <div className="flex justify-center items-center h-30rem  bg-gray-100">
      {pdfUrl ? (
        <HTMLFlipBook width={600} height={800} className="shadow-lg">
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="p-4">
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={index + 1} scale={1.5} />
              </Document>
            </div>
          ))}
        </HTMLFlipBook>
      ) : (
        <div className="text-center text-gray-500">Loading PDF...</div>
      )}
    </div>
  );
};
