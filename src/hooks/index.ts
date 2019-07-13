import { useState, useEffect } from "react";
import moment from "moment";

// 10 minutes
const TIME_FETCH_INTERVAL = 600000;

export const useFetch = (url, fetchInterval = 0) => {
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

export const getTime = () => {
  const [time, setTime] = useState(null);
  const serverTime = useFetch("/time", TIME_FETCH_INTERVAL);

  useEffect(() => {
    const sTime = moment(serverTime, "YYYY-MM-DD HH:mm:ss").format("HH:mm:ss");
    setTime(sTime);
    let timeout = setInterval(() => {
      setTime(t =>
        moment(t, "HH:mm:ss")
          .add(1, "seconds")
          .format("HH:mm:ss")
      );
    }, 1000);
    return () => {
      clearInterval(timeout);
    };
  }, [serverTime]);

  return time;
};
