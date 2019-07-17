import { useState, useEffect } from 'react';
import moment from 'moment';

const { FETCH_TIME_INTERVAL, SLIDE_FETCH_INTERVAL } = require('../../config');

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

const getGifSlides = () => {
  const [gifs, setGifs] = useState(null);
  const data = useFetch('gifs');

  useEffect(() => {
    if (data) {
      const gifs = transformGifsToSlides(data.data);
      setGifs(gifs);
    }
  }, [data]);

  return gifs;
};

function transformGifsToSlides(gifs) {
  const ret = gifs.reduce((acc, obj) => {
    const slide = {
      id: obj.id,
      title: '',
      description: `<iframe src="${obj.embed_url}" style="display: block; width: 70%; height: 100%; margin: 0 auto;" frameBorder="0" />`,
      highlight: false,
    };
    acc.push(slide);
    return acc;
  }, []);
  return ret;
}

export const getSlides = () => {
  const [slides, setSlides] = useState(defaultSlides);
  const data = useFetch('/slides', SLIDE_FETCH_INTERVAL);
  const gifSlides = getGifSlides();

  useEffect(() => {
    let slides = [];
    if (data && data.length > 0) {
      slides = slides.concat(data);
    }
    if (gifSlides && gifSlides.length > 0) {
      slides = slides.concat(gifSlides);
    }

    if (slides.length > 0) {
      setSlides(slides);
    }
  }, [data, gifSlides]);

  return slides;
};
