/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import "./index.css";
import Header from "../Header";

export default (props) => {
  return (
    <>
      <Header />
      <div className="yt-to-sp">
        <div className="bubble p-4 d-flex justify-content-start">
          <form>
            <div className="mb-3">
              <label for="exampleInputEmail1" className="form-label">
                Youtube Link
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>
            <div className="mb-3">
              <label for="exampleInputPassword1" className="form-label">
                Spotify Playlist name
              </label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Convert
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
