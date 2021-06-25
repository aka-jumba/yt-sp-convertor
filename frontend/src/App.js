import "./App.css";
import SpotifyToYoutube from "./SpotifyToYoutube/";
import YoutubeToSpotify from "./YoutubeToSpotify/";
import { Switch, Route, Redirect, BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to={{ pathname: "/sp2yt" }} />
        </Route>
        <Route path="/sp2yt">
          <SpotifyToYoutube />
        </Route>
        <Route path="/yt2sp">
          <YoutubeToSpotify />
        </Route>
        <Route render={() => <Redirect to="/" />} />
      </Switch>
    </Router>
  );
}

export default App;
