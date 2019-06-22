const polka = require("polka");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dir: "./src", dev });
const handle = app.getRequestHandler();
var request = require("request");

app.prepare().then(() => {
  const server = polka();

  server.get("/restaurants/*", (req, res) => {
    var url = "https://kitchen.kanttiinit.fi" + req.url;
    req.pipe(request(url)).pipe(res);
  });

  server.get("/slides", (req, res) => {
    var url = "http://localhost:8000/fi/infoscreen/api/slides/?format=json";
    req.pipe(request(url)).pipe(res);
  });

  server.get("*", (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
