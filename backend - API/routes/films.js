const express = require("express");
const router = express.Router();
const db = require("../config/db.js");
const { check, validationResult } = require("express-validator");

/**
 * Cette route permet de récupérer la liste des films
 * @route GET /films
 */
router.get(
    "/",
    [
        check("limit").escape().trim().optional(true).isInt({ min: 0 }),
        check("orderDirection").escape().trim().isString().optional(true),
        check("orderBy").escape().trim().isString().optional(true),
    ],
    async (req, res) => {
        try {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                return res.status(400).json({ message: "Données invalides" });
            }
            const { orderBy = "titre", orderDirection = "asc", limit = 100 } = req.query;
            const filmsRef = await db.collection("films").orderBy(orderBy, orderDirection).limit(+limit).get();
            const films = [];

            filmsRef.forEach((doc) => {
                films.push({ id: doc.id, ...doc.data() });
            });

            res.statusCode = 200;
            res.json(films);
        } catch (e) {
            res.statusCode = 500;
            res.json({ message: e.message });
        }
    }
);

/**
 * Cette route permet de récupérer un film
 * @route GET /films/{id}
 */
router.get("/:id", [check("id").escape().trim().notEmpty()], async (req, res) => {
    try {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            return res.status(400).json({ message: "Données invalides" });
        }

        const id = req.params.id;
        const filmsRef = await db.collection("films").doc(id).get();

        res.statusCode = 200;
        res.json(filmsRef.data());
    } catch (err) {
        res.status(500).send(err);
    }
});

/**
 * Cette route permet d'initialiser la base de données avec des données de test
 * @route POST /films/initialize
 */
// router.post("/initialize", async (req, res) => {
//     const donneesTest = require("../data/filmsDepart.js");
//     console.log(donneesTest);
//     donneesTest.forEach(async (film) => {
//         await db.collection("films").add(film);
//     });

//     res.statusCode = 200;
//     res.json({ message: "Données initialisées" });
// });

/**
 * Cette route permet de créer un film
 * @route POST /films
 */
router.post(
    "/",
    [
        check("titre").escape().trim().notEmpty().isString(),
        check("genres").escape().trim().exists().isArray(),
        check("description").escape().trim().notEmpty().isString(),
        check("titreVignette").escape().trim().notEmpty().isString(),
        check("realisation").escape().trim().notEmpty().isString(),
        check("annee").escape().trim().notEmpty().isString(),
    ],
    async (req, res) => {
        try {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                return res.status(400).json({ message: "Données invalides" });
            }

            const film = req.body;
            const doc = await db.collection("films").add(film);
            film.id = doc.id;
            res.json(film);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
);

/**
 * Cette route permet de modifier un film
 * @route PUT /films/{id}
 */
router.put(
    "/:id",
    [
        check("id").escape().trim().notEmpty().isString(),
        check("titre").escape().trim().optional(true).notEmpty().isString(),
        check("genres").escape().trim().optional(true).exists().isArray(),
        check("description").escape().trim().optional(true).notEmpty().isString(),
        check("titreVignette").escape().trim().optional(true).notEmpty().isString(),
        check("realisation").escape().trim().optional(true).notEmpty().isString(),
        check("annee").escape().trim().optional(true).notEmpty().isString(),
    ],
    async (req, res) => {
        try {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                return res.status(400).json({ message: "Données invalides" });
            }

            //Si vous vouliez empêcher l'ajout de champs supplémentaires, envoyez ceci dans la méthode update
            // const { titre, genres, description, titreVignette, realisation, annee } = req.body;

            //On crée un nouvel objet contenant uniquement les champs nécessaires à la modification
            // const modifications = {
            //     ...(titre ? { titre } : {}),
            //     ...(genres ? { genres } : {}),
            //     ...(description ? { description } : {}),
            //     ...(titreVignette ? { titreVignette } : {}),
            //     ...(realisation ? { realisation } : {}),
            //     ...(annee ? { annee } : {}),
            // };

            const id = req.params.id; //Le id passé dans la route
            const film = req.body; //Les informations à changer

            const modification = await db.collection("films").doc(id).update(film);

            res.status(200).json(modification);
        } catch (err) {
            res.status(500).send(err);
        }
    }
);

/**
 * Cette route permet de supprimer un film
 * @route DELETE /films/{id}
 */
router.delete("/:id", [check("id").escape().trim().notEmpty().isString()], async (req, res) => {
    try {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            return res.status(400).json({ message: "Données invalides" });
        }
        const id = req.params.id;
        await db.collection("films").doc(id).delete();

        res.json({ message: `Le document avec l'id ${id} a été supprimé` });
    } catch (err) {
        res.status(500).send(err);
    }
});
module.exports = router;
