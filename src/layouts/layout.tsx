import Head from "../components/head";
import Header from "../components/header";
import styled from "styled-components";

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 220px);
  margin: 0 20px;
`;

export default ({ children }: LayoutProps) => (
  <>
    <Head />
    <Header />
    <ContentContainer>{children}</ContentContainer>
  </>
);

type LayoutProps = {
  children: JSX.Element[] | JSX.Element;
};
