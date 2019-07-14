import React from "react";
import styled from "styled-components";
import Layout from "../layouts/layout";
import Slides from "../components/slides";
import Sidebar from "../components/sidebar";
import { DotLoader } from "../components/loading";
import { useFetch } from "../hooks";
import "../assets/global.less";

const { FETCH_SLIDES_INTERVAL } = require("../../config");

const SlidesContainer = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;
`;

export default () => {
  const slides = useFetch("/slides", FETCH_SLIDES_INTERVAL);

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
