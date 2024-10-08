import React, { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export const BookContent = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch("URL_CUA_FILE_PDF");
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setPdfUrl(pdfUrl);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };
    fetchPdf();
  }, []);

  const handleDocumentLoad = (pdf) => {
    setTotalPages(pdf.numPages); // Update total pages
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : prevPage));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) =>
      prevPage < totalPages - 1 ? prevPage + 1 : prevPage
    );
  };

  return (
    <div>
      {pdfUrl ? (
        <Worker
          workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
        >
          <Viewer
            fileUrl={`https://firebasestorage.googleapis.com/v0/b/reading-book-web.appspot.com/o/pdfs%2F1728308133234Alice_in_Wonderland.pdf?alt=media&token=538190d0-8079-44d6-9aae-a3c397645492`}
            plugins={[defaultLayoutPluginInstance]}
            initialPage={currentPage}
            onDocumentLoad={handleDocumentLoad}
          />
        </Worker>
      ) : (
        <div>Loading PDF...</div>
      )}

      <div>
        <button onClick={goToPreviousPage} disabled={currentPage === 0}>
          Previous
        </button>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};
