import React from 'react';
import styled from 'styled-components';
import Layout from '../layouts/layout';
import Slides from '../components/slides';
import Sidebar from '../components/sidebar';
import '../assets/global.less';

const SlidesContainer = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;
`;

export default () => {
  return (
    <Layout>
      <Sidebar />
      <SlidesContainer>
        <Slides />
      </SlidesContainer>
    </Layout>
  );
};
