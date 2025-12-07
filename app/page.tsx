"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Gallery } from "./components/gallery";
import { Testimonials } from "./components/testimonials";
import { Team } from "./components/Team";
import { Contact } from "./components/contact";
import "./globals.css";

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/content");
        const data = await response.json();
        setLandingPageData(data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    import("smooth-scroll").then((SmoothScroll) => {
      new SmoothScroll.default('a[href*="#"]', {
        speed: 1000,
        speedAsDuration: true,
      });
    });
  }, []);

  if (!landingPageData) {
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );
    }

  return (
    <div>
      <Navigation />
      <Header data={landingPageData?.Header} />
      <Features data={landingPageData?.Features} />
      <About data={landingPageData?.About} />
      <Services data={landingPageData?.Services} />
      <Gallery data={landingPageData?.Gallery} />
      <Testimonials data={landingPageData?.Testimonials} />
      <Team data={landingPageData?.Team} />
      <Contact data={{}} />
    </div>
  );
};

export default App;
