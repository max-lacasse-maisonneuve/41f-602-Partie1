const path = require("path"); //Module de nodejs servant à gérer les chemins relatifs
const express = require("express"); //Librairie pour utiliser express
const cors = require("cors"); //Librairie pour permettre les requêtes entre des noms de domaine différents
const dotenv = require("dotenv"); //Librairie servant à utiliser les variables d'environnements
const bcrypt = require("bcrypt"); //Librairie pour hasher le mot de passe

//Doit être défini au début de l'application
const server = express(); //Initialisation du serveur
const db = require("./data/db"); //Fichier d'accès à la base de données

dotenv.config(); //Récupère les variables du fichier .env

server.use(cors()); //Permet les requêtes provenant de d'autres noms de domaine
server.use(express.json()); //Permet d'envoyer des données json dans le body
server.use(express.urlencoded({ extended: true })); //Pour les formulaires HTML x-www-urlencoded (fichiers)

// On indique que le dossier public est accessible à tous
server.use(express.static(path.join(__dirname, "public"))); //Permet d'accéder à tous les fichiers dans le dossier public

// =====================================
// Routes de l'API
server.get("/api/films", async (req, res) => {
    try {
        const ordre = req.query.ordre || "asc";
        const limite = parseInt(req.query.limite);

        let references = await db.collection("films").orderBy("titre", ordre);
        if (limite) {
            references = await references.limit(limite);
        }
        references = await references.get();

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
    // const reference = await db.collection("films").where("courriel","=",req.body.courriel ).get();
    const data = reference.data();
    data.id = id;

    res.statusCode = 200;
    return res.json(data);
});

server.post("/api/films", async (req, res) => {
    const donnees = req.body;
    // valider l'info, si pas valide, on retourne une erreur

    const nouveauFilm = await db.collection("films").add(donnees);
    donnees.id = nouveauFilm.id;

    res.statusCode = 200;
    return res.json(donnees);
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

server.post("/api/utilisateurs/inscription", async (req, res) => {
    try {
        const { courriel, mdp } = req.body;
        //vérifier si le user existe déjà
        //Si oui, on retourne un message d'erreur 400

        //Si non,

        //Validation des infos

        //Hasher le mdp
        const hash = await bcrypt.hash(mdp, 10);
        const utilisateur = {
            courriel: courriel,
            mdp: hash,
        };
        //Ajouter à la base de données

        //Retourner un code 201 avec un message de succès
    } catch (erreur) {
        //Retourner une erreur 500 avec un message d'erreur
    }
});

server.post("/api/utilisateurs/connexion", async (req, res) => {
    try {
        //Recupère les données
        const { courriel, mdp } = req.body;
        // const courriel = req.body.courriel;

        //Validation

        //Si l'utilisateur existe

        // Si non, on retourne un message d'erreur 400

        //Si oui, on récupère le premier utilisateur

        //On hash le mdp et on compare
        const user = { mdp: "sjdfhkksjdhfkjdshf" };
        const resultatComparaison = await bcrypt.compare(mdp, user.mdp);

        //Si le mot de passe ne concorde pas
        //On renvoie un message d'erreur 400
        if (resultatComparaison == false) {
            res.statusCode = 400;
            return res.json({ message: "Le mots de passe ne concorde pas" });
        }
        //Si tiguidou,
        //On renvoie l'utilisateur (sans le mot de passe) et le token
        delete user.mdp; //L'opérateur delete permet de supprimer une propriété d'un objet JS
        const dataARenvoyer = {
            utilisateur: user,
            jeton: "",
        };
        res.statusCode = 200;
        return res.json(dataARenvoyer);
    } catch (erreur) {
        //On retourne une erreur 500 et un message d'erreur
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
