import React, { useEffect, useState } from "react";
import { Space, Table, Tag, Avatar, Button } from "antd";
import axios from "axios";

const { Column } = Table;

export const DashUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      await axios.delete(`/api/users/delete/${id}`);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const activateUser = async (id) => {
    try {
      await axios.put(
        `/api/users/activate/${id}`,
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
      <Table dataSource={users} style={{ width: "100%" }}>
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
        />
        <Column
          title="Email"
          dataIndex="email"
          key="email"
          style={columnStyle}
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
              <Button onClick={() => deactivateUser(record.id)}>
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
