const express = require("express");
const router = express.Router();
const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

// /**
//  * @route GET /utilisateurs
//  * @description Cette route permet de récupérer la liste des utilisateurs
//  */
// router.get("/", async (req, res) => {
//     try {
//         const utilisateursRef = await db.collection("utilisateurs").get();
//         const utilisateurs = [];

//         utilisateursRef.forEach((doc) => {
//             utilisateurs.push({ id: doc.id, ...doc.data() });
//         });

//         res.statusCode = 200;
//         res.json(utilisateurs);
//     } catch (e) {
//         res.statusCode = 500;
//         res.json({ message: e.message });
//     }
// });

// /**
//  * @route POST /utilisateurs/initialize
//  * @description Cette route permet d'initialiser la base de données avec des données de test
//  */
// router.post("/initialize", async (req, res) => {
//     const donneesTest = require("../data/donneesUtilisateursTest.js");

//     await donneesTest.forEach(async (utilisateur) => {
//         const motDePasse = utilisateur.mdp;
//         const courriel = utilisateur.courriel;

//         const docRef = await db.collection("utilisateurs").where("courriel", "==", courriel).get();
//         const utilisateurs = [];

//         docRef.forEach(async (doc) => {
//             utilisateurs.push({ id: doc.id, ...doc.data() });
//         });

//         if (utilisateurs.length == 0) {
//             const hash = await bcrypt.hash(motDePasse, 10);
//             const user = { courriel, mdp: hash };
//             await db.collection("utilisateurs").add(user);
//         }
//     });

//     res.statusCode = 200;
//     res.json({ message: "Données initialisées" });
// });

/**
 * @route POST /inscription
 * @description Cette route permet de créer un nouvel utilisateur. Elle vérifie d'abord si l'email fourni est déjà utilisé. Si ce n'est pas le cas, elle crée un nouvel utilisateur avec l'email et le mot de passe fournis, puis renvoie les informations de l'utilisateur avec un token.
 */
router.post(
    "/inscription",
    [
        check("courriel").escape().trim().notEmpty().isEmail().normalizeEmail(),
        check("mdp").escape().trim().notEmpty().isLength({ min: 8, max: 20 }).isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }),
    ],
    async (req, res) => {
        try {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                return res.status(400).json({ message: "Données invalides" });
            }

            const motDePasse = req.body.mdp;
            const courriel = req.body.courriel;

            const docRef = await db.collection("utilisateurs").where("courriel", "==", courriel).get();
            const utilisateurs = [];

            docRef.forEach(async (doc) => {
                utilisateurs.push({ id: doc.id, ...doc.data() });
            });

            if (utilisateurs.length > 0) {
                res.statusCode = 400;
                res.json({ message: "Courriel déjà utilisé" });
            } else {
                const hash = await bcrypt.hash(motDePasse, 10);
                const user = { courriel, mdp: hash };
                const doc = await db.collection("utilisateurs").add(user);
                user.id = doc.id;
                user.token = genererToken(user.id);
                res.json(user);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
);

/**
 * @route POST /connexion
 * @description Cette route permet à un utilisateur de se connecter. Elle vérifie d'abord si l'email fourni existe dans la base de données. Si c'est le cas, elle compare le mot de passe fourni avec le mot de passe hashé stocké dans la base de données. Si les mots de passe correspondent, elle renvoie les informations de l'utilisateur avec un token.
 */
router.post(
    "/connexion",
    [
        check("mdp").escape().trim().notEmpty().isString(),
        check("courriel").escape().trim().notEmpty().isEmail().normalizeEmail(),
    ],
    async (req, res) => {
        try {
            const validation = validationResult(req);
            if (!validation.isEmpty()) {
                return res.status(400).json({ message: "Données invalides" });
            }
            const motDePasse = req.body.mdp;
            const courriel = req.body.courriel;

            const docRef = await db.collection("utilisateurs").where("courriel", "==", courriel).get();
            const utilisateurs = [];

            docRef.forEach(async (doc) => {
                utilisateurs.push({ id: doc.id, ...doc.data() });
            });

            const utilisateur = utilisateurs[0];

            if (utilisateur === undefined) {
                res.statusCode = 400;
                res.json({ message: "Le courriel n'existe pas" });
            } else {
                const resultatConnexion = await bcrypt.compare(motDePasse, utilisateur.mdp);

                if (resultatConnexion) {
                    //Générer le token JWT // Partie 3 du cours
                    res.json(utilisateur);
                } else {
                    res.statusCode = 400;
                    res.json({ message: "Mot de passe incorrect" });
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
);

module.exports = router;
