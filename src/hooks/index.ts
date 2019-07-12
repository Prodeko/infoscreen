import { useState, useEffect } from "react";

export const useFetch = (url, fetchInterval) => {
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

    if (fetchInterval !== 0) {
      var interval = setInterval(() => fetchData(), fetchInterval);
    }
    fetchData();
    return () => {
      clearInterval(interval);
    };
  }, []);

  return data;
};
