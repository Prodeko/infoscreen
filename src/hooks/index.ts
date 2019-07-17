import { useState, useEffect } from 'react';
import moment from 'moment';

const { FETCH_TIME_INTERVAL } = require('../../config');
const { SLIDE_FETCH_INTERVAL } = require('../../config');

export const useFetch = (url, fetchInterval = 0) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      fetch(url, {
        headers: {
          accepts: 'application/json',
        },
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
  const serverTime = useFetch('/time', FETCH_TIME_INTERVAL);

  useEffect(() => {
    const sTime = moment(serverTime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss');
    setTime(sTime);
    let timeout = setInterval(() => {
      setTime(t =>
        moment(t, 'HH:mm:ss')
          .add(1, 'seconds')
          .format('HH:mm:ss'),
      );
    }, 1000);
    return () => {
      clearInterval(timeout);
    };
  }, [serverTime]);

  return time;
};

export const getRestaurantData = () => {
  const [data, setData] = useState([]);

  const restaurants = [
    { id: 2, name: 'T-talo' },
    { id: 3, name: 'Täffä' },
    { id: 7, name: 'TUAS' },
    { id: 52, name: 'A Bloc' },
  ];
  const date = moment().format('YYYY-MM-DD');

  useEffect(() => {
    function fetchData(url) {
      return fetch(url, {
        headers: {
          accepts: 'application/json',
        },
      });
    }

    let promises = [];

    restaurants.forEach(r =>
      promises.push(fetchData(`/restaurants/${r.id}/menu?day=${date}`)),
    );

    Promise.all(promises)
      .then(results => Promise.all(results.map(r => r.json())))
      .then(data => setData(data));
  }, []);

  return data;
};

const defaultSlides = [
  {
    id: -1,
    title: '',
    description:
      "<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 100px;'>🌈🦄<div/>",
    highlight: false,
  },
];

export const getSlides = () => {
  const [slides, setSlides] = useState(defaultSlides);
  const data = useFetch('/slides', SLIDE_FETCH_INTERVAL);

  useEffect(() => {
    if (data && data.length > 0) {
      setSlides(data);
    } else {
      setSlides(defaultSlides);
    }
  }, [data]);

  return slides;
};
