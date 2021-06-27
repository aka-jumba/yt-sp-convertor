import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { v4 as uuid } from "uuid";

console.log(process.env);

let ytId = localStorage.getItem("yt-token");
if (!ytId) {
  localStorage.setItem("yt-token", uuid().toString());
}
ytId = localStorage.getItem("yt-token");
console.log("Set unique user ID", ytId);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
