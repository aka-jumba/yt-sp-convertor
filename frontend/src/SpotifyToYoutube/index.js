/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import "./index.css";
import Header from "../Header";
import FormComponent from "../FormComponent";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
const loginURL = `${API_URL}/api/spotify-login`;
const convertURL = `${API_URL}/api/sp-yt/playlist`;
const youtubeLoginURL = `${API_URL}/api/youtube-login`;

const fetchSpotifyAuthToken = async () => {
    try {
        return await axios.get(loginURL);
    } catch (err) {
        console.log(err)
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
}

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

const convertPlaylist = async (playlistId, playlist_name, token) => {
    try {
        const response = await axios.post(convertURL, {
            playlistId,
            playlist_name,
            auth_token: token,
        });
        return response;
    } catch (err) {
        throw err;
    }
};

const onConvert = async (id, name) => {

    try {
        const res_yt = await handleLogin();
        console.log(res_yt);

        let spotifyAccessToken = localStorage.getItem("spotify-access-token");
        console.log(`Fetched from localstorage`, spotifyAccessToken);
        if (!spotifyAccessToken) {
            spotifyAccessToken = await getSpotifyAuthToken();
        }
        if (spotifyAccessToken === null) {
            return window.alert("Account verified! Please press Convert again!");
        }
        const response = await convertPlaylist(
            id,
            name,
            spotifyAccessToken,
        );
    console.log(response);
    } catch (err) {
        console.error(err);
    }

}

export default () => {

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
    </>
  );
};
