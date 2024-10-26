import React, { useRef, useEffect, useState } from "react";
import { Space, Table, Tag, Avatar, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import dayjs from "dayjs";
import axios from "axios";

const { Column } = Table;

export const DashBooksHistory = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useRef(null);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/booksold`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBooks(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          type=""
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const tableStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    overflowX: "auto",
  };

  const columnStyle = {
    minWidth: "150px",
  };

  return (
    <div style={tableStyle}>
      <Table dataSource={books} rowKey={`id`} style={{ width: "100%" }}>
        <Column
          title="Book's name"
          dataIndex="title"
          key="title"
          style={columnStyle}
          {...getColumnSearchProps("title")}
        />
        <Column
          title="Price-($)"
          dataIndex={`price`}
          key="price"
          style={columnStyle}
          sorter={(a, b) => a.price - b.price}
        />
        <Column
          title="Username"
          dataIndex="username"
          key="username"
          style={columnStyle}
          {...getColumnSearchProps("username")}
        />
        <Column
          title="Email"
          dataIndex="email"
          key="email"
          style={columnStyle}
          {...getColumnSearchProps("email")}
        />
        <Column
          title="Status"
          dataIndex="status"
          key="status"
          style={columnStyle}
          render={(status) => {
            let color;
            if (status === "Approved") {
              color = "rgb(9, 165, 77)";
            } else if (status === "Rejected") {
              color = "red"; // Màu đỏ
            } else {
              color = "rgb(51, 153, 255)"; // Màu đen cho các trạng thái khác
            }
            return (
              <span className="font-semibold" style={{ color }}>
                {status}
              </span>
            );
          }}
        />

        <Column
          title="Time Stamp"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(updatedAt) => {
            const dateObj = new Date(updatedAt);
            const formattedDate = dayjs(dateObj).format("DD/MM/YYYY HH:mm:ss");
            return formattedDate;
          }}
          style={columnStyle}
        />
      </Table>
    </div>
  );
};
