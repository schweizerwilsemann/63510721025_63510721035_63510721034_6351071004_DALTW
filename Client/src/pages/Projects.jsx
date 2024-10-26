import React from "react";
import { Link } from "react-router-dom";

export default function Projects() {
  const frontendTechnologies = [
    "React",
    "Vite",
    "Redux Toolkit",
    "Tailwind CSS",
    "Axios",
    "React Router",
    "Firebase",
    "Ant Design",
    "Flowbite",
    "PDF.js",
    "Recharts",
    "React Toastify",
  ];

  const backendTechnologies = [
    ".NET Core",
    "Entity Framework Core",
    "MongoDB",
    "JWT Authentication",
    "AutoMapper",
    "BCrypt.Net",
    "Swagger (OpenAPI)",
  ];

  return (
    <>
      <header
        className="relative text-center bg-cover bg-fixed overflow-hidden w-full h-[600px] flex flex-col justify-center items-center text-white"
        style={{
          backgroundImage:
            "url('http://www.autodatz.com/wp-content/uploads/2017/05/Old-Car-Wallpapers-Hd-36-with-Old-Car-Wallpapers-Hd.jpg')",
          clipPath: "ellipse(80% 70% at 50% 10%)", // Điều chỉnh clipPath để phần cong hướng lên
        }}
      >
        <div className="w-full h-full p-12 bg-gradient-to-br from-[#9f05ff69] to-[#fd5e086b] flex flex-col justify-center items-center">
          <h1 className="font-[Dancing Script] text-[80px] mb-6">My Project</h1>
          <h3 className="font-[Open Sans] text-lg mb-6 text-center max-w-2xl">
            This page showcases the technologies I have used to build my
            project. It covers both frontend and backend, each optimized to
            deliver the best experience and performance.
          </h3>
          <p className="font-[Open Sans] text-md mb-6 text-center max-w-2xl">
            Visit our github for more
          </p>
          <button className="border-none outline-none px-6 py-2 rounded-full text-gray-800 bg-white shadow-md hover:shadow-lg">
            <Link to="https://github.com/schweizerwilsemann/books-webapplication">
              Github
            </Link>
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center bg-gray-100 py-10 px-5 min-h-screen">
        {/* Frontend Section */}
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg mb-8 p-6">
          <h2 className="text-3xl font-semibold text-blue-500 mb-4">
            Frontend Technologies
          </h2>
          <p className="text-gray-700 mb-4">
            Below are the frontend technologies I used to build an interactive
            and modern user interface.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {frontendTechnologies.map((tech) => (
              <div
                key={tech}
                className="flex items-center bg-blue-50 rounded-lg p-3"
              >
                <span className="text-blue-600 font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Section */}
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg mb-8 p-6">
          <h2 className="text-3xl font-semibold text-green-500 mb-4">
            Backend Technologies
          </h2>
          <p className="text-gray-700 mb-4">
            Below are the backend technologies I used to manage data and server
            operations, ensuring performance and security.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {backendTechnologies.map((tech) => (
              <div
                key={tech}
                className="flex items-center bg-green-50 rounded-lg p-3"
              >
                <span className="text-green-600 font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
