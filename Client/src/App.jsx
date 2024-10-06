import { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { useState } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Search from "./pages/Search";
import Projects from "./pages/Projects";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UploadBook } from "./pages/UploadBook";
import NotFound from "./pages/NotFound";

import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Navigate to="/" />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/uploadbook" element={<UploadBook />} />
        <Route path="/404-not-found" element={<NotFound />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
