import React from "react";
import { useState, useEffect } from "react";

export default function test() {
  const [test, setTest] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTestAPI = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/user`
        );
        const data = await res.text();

        if (res.ok) {
          setTest(data);
        }
      } catch (error) {
        setError(error);
      }
    };
    getTestAPI();
  }, []);
  return (
    <div>
      <h1>Result</h1>
      <p>{test}</p>
    </div>
  );
}
