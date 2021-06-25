import "./App.css";
import SpotifyToYoutube from "./SpotifyToYoutube/";
import YoutubeToSpotify from "./YoutubeToSpotify/";

function App() {
  return (
    <div className="App">
      <div className="header">
        <div className="bubble">
          <h1>Spotify Youtube App</h1>
        </div>
      </div>
      <div className="mt-4">
        <YoutubeToSpotify />
      </div>
      <div className="mt-4">
        <SpotifyToYoutube />
      </div>
    </div>
  );
}

export default App;
