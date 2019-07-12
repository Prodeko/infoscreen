import React from "react";
import styled from "styled-components";
import Layout from "../layouts/layout";
import Slides from "../components/Slides";
import Sidebar from "../components/sidebar";
import { DotLoader } from "../components/loading";
import { useFetch } from "../hooks";
import "../assets/global.less";

const SLIDE_FETCH_INTERVAL = 300000;

const SlidesContainer = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;
`;

export default () => {
  const slides = useFetch("/slides/", SLIDE_FETCH_INTERVAL);

  return (
    <Layout>
      <Sidebar />
      <SlidesContainer>
        {slides && slides.length > 0 ? (
          <Slides slides={slides} />
        ) : (
          <DotLoader />
        )}
      </SlidesContainer>
    </Layout>
  );
};
