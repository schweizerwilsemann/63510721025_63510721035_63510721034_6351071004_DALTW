// NotificationBadge.jsx
import React from "react";
import { Badge } from "antd";

const NotificationBadge = ({ count }) => {
  return <Badge count={count} overflowCount={99} offset={[15, -5]}></Badge>;
};

export default NotificationBadge;
