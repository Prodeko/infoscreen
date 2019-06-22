import { createContext } from "react";
import Slide from "../components/slide";

const slides = [
  () => <Slide title={"Testi"} highlight={true} />,
  () => <Slide title={"Testi2"} />,
  () => <Slide title={"Testi3"} />
];

export const initialState = {
  slides
};

const AppContext = createContext(initialState);

export default AppContext;
