const http = require("http");
const fs = require("fs");
const path = require("path");

const express = require("express");
const server = express();
const db = require("./data/db");

//Doit être défini au début de l'application
const dotenv = require("dotenv");
dotenv.config();

//On indique que le dossier public est accessible à tous
server.use(express.static(path.join(__dirname, "public")));

server.get("/api/films", async (req, res) => {
    try {
        const ordre = req.query.ordre || "asc";
        const limite = parseInt(req.query.limite) || 10;

        const references = await db.collection("films").orderBy("titre", ordre).limit(limite).get();

        const filmsTrouves = [];

        references.forEach((doc) => {
            // const docData = doc.data();
            // docData.id = doc.id;
            const docData = { id: doc.id, ...doc.data() };
            filmsTrouves.push(docData);
        });

        //Si aucun film trouvé, retourner erreur 404
        if (filmsTrouves.length == 0) {
            res.statusCode = 404;
            return res.json({ message: "Aucun film trouvé" });
        }

        //Si tout va bien, on envoie les données
        res.statusCode = 200;
        return res.json(filmsTrouves);
    } catch (erreur) {
        res.statusCode = 500;
        return res.json({ message: erreur.message });
    }
});

server.get("/api/films/:id", async (req, res) => {
    const id = req.params.id;

    const reference = await db.collection("films").doc(id).get();
    const data = reference.data();

    res.statusCode = 200;
    return res.json(data);
});

server.post("/api/films", (req, res) => {
    res.json("ok post");
});

server.post("/api/films/initialiser", (req, res) => {
    try {
        const dataInit = require("./data/filmsDepart");

        dataInit.forEach(async (film) => {
            await db.collection("films").add(film);
        });

        res.statusCode = 200;
        return res.json({ message: "Liste de films initialisée" });
    } catch (erreur) {
        res.statusCode = 500;
        return res.json({ message: erreur.message });
    }
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
