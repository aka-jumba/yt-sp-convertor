/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import "./index.css";
import Header from "../Header";
import FormComponent from "../FormComponent";

// const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

export default (props) => {
  return (
    <>
      <Header />
      <div className="yt-to-sp">
        <FormComponent mode="yt2sp" />
      </div>
    </>
  );
};
