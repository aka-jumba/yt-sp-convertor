/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import "./index.css";
import Header from "../Header";
import FormComponent from "../FormComponent";
import { Spinner } from "react-bootstrap";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

const loginURL = `${API_URL}/api/spotify-login`;
const convertURL = `${API_URL}/api/yt-sp/playlist`;

const fetchSpotifyAuthToken = async () => {
  try {
    const response = await axios.get(loginURL);
    return response;
  } catch (err) {
    throw err;
  }
};

const convertPlaylist = async (playlistId, playlist_name, token) => {
  try {
    const response = await axios.post(convertURL, {
      playlistId,
      playlist_name,
      auth_token: token,
      status: "public",
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export default (props) => {
  const [hitConvert, setHitConvert] = useState(true);
  const [isLoaded, setIsLoaded] = useState(true);

  const onConvert = async (id, name) => {
    console.log(id, name);
    let loginResponse;
    try {
      let spotifyAccessToken = localStorage.getItem("spotify-access-token");
      console.log(`Fetched from localstorage`, spotifyAccessToken);
      if (!spotifyAccessToken) {
        loginResponse = await fetchSpotifyAuthToken();
        console.log(loginResponse);

        const { data } = loginResponse;
        const { auth_url } = data;
        if (auth_url) {
          console.log(`Opening ${auth_url} in new tab!`);
          window.open(auth_url, "_blank");
        }
        const { auth_token } = data;
        console.log(auth_token);
        const { access_token } = auth_token;
        spotifyAccessToken = access_token;
      }

      const response = await convertPlaylist(
        id,
        name,
        spotifyAccessToken,
        "public"
      );
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  const renderResults = () => {
    return (
      <div className="container-div">
        <div className="bubble">
          {isLoaded && (
            <div className="loader">
              <Spinner
                animation="grow"
                role="status"
                style={{ marginRight: "1rem" }}
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
        <FormComponent mode="yt2sp" onConvert={onConvert} />
      </div>
      {hitConvert && renderResults()}
    </>
  );
};

// playlist_id, playlist_name, link
// mapped_songs: [{artist, popularity, uri, yt link, yt video owner}]
// unmapped_songs: []
