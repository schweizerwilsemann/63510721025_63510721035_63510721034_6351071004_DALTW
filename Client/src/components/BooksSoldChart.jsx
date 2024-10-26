import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { Button } from "antd";

const BooksSoldChart = () => {
  const [data, setData] = useState([]); // Data đã qua filter
  const [originalData, setOriginalData] = useState([]); // Dữ liệu gốc
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/booksold`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formattedData = response.data.map((book) => ({
          title: book.title,
          author: book.username,
          email: book.email,
          createdAt: moment(book.createdAt).format("YYYY-MM-DD HH:mm"),
          status: book.status,
          genre: book.genre,
          price: book.price,
        }));

        setOriginalData(formattedData); // Lưu dữ liệu gốc vào state

        const filteredData = formattedData.filter((book) => {
          const bookDate = moment(book.createdAt).toDate();
          return (
            (!startDate || bookDate >= startDate) &&
            (!endDate || bookDate <= endDate)
          );
        });

        const groupedData = filteredData.reduce((acc, book) => {
          const date = book.createdAt;
          if (!acc[date]) {
            acc[date] = { Rejected: 0, Approved: 0, Pending: 0 };
          }
          acc[date][book.status]++;
          return acc;
        }, {});

        const chartData = Object.keys(groupedData)
          .map((date) => ({
            date,
            Rejected: groupedData[date].Rejected,
            Approved: groupedData[date].Approved,
            Pending: groupedData[date].Pending,
          }))
          .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

        setData(chartData);

        if (chartData.length > 0 && (!startDate || !endDate)) {
          setStartDate(moment(chartData[0].date).toDate());
          setEndDate(moment(chartData[chartData.length - 1].date).toDate());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const exportToExcel = () => {
    const filteredDataForExport = originalData.filter((book) => {
      const bookDate = moment(book.createdAt).toDate();
      return (
        (!startDate || bookDate >= startDate) &&
        (!endDate || bookDate <= endDate)
      );
    });

    const worksheet = XLSX.utils.json_to_sheet(
      filteredDataForExport.map(
        ({ title, author, email, createdAt, genre, price, status }) => ({
          Title: title,
          Author: author,
          Email: email,
          "Uploaded Date": createdAt,
          Genre: genre,
          Price: price,
          Status: status,
        })
      )
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books Data");

    XLSX.writeFile(workbook, "BooksData.xlsx");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen p-4">
      <div className="flex flex-wrap justify-center mb-4">
        <div className="flex items-center mb-2 md:mb-0 gap-4">
          <label className="mr-2">Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
          />
          <label className="mr-2">End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="Pp"
          />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          width={1000}
          height={500}
          data={data}
          className="w-full h-full"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Rejected" stroke="#ff0000" />
          <Line type="monotone" dataKey="Approved" stroke="#00ff00" />
          <Line type="monotone" dataKey="Pending" stroke="#0000ff" />
        </LineChart>
      </ResponsiveContainer>
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

export default BooksSoldChart;
