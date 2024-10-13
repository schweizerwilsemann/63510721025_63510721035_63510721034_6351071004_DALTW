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
import { Button } from "antd";
import * as XLSX from "xlsx";

export const UsersChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const formattedData = response.data.map((user) => ({
          date: moment(user.createdAt).format("YYYY-MM-DD"),
          count: 1,
          username: user.username || "Unknown",
          email: user.email || "No email",
          createdAt: moment(user.createdAt).format("YYYY-MM-DD"),
        }));

        const groupedData = formattedData.reduce((acc, user) => {
          const date = user.date;
          if (!acc[date]) {
            acc[date] = { count: 0, users: [], emails: [], createdAts: [] };
          }
          acc[date].count++;
          acc[date].users.push(user.username);
          acc[date].emails.push(user.email);
          acc[date].createdAts.push(user.createdAt);
          return acc;
        }, {});

        const sortedData = Object.keys(groupedData)
          .map((date) => ({
            date,
            count: groupedData[date].count,
            users: groupedData[date].users.join(", "),
            emails: groupedData[date].emails.join(", "),
            createdAts: groupedData[date].createdAts.join(", "),
          }))
          .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

        setData(sortedData);

        if (sortedData.length > 0) {
          setStartDate(moment(sortedData[0].date).toDate());
          setEndDate(moment(sortedData[sortedData.length - 1].date).toDate());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const itemDate = moment(item.date);
    return (
      (!startDate || itemDate.isSameOrAfter(startDate)) &&
      (!endDate || itemDate.isSameOrBefore(endDate))
    );
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users Data");
    XLSX.writeFile(workbook, "UsersData.xlsx");
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Number of Users"
            stroke="#8884d8"
          />
        </LineChart>
      </ResponsiveContainer>
      <Button
        className="bg-orange-400 text-sky-50"
        style={{
          width: "20rem",
          height: "45px",
          fontSize: "16px",
        }}
        block
        type=""
        htmlType="submit"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFFF")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f97")}
        onClick={exportToExcel}
      >
        Export Excel
      </Button>
    </div>
  );
};
