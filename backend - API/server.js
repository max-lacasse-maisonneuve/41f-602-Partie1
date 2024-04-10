const http = require("http");
const fs = require("fs");
const express = require("express");
const server = express();

//Doit être défini au début de l'application
const dotenv = require("dotenv");
dotenv.config();

server.get("/", (req, res) => {
    let user = {
        id: 1,
        nom: "Maxime",
        email: "mlacassegermain@cmaisonneuve.qc.ca",
    };
    // res.statusCode = 201; //Change le code de status
    res.status(201).json(user); //Renvoie de la données en json
});

server.get("/api/donnees/:id", (req, res) => {
    console.log(req.params, req.query);
    const id = req.params.id; //On récupère le id dynamique de l'url
    res.json(id);
});

server.get("/api/donnees/:id/:category", (req, res) => {
    console.log(req.params, req.query);
    const id = req.params.id; //On récupère le id dynamique de l'url
    res.json(id);
});

//Gestion de l'erreur 404
server.use((req, res) => {
    res.statusMessage = "Ressource non trouvée";
    res.status(404).json("Ressource non trouvée");
});

//Doit être à la fin
server.listen(process.env.PORT, () => {
    console.log("Serveur connecté au port " + process.env.PORT);
});
