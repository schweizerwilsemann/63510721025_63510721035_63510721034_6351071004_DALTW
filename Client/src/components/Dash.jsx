import React from "react";
import { UsersChart } from "./UsersChart";
import BooksChart from "./BooksChart";
import BooksSoldChart from "./BooksSoldChart";
import { CommentsChart } from "./CommentsChart";
import HotBooksPieChart from "./HotBooksPieChart";
import DashboardComponent from "./DashboardComponent";

export const Dash = () => {
  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen overflow-auto">
        <DashboardComponent />
        <div className="w-full max-w-4xl p-4">
          <h2 className="text-xl font-bold mb-4">Users Chart</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <UsersChart />
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl p-4">
          <h2 className="text-xl font-bold mb-4">Books Chart</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <BooksChart />
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl p-4">
          <h2 className="text-xl font-bold mb-4">Books Sold Chart</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <BooksSoldChart />
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl p-4">
          <h2 className="text-xl font-bold mb-4">Comments Chart</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <CommentsChart />
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl p-4">
          <h2 className="text-xl font-bold mb-4">Hot Books Pie Chart</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <HotBooksPieChart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
