import React, { useRef, useEffect, useState } from "react";
import { Space, Table, Tag, Avatar, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import axios from "axios";
import dayjs from "dayjs";
const { Column } = Table;

export const DashPendingBooks = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useRef(null);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`/api/booksold/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBooks(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const approveBook = async (id) => {
    try {
      await axios.put(
        `/api/booksold/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchBooks();
    } catch (error) {
      setError(error.message);
    }
  };

  const rejectBook = async (id) => {
    try {
      await axios.put(
        `/api/booksold/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchBooks();
    } catch (error) {
      setError(error.message);
    }
  };

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
    onFilterDropdownVisibleChange: (visible) => {
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
      <Table dataSource={books} style={{ width: "100%" }}>
        <Column
          title="Time Stamp"
          dataIndex="createdAt"
          key="createdAt"
          render={(createdAt) => {
            const dateObj = new Date(createdAt);
            const formattedDate = dayjs(dateObj).format(`DD/MM/YYYY HH:mm:ss`);
            return formattedDate;
          }}
          style={columnStyle}
        />
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
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <Button onClick={() => approveBook(record.id)}>Approve</Button>
              <Button onClick={() => rejectBook(record.id)}>Reject</Button>
            </Space>
          )}
          style={columnStyle}
        />
      </Table>
    </div>
  );
};
