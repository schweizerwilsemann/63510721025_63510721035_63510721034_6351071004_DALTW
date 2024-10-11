import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Breadcrumb from "../components/Breadcrumb";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export const BookContent = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentBookSlug, setCurrentBookSlug] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [book, setBook] = useState({});
  const onDocumentLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
  };
  const currentUrl = window.location.href;
  const slugFromQuery = currentUrl.split("book=")[1];

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/books/${slugFromQuery}`);
        const data = await response.json();
        setBook(data);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slugFromQuery]);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!book.pdfUrl) return;
      try {
        const response = await fetch(book.pdfUrl);
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
  }, [book.pdfUrl]);

  return (
    <>
      <Breadcrumb book={book} pageNumber={numPages} />
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
    </>
  );
};
