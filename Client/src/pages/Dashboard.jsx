import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashProfile from "../components/DashProfile";
import DashSidebar from "../components/DashSidebar";

export const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const URLParams = new URLSearchParams(location.search);
    const tabFromURL = URLParams.get("tab");
    if (tabFromURL) {
      setTab(tabFromURL);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-56">
        <DashSidebar />
      </div>
      {/* profile, .... */}
      {tab === "profile" && <DashProfile />}
    </div>
  );
};
