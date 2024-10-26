import React, { useRef, useEffect, useState } from "react";
import { Space, Table, Input, Button, Modal } from "antd";
import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";

const { Column } = Table;
const { confirm } = Modal;

export const DashComments = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useRef(null);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      setComments(response.data.comments);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const showDeleteConfirm = (commentId, fetchComments) => {
    confirm({
      centered: "true",
      title: "Do you want to delete this comment?",
      icon: <ExclamationCircleOutlined />,
      content: "This action can not be undo!",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        axios
          .delete(
            `${import.meta.env.VITE_API_BASE_URL}/api/comments/${commentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(() => {
            fetchComments();
          })
          .catch((error) => {
            toast.error("Fail to delete:", error);
          });
      },
      onCancel() {},
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

  return (
    <div style={tableStyle}>
      <Table dataSource={comments} rowKey="id" style={{ width: "100%" }}>
        <Column
          title="Comment ID"
          dataIndex="id"
          key="id"
          style={columnStyle}
          {...getColumnSearchProps("id")}
        />
        <Column
          title="Comments"
          dataIndex="content"
          key="content"
          style={columnStyle}
          {...getColumnSearchProps("content")}
        />
        <Column
          title="ID User"
          dataIndex="userId"
          key="userId"
          style={columnStyle}
        />
        <Column
          title="Likes"
          dataIndex="numberOfLikes"
          key="numberOfLikes"
          style={columnStyle}
          sorter={(a, b) => a.numberOfLikes - b.numberOfLikes}
        />
        <Column
          title="Time"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(text) => moment(text).format("DD/MM/YYYY HH:mm:ss")}
          style={columnStyle}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <Button
                type="primary"
                onClick={() => showDeleteConfirm(record.id, fetchComments)}
              >
                Delete
              </Button>
            </Space>
          )}
          style={columnStyle}
        />
      </Table>
    </div>
  );
};
