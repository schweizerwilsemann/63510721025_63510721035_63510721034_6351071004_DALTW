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
import "tailwindcss/tailwind.css";

const BooksChart = () => {
  const [data, setData] = useState([]);

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
        }));

        const groupedData = formattedData.reduce((acc, book) => {
          const genre = book.genre;
          if (!acc[genre]) {
            acc[genre] = 0;
          }
          acc[genre]++;
          return acc;
        }, {});

        const chartData = Object.keys(groupedData).map((genre) => ({
          genre,
          count: groupedData[genre],
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen p-4">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart
          width={"100%"}
          height={"100%"}
          data={data}
          className="w-full h-full"
        >
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
    </div>
  );
};

export default BooksChart;
