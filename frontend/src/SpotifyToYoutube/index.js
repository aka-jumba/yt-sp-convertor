/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import "./index.css";
import Header from "../Header";
import { Form, Button } from "react-bootstrap";
import DownArrow from "../assets/downloading_white_48dp.svg";

// const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

export default (props) => {
  const [url, setUrl] = useState(
    "https://open.spotify.com/playlist/1Wr1URyL0fZcW10cHyxgpj"
  );
  const [name, setName] = useState("New Playlist");

  const onConvert = async (e) => {
    e.preventDefault();
    console.log(url, name);
  };

  return (
    <>
      <Header />
      <div className="sp-to-yt">
        <div
          className="d-flex flex-column align-items-center"
          style={{ padding: "3rem 4rem", backgroundColor: "#1DB954", borderRadius: '.5rem' }}
        >
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
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
                  Spotify Playlist Link
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
                  Youtube Playlist Name
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
              <Button
                className="mt-1"
                variant="light"
                type="submit"
                onClick={onConvert}
              >
                Convert
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};
