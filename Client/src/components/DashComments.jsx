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
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const searchInput = useRef(null);

  const fetchComments = async (page = 1, pageSize = 10) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/comments?startIndex=${
          (page - 1) * pageSize
        }&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      setComments(response.data.comments);
      setTotal(response.data.totalComments); // Assuming API returns total count of comments
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchComments(current, pageSize);
  }, [current, pageSize]);

  const showDeleteConfirm = (commentId) => {
    confirm({
      centered: "true",
      title: "Do you want to delete this comment?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone!",
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
            fetchComments(current, pageSize); // Refetch comments after delete
          })
          .catch((error) => {
            toast.error("Fail to delete:", error);
          });
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

  const handleTableChange = (pagination) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Table
        dataSource={comments}
        rowKey="id"
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      >
        <Column
          title="Comment ID"
          dataIndex="id"
          key="id"
          {...getColumnSearchProps("id")}
        />
        <Column
          title="Comments"
          dataIndex="content"
          key="content"
          {...getColumnSearchProps("content")}
        />
        <Column title="ID User" dataIndex="userId" key="userId" />
        <Column
          title="Likes"
          dataIndex="numberOfLikes"
          key="numberOfLikes"
          sorter={(a, b) => a.numberOfLikes - b.numberOfLikes}
        />
        <Column
          title="Time"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(text) => moment(text).format("DD/MM/YYYY HH:mm:ss")}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <Button
                type="primary"
                onClick={() => showDeleteConfirm(record.id)}
              >
                Delete
              </Button>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};
