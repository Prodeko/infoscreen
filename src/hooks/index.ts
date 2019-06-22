import { useState, useEffect } from "react";

export const useFetch = url => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      fetch(url, {
        headers: {
          accepts: "application/json"
        }
      })
        .then(res => {
          return res.json();
        })
        .then(json => {
          setData(json);
        });
    };
    fetchData();
  }, []);

  return data;
};
