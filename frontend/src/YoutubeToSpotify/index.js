/* eslint-disable import/no-anonymous-default-export */
import React from "react";

export default (props) => {
  return (
    <div className="yt-to-sp">
      <div className="bubble p-4 d-flex justify-content-start">
        <form>
          <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">
              Youtube Link
            </label>
            <input
              type="email"
              class="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
            />
          </div>
          <div class="mb-3">
            <label for="exampleInputPassword1" class="form-label">
              Spotify Playlist name
            </label>
            <input
              type="password"
              class="form-control"
              id="exampleInputPassword1"
            />
          </div>
          <button type="submit" class="btn btn-primary">
            Convert
          </button>
        </form>
      </div>
    </div>
  );
};
