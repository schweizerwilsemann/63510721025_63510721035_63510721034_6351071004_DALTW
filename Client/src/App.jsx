import { useState } from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes></Routes>
    </BrowserRouter>
  );
}

export default App;
