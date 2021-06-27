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
const youtubeLoginURL = `${API_URL}/api/youtube-login`;

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

const handleLogin = () => {
  let url = `${youtubeLoginURL}/1`;
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url);
      console.log(`Youtube login success`, response);
      resolve(response);
    } catch (err) {
      console.error(err);
      window.open(url, "_blank");
      return reject(err);
      // reject(err);
    }
  });
};

export default (props) => {
  const [hitConvert, setHitConvert] = useState(true);
  const [isLoaded, setIsLoaded] = useState(true);

  const getSpotifyAccessToken = async () => {
    let loginResponse = await fetchSpotifyAuthToken();
    console.log(loginResponse);
    const { data } = loginResponse;
    console.log("Data received", data);
    const { auth_url } = data;
    if (auth_url) {
      console.log(`Opening ${auth_url} in new tab!`);
      window.open(auth_url, "_blank");
      return null;
      // this flow finishes here
    }
    // it reaches here if auth_url is not present in data
    // which means it is logged in!
    const { auth_token } = data;
    console.log(auth_token);
    const { access_token } = auth_token;
    return access_token;
  };

  const onConvert = async (id, name, isPrivate = false) => {
    console.log(id, name);
    try {
      // fetch playlist details
      if (isPrivate) {
        const res_yt = await handleLogin();
        console.log(res_yt);
      }
      //
      console.log("Yaha tak aa gaya bhaiya!");
      let spotifyAccessToken = localStorage.getItem("spotify-access-token");
      console.log(`Fetched from localstorage`, spotifyAccessToken);
      if (!spotifyAccessToken) {
        spotifyAccessToken = await getSpotifyAccessToken();
      }
      if (spotifyAccessToken === null) {
        return window.alert("Account verified! Please press Convert again!");
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
        <FormComponent
          mode="yt2sp"
          onConvert={onConvert}
          handleGoogleLogin={handleLogin}
          getAuthToken={{}}
        />
      </div>
      {hitConvert && renderResults()}
    </>
  );
};

// playlist_id, playlist_name, link
// mapped_songs: [{artist, popularity, uri, yt link, yt video owner}]
// unmapped_songs: []
