const polka = require("polka");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
var request = require("request");

const { API_URL, GIPHY_KEY } = require("./config");

app.prepare().then(() => {
  const server = polka();

  server.get("/restaurants/*", (req, res) => {
    var url = "https://kitchen.kanttiinit.fi" + req.url;
    req.pipe(request(url)).pipe(res);
  });

  server.get("/slides", (req, res) => {
    var url = `${API_URL}/slides/?format=json`;
    req.pipe(request(url)).pipe(res);
  });

  server.get("/gifs", (req, res) => {
    var url = `http://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&rating=g`;
    req.pipe(request(url)).pipe(res);
  });

  server.get("/time", (req, res) => {
    var url = `${API_URL}/time`;
    req.pipe(request(url)).pipe(res);
  });

  server.get("*", (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
