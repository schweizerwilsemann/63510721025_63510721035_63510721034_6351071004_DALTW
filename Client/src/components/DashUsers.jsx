import React, { useRef, useEffect, useState } from "react";
import { Space, Table, Tag, Avatar, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import axios from "axios";

const { Column } = Table;

export const DashUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useRef(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deactivateUser = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/delete/${id}`
      );
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const activateUser = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/activate/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchUsers();
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
      <Table dataSource={users} rowKey="id" style={{ width: "100%" }}>
        <Column
          title="Avatar"
          dataIndex="photoURL"
          key="photoURL"
          render={(photoURL) => <Avatar src={photoURL} />}
          style={columnStyle}
        />
        <Column title="ID" dataIndex="id" key="id" style={columnStyle} />
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
          title="Activate"
          dataIndex="isActive"
          key="isActive"
          render={(isActive) => (isActive ? "✅" : "")}
          style={columnStyle}
        />
        <Column
          title="Admin"
          dataIndex="isAdmin"
          key="isAdmin"
          render={(isAdmin) => (isAdmin ? "✅" : "")}
          style={columnStyle}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <Button onClick={() => activateUser(record.id)}>Activate</Button>
              <Button type="primary" onClick={() => deactivateUser(record.id)}>
                Deactivate
              </Button>
            </Space>
          )}
          style={columnStyle}
        />
      </Table>
    </div>
  );
};
