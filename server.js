const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const root = __dirname;


const types = {

  ".html":
    "text/html; charset=utf-8",

  ".css":
    "text/css; charset=utf-8",

  ".js":
    "text/javascript; charset=utf-8",

  ".json":
    "application/json; charset=utf-8"

};


const server = http.createServer(
  (req, res) => {

    let requested =
      decodeURIComponent(
        req.url.split("?")[0]
      );


    /*
      Serve index.html
      when the user opens /
    */

    if (requested === "/") {

      requested = "/index.html";

    }


    const filePath =
      path.join(
        root,
        requested
      );


    /*
      Prevent path traversal.
    */

    if (
      !filePath.startsWith(root)
    ) {

      res.writeHead(403);

      return res.end(
        "Forbidden"
      );

    }


    fs.readFile(
      filePath,
      (error, data) => {

        if (error) {

          res.writeHead(
            404,
            {
              "Content-Type":
                "text/plain"
            }
          );

          return res.end(
            "Not found"
          );

        }


        res.writeHead(
          200,
          {
            "Content-Type":
              types[
                path.extname(filePath)
              ] ||
              "application/octet-stream"
          }
        );


        res.end(data);

      }
    );

  }
);


server.listen(
  PORT,
  () => {

    console.log(
      `PulseBoard running at http://localhost:${PORT}`
    );

  }
);