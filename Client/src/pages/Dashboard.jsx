import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import DashProfile from "../components/DashProfile";
import DashSidebar from "../components/DashSidebar";
import { DashPendingBooks } from "../components/DashPendingBooks";
import { DashUsers } from "../components/DashUsers";
import { DashBooksHistory } from "../components/DashBooksHistory";
import { DashBookInProgress } from "../components/DashBookInProgress";
import DashUserBoughtBooks from "../components/DashUserBoughtBooks";

export const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
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
        <DashSidebar pendingCount={pendingCount} />
      </div>
      {/* profile, .... */}
      {tab === "profile" && <DashProfile />}
      {tab === "users" && <DashUsers />}
      {tab === "pending-books" && (
        <DashPendingBooks setPendingCount={setPendingCount} />
      )}
      {tab === "books-history" && <DashBooksHistory />}
      {tab === "books-in-progress" && <DashBookInProgress />}
      {tab === "user-bought-books" && <DashUserBoughtBooks />}
    </div>
  );
};
