/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import "./index.css";
import Header from "../Header";
import FormComponent from "../FormComponent";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { currentDev, cycleDev } from "../swapYtDev";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
const loginURL = `${API_URL}/api/spotify-login`;
const convertURL = `${API_URL}/api/sp-yt/playlist`;
const youtubeLoginURL = `${API_URL}/api/youtube-login`;

const fetchSpotifyAuthToken = async () => {
  try {
    return await axios.get(loginURL);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getSpotifyAuthToken = async () => {
  let loginResponse = await fetchSpotifyAuthToken();
  const { data } = loginResponse;
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
  console.log(access_token);
  return access_token;
};

const handleLogin = () => {
  let url = `${youtubeLoginURL}`;
  let uniqueId = localStorage.getItem("yt-token");
  let ytDev = currentDev();
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, {
        params: { id: ytDev, username: uniqueId },
      });
      console.log(`Youtube login success`, response);
      resolve(response);
    } catch (err) {
      console.error(`Youtube-login`, err);
      if (err.response) {
        const {
          response: { status },
        } = err;
        if (status === 501) {
          window.open(`${url}/?id=${ytDev}&username=${uniqueId}`, "_blank");
        } else if (status === 502) {
          cycleDev();
          window.alert("Please try again!");
        }
      }
      return reject(err);
    }
  });
};

const convertPlaylist = async (playlistId, playlist_name, token) => {
  let username = localStorage.getItem("yt-token");
  try {
    const response = await axios.post(convertURL, {
      playlistId,
      playlist_name,
      auth_token: token,
      username,
    });
    return response.data.data;
  } catch (err) {
    throw err;
  }
};

export default () => {
  const [hitConvert, setHitConvert] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [plData, setPlData] = useState({});

  const onConvert = async (id, name) => {
    try {
      const res_yt = await handleLogin();
      console.log(res_yt);
      setHitConvert(true);
      let spotifyAccessToken = localStorage.getItem("spotify-access-token");
      console.log(`Fetched from localstorage`, spotifyAccessToken);
      if (!spotifyAccessToken) {
        spotifyAccessToken = await getSpotifyAuthToken();
      }
      if (spotifyAccessToken === null) {
        return window.alert("Account verified! Please press Convert again!");
      }
      setIsLoaded(false);
      const response = await convertPlaylist(id, name, spotifyAccessToken);
      console.log(response);
      setIsLoaded(true);
      setPlData(response);
    } catch (err) {
      setIsLoaded(true);
      console.error(err);
    }
  };

  const renderResults = () => {
    return (
      <div className="container-div">
        <div className="bubble">
          {!isLoaded && (
            <div className="loader">
              <Spinner
                animation="grow"
                role="status"
                style={{ marginRight: "1rem" }}
              ></Spinner>
              <span>Loading</span>
            </div>
          )}
          <div>{JSON.stringify(plData)}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="sp-to-yt">
        <FormComponent
          mode="sp2yt"
          getAuthToken={getSpotifyAuthToken}
          onConvert={onConvert}
        />
      </div>
      {hitConvert && renderResults()}
    </>
  );
};
