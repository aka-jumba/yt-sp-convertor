/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import "./index.css";
import Header from "../Header";
import FormComponent from "../FormComponent";
import { Spinner } from "react-bootstrap";

// const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

export default (props) => {
  const [hitConvert, setHitConvert] = useState(true);
  const [isLoaded, setIsLoaded] = useState(true);

  const renderResults = () => {
    return (
      <div className="container-div">
        <div className="bubble">
          {isLoaded && (
            <div className="loader">
              <Spinner
                animation="grow"
                role="status"
                style={{marginRight: '1rem'}}
              ></Spinner>
              <span>Loading</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="yt-to-sp">
        <FormComponent mode="yt2sp" />
      </div>
      {hitConvert && renderResults()}
    </>
  );
};

// playlist_id, playlist_name, link
// mapped_songs: [{artist, popularity, uri, yt link, yt video owner}]
// unmapped_songs: []
