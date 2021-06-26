/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import DownArrow from "./assets/downloading_white_48dp.svg";

const extractSpotifyId = (url) => {
  let id = url;
  let regexPattern = new RegExp(".*/playlist/(.*)(?:\\?.*)?", "i");
  let match = id.match(regexPattern)[1];
  match = match.split("?")[0];
  return match;
};

const extractYoutubeId = (url) => {
  let id = url;
  let match = id.split('list=')[1];
  return match;
}

export default (props) => {
  const { mode = "sp2yt", onConvert = () => {} } = props;

  const [url, setUrl] = useState(
    mode === "sp2yt"
      ? "https://open.spotify.com/playlist/1Wr1URyL0fZcW10cHyxgpj"
      : "https://www.youtube.com/playlist?list=PLnA6ZM6GfCE0ezYy5YKrI7v6WZNkBP6rl"
  );
  const [name, setName] = useState("New Playlist");

  const onSubmit = async (e) => {
    e.preventDefault();
    let match = extractYoutubeId(url);
    console.log(`Extracted ID`, match);
    onConvert(match, name);
  };

  const isSp2yt = () => {
    return mode === "sp2yt";
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{
        padding: "3rem 4rem",
        backgroundColor: isSp2yt() ? "#1DB954" : "#f44336",
        borderRadius: ".5rem",
      }}
    >
      <Form
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={onSubmit}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Form.Group controlId="formBasicEmail" style={{ width: "75%" }}>
            <Form.Label style={{ fontSize: "1.5rem", fontWeight: "600" }}>
              {isSp2yt() ? "Spotify" : "Youtube"} Playlist Link
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Eg: https://open.spotify.com/playlist/1Wr1URyL0fZcW10cHyxgpj"
            />
          </Form.Group>
          <Form.Group>
            <div
              style={{
                margin: "3rem 4rem 2rem 4rem",
                transform: "rotate(-90deg)",
              }}
            >
              <img src={DownArrow} height="75" alt="Down Arrow" />
            </div>
          </Form.Group>
          <Form.Group controlId="formBasicEmail" style={{ width: "75%" }}>
            <Form.Label style={{ fontSize: "1.5rem", fontWeight: "600" }}>
              {isSp2yt() ? "Youtube" : "Spotify"} Playlist Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Eg: New Playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
        </div>
        <div>
          <Button className="mt-1" variant="light" type="submit">
            Convert
          </Button>
        </div>
      </Form>
    </div>
  );
};
