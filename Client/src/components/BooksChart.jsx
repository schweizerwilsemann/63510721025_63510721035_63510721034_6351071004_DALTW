import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import { Button } from "antd";

const BooksChart = () => {
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]); // To store raw data for Excel export

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/books", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const formattedData = response.data.map((book) => ({
          genre: book.genre,
          count: 1,
          title: book.title,
          author: book.author,
          createdAt: moment(book.createdAt).format("YYYY-MM-DD"),
          username: book.username,
        }));

        // Grouping the data by genre for the chart
        const groupedData = formattedData.reduce((acc, book) => {
          const genre = book.genre;
          if (!acc[genre]) {
            acc[genre] = { count: 0, books: [] };
          }
          acc[genre].count++;
          acc[genre].books.push({
            title: book.title,
            author: book.author,
            createdAt: book.createdAt,
            username: book.username,
          });
          return acc;
        }, {});

        const chartData = Object.keys(groupedData).map((genre) => ({
          genre,
          count: groupedData[genre].count,
        }));

        setData(chartData);
        setRawData(groupedData); // Store raw grouped data for export
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Export function to export grouped data into Excel
  const exportToExcel = () => {
    const rows = [];

    Object.keys(rawData).forEach((genre) => {
      rawData[genre].books.forEach((book) => {
        rows.push({
          Genre: genre,
          Title: book.title,
          Author: book.author,
          "Upload Date": book.createdAt,
          "Uploaded By": book.username,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Books Data");

    // Exporting the Excel file
    XLSX.writeFile(workbook, "books_data.xlsx");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen p-4">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={data} className="w-full h-full">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="genre" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="count"
            name="Number of Books by Genres"
            fill="#8884d8"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Export Button */}
      <Button
        className="bg-orange-400 text-white mt-4"
        style={{ width: "20rem", height: "45px", fontSize: "16px" }}
        onClick={exportToExcel}
      >
        Export to Excel
      </Button>
    </div>
  );
};

export default BooksChart;
