import React, { useRef, useEffect, useState } from "react";
import { Space, Table, Modal, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import axios from "axios";
import ModalUpdateBook from "./ModalUpdateBook";
import { toast } from "react-toastify";

const { Column } = Table;

export const DashBooks = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const searchInput = useRef(null);
  const { confirm } = Modal;

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/books`
      );
      setBooks(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [isUpdateModalOpen]);
  useEffect(() => {
    fetchBooks();
  }, [isDeleteModalOpen]);

  const deleteBook = async (id) => {
    try {
      setIsDeleteModalOpen(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/books/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        setIsDeleteModalOpen(false);
        toast.success("Book deleted successfully!");
      }
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Do you want to delete this book?",
      content: "This action can not be undo.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk() {
        deleteBook(id);
      },
      onCancel() {
        toast.success("Cancel deletion");
      },
    });
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

  const openUpdateModal = (book) => {
    setSelectedBook(book);
    setIsUpdateModalOpen(true);
  };

  return (
    <div style={tableStyle}>
      <Table dataSource={books} rowKey="id" style={{ width: "100%" }}>
        <Column title="ID" dataIndex="id" key="id" style={columnStyle} />
        <Column
          title="Title"
          dataIndex="title"
          key="title"
          style={columnStyle}
          {...getColumnSearchProps("title")}
        />
        <Column
          title="Author"
          dataIndex="author"
          key="author"
          style={columnStyle}
          {...getColumnSearchProps("author")}
        />
        <Column
          title="Genre"
          dataIndex="genre"
          key="genre"
          style={columnStyle}
          {...getColumnSearchProps("author")}
        />
        <Column
          title="Published Year"
          dataIndex="publishedYear"
          key="publishedYear"
          style={columnStyle}
          {...getColumnSearchProps("publishedYear")}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <Button onClick={() => openUpdateModal(record)}>Update</Button>
              <Button
                type="primary"
                shape="round"
                onClick={() => showDeleteConfirm(record.id)}
              >
                Delete
              </Button>
            </Space>
          )}
          style={columnStyle}
        />
      </Table>
      {isUpdateModalOpen && (
        <ModalUpdateBook
          open={isUpdateModalOpen} // Ensure this is correct
          onCancel={() => {
            setIsUpdateModalOpen(false);
          }} // Handle modal close
          onUpdate={() => {
            setIsUpdateModalOpen(false); // Close modal after update
          }}
          book={selectedBook} // Make sure to pass the selected book
        />
      )}
    </div>
  );
};
