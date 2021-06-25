/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import "./index.css";
import Header from "../Header";
import FormComponent from "../FormComponent";

// const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

export default (props) => {
  return (
    <>
      <Header />
      <div className="sp-to-yt">
        <FormComponent mode="sp2yt" />
      </div>
    </>
  );
};
