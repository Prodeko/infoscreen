import { useState, useEffect } from 'react';
import { useTransition, animated, config } from 'react-spring';
import styled from 'styled-components';
import { DotLoader } from '../components/loading';
import Slide from './slide';

const { SLIDE_CHANGE_INTERVAL } = require('../../config');

const SlideContainer = styled(animated.div)`
  position: absolute;
  height: 100%;
  width: 100%;
  margin-left: 0 20px;
`;

export default ({slides}) => {
  const [index, setIndex] = useState(0);

  const transitions = useTransition(slides[index], slide => slide.id, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.molasses,
  });

  useEffect(() => {
    const interval = setInterval(
      () => setIndex(state => (state + 1) % slides.length),
      SLIDE_CHANGE_INTERVAL,
    );
    return () => {
      clearInterval(interval);
    };
  }, [slides]);

  if (!slides) return <DotLoader />;

  return (
    <>
      {transitions.map(({ item, props, key }) => (
        <SlideContainer key={key} style={props}>
          <Slide
            title={item.title}
            highlight={item.highlight}
            description={item.description}
          />
        </SlideContainer>
      ))}
    </>
  );
};
