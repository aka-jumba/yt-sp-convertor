import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="header">
        <div className="bubble">
          <h1>Spotify Youtube App</h1>
        </div>
      </div>
      <div className="yt-to-sp mt-4">
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
      <div className="sp-to-yt">
        <div className="bubble p-4 d-flex justify-content-start">
          <form>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">
                Spotify Link
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
                Youtube Playlist name
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
    </div>
  );
}

export default App;
