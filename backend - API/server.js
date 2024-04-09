const http = require("http");
const fs = require("fs");

//Doit être défini au début de l'application
const dotenv = require("dotenv");
dotenv.config();

const server = http.createServer((request, response) => {
    if (request.url == "/") {
        const file = fs.readFileSync("./public/index.html", "utf8");
        response.setHeader("Content-Type", "text/html");
        response.statusCode = 200;
        response.end(file);
    } else {
        const file = fs.readFileSync("./public/404.html", "utf8");
        response.setHeader("Content-Type", "text/html");
        response.statusCode = 401;
        response.end(file);
    }
});

server.listen(process.env.PORT, () => {
    console.log("Serveur connecté au port " + process.env.PORT);
});
