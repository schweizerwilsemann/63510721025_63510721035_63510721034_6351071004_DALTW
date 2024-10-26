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
import "tailwindcss/tailwind.css";

export const CommentsChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/comments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formattedData = response.data.comments.map((comment) => ({
          date: moment(comment.updatedAt).format("YYYY-MM-DD HH:mm"),
        }));

        const groupedData = formattedData.reduce((acc, comment) => {
          const date = comment.date;
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date]++;
          return acc;
        }, {});

        const chartData = Object.keys(groupedData)
          .map((date) => ({
            date,
            count: groupedData[date],
          }))
          .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

        setData(chartData);

        // Thiết lập giá trị mặc định cho startDate và endDate
        if (chartData.length > 0) {
          setStartDate(moment(chartData[0].date).toDate());
          setEndDate(moment(chartData[chartData.length - 1].date).toDate());
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
      <ResponsiveContainer>
        <LineChart
          width={1000}
          height={500}
          data={filteredData}
          className="w-full h-full"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Number of Comments"
            stroke="#8884d8"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
