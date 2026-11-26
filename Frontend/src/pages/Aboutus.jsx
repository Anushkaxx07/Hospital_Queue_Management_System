import React from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import Departments from "../components/Departments";
import Footer from "../components/Footer";

const Aboutus = () => {
  return (
    <>
      <Hero
        title="Modern Patient Care & Smart Queue Architecture"
        imageUrl="/images/about.png"
      />
      <Biography imageUrl="/images/whoweare.png" />
      <Departments />
      <Footer />
    </>
  );
};

export default Aboutus;
