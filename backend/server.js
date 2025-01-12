
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const { Parser } = require("json2csv");
const { PDFDocument, rgb } = require("pdf-lib");
const app = express();

// hachez le mot de passe avant de l'insérer dans la base :
const bcrypt = require('bcrypt');
const crypto = require('crypto');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; 



// fin **********************************************************

app.use(cors());
app.use(bodyParser.json());


const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bayefall1988',
  database: 'gest_immo',
}).promise();

db.query("SELECT 1 + 1 AS solution")
  .then(([rows]) => {
    console.log("Résultat :", rows);
  })
  .catch((err) => {
    console.error("Erreur :", err);
  });




/*****************************************************************************/

//const secretKey = crypto.randomBytes(64).toString('hex');  // Génère une clé secrète aléatoire de 64 octets
/*app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const [result] = await db.query(sql, [username, password]);

    if (result.length > 0) {
      const user = result[0];

      const token = jwt.sign(
        { username: user.username, id: user.id },
        process.env.SECRET_KEY,  // Assurez-vous que cette clé est définie correctement
        { expiresIn: '1h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          nomComplet: user.nomComplet,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
  } catch (err) {
    console.error('Erreur lors du traitement de la requête /api/login :', err); // Important pour déboguer
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});*/



// Middleware de vérification du JWT
/*const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Récupérer le token des en-têtes

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }

  // Vérifier et décoder le token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token invalide' });
    }
    req.user = decoded; // Vous pouvez ajouter les informations décodées à la requête pour les utiliser plus tard
    next();  // Passer à la suite de la requête
  });
};

// Exemple d'API protégée par JWT
app.get('/api/userConnecte', authenticateToken, async (req, res) => {
  const { username } = req.user;  // Utiliser l'information du token décodé

  // Requête SQL pour récupérer les informations de l'utilisateur
  const sql = 'SELECT id, username, nomComplet FROM users WHERE username = ?';
  const [result] = await db.query(sql, [username]);

  if (result.length > 0) {
    res.json({ success: true, user: result[0] });
  } else {
    res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
  }
});*/



 app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  try {
    const [result] = await db.query(sql, [username, password]);

    if (result.length > 0) {
      const user = result[0];
      const token = secretKey; // Remplacez par un vrai JWT pour plus de sécurité en production.

      // Retourner les informations utilisateur et le token
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          nomComplet: user.nomComplet, // Inclure le nom complet ou toute autre information
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
    }
  } catch (err) {
    console.error('Erreur lors de la tentative de connexion :', err);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});


  /*************************************************FIN*****************************************/

app.get('/api/userConnecte', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Récupérer le token depuis les en-têtes
  
  console.log('Token reçu:', token); // Ajoutez ceci pour vérifier le token

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }

  try {
    // Décoder et vérifier le token
    const decoded = jwt.verify(token, secretKey); // Remplacez 'votre_clé_secrète' par votre clé secrète pour vérifier le token
    console.log('Décodé:', decoded); // Affichez les informations décodées

    // Si le token est valide, vous pouvez maintenant utiliser l'ID ou le username extrait du token
    const { username } = decoded;  // Supposons que le token contienne le username

    // Effectuer la requête SQL pour récupérer les informations de l'utilisateur
    const sql = 'SELECT id, username, nomComplet, email FROM users WHERE username = ?';
    const [result] = await db.query(sql, [username]); // Requête en utilisant le username

    if (result.length > 0) {
      console.log('Utilisateur trouvé:', result[0]); // Affichez l'utilisateur trouvé
      return res.json({ success: true, user: result[0] });
    } else {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des informations utilisateur :', err);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

  
  

/************************************************************************ */

// Récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    // Requête SQL pour récupérer les données des utilisateurs
    const [rows] = await db.query(
      `SELECT * FROM users`
    );

    // Répondre avec les données récupérées
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nomComplet, username, email, password } = req.body;
    const [result] = await db.query(
      `INSERT INTO users (nomComplet, username, email, password) VALUES (?, ?, ?, ?)`,
      [nomComplet, username, email, password]
    );
    res.json({ id: result.insertId, message: 'Utilisateur ajouté avec succès.' });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un utilisateur :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'utilisateur." });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomComplet, username, email,password ,is_active } = req.body;
    await db.query(
      `UPDATE users SET nomComplet = ?, username = ?, email = ?, password = ?, is_active = ? WHERE id = ?`,
      [nomComplet, username, email, password,is_active, id]
    );
    res.json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
  }
});

  /*app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
  }
});
*/
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } else {
      res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});



/******************************************DEBUT*********************************************/

// Récupérer tous les biens
app.get("/api/biens", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, 
         p.nomComplet AS nom_proprietaire
      FROM biens b
      JOIN proprietaires p ON b.proprietaire_id = p.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des biens :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des biens" });
  }
});

app.post("/api/biens", async (req, res) => {
  console.log("Données reçues :", req.body);
  const { type, adresse, superficie, nombre_pieces, loyer_mensuel, proprietaire_id } = req.body;

  // Vérifier que tous les champs sont présents
  if (!type || !adresse || !superficie || !nombre_pieces || !loyer_mensuel || !proprietaire_id) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  try {
    // Insérer les données dans la base de données
    const [result] = await db.query(
      "INSERT INTO biens (type, adresse, superficie, nombre_pieces, loyer_mensuel, proprietaire_id) VALUES (?, ?, ?, ?, ?, ?)",
      [type, adresse, superficie, nombre_pieces, loyer_mensuel, proprietaire_id]
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Erreur lors de l'ajout du bien :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du bien" });
  }
});


// Modifier un bien
app.put("/api/biens/:id", async (req, res) => {
  const { type, adresse, superficie, nombre_pieces, loyer_mensuel, proprietaire_id } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE biens SET type = ?, adresse = ?, superficie = ?, nombre_pieces = ?, loyer_mensuel = ?, proprietaire_id = ? WHERE id = ?",
      [type, adresse, superficie, nombre_pieces, loyer_mensuel, proprietaire_id, id]
    );
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du bien" });
  }
});

// Supprimer un bien
app.delete("/api/biens/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM biens WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du bien" });
  }
});

/************************************************************************************ */

// Routes pour les locataires

// Récupérer tous les locataires
/*app.post('/api/locataires', (req, res) => {
  const { nomComplet, email, telephone, adresse } = req.body;
  const checkQuery = 'SELECT * FROM locataires WHERE email = ?';
  const insertQuery = 'INSERT INTO locataires (nomComplet, email, telephone, adresse) VALUES (?, ?, ?, ?)';

  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      res.status(500).send('Erreur serveur');
      return;
    }

    if (results.length > 0) {
      res.status(400).send('Un locataire avec cet email existe déjà.');
    } else {
      db.query(insertQuery, [nomComplet, email, telephone, adresse], (err, results) => {
        if (err) {
          res.status(500).send('Erreur serveur');
        } else {
          res.json({ id: results.insertId, nomComplet, email, telephone, adresse });
        }
      });
    }
  });
}); */


// Récupérer tous les locataires
app.get("/api/locataires", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM locataires");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des locataires" });
  }
});

app.post('/api/locataires', async (req, res) => {
  const { nomComplet, email, telephone, adresse,date } = req.body;
  const query = 'INSERT INTO locataires (nomComplet, email, telephone, adresse,date) VALUES (?, ?, ?, ?,?)';
  try {
    const [results] = await db.execute(query, [nomComplet, email, telephone, adresse,date]);
    res.json({ id: results.insertId, nomComplet, email, telephone, adresse ,date});
  } catch (err) {
    console.error('Erreur lors de l\'ajout du locataire:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.put('/api/locataires/:id', async (req, res) => {
  const { id } = req.params;
  const { nomComplet, email, telephone, adresse, date } = req.body;
  const query = 'UPDATE locataires SET nomComplet = ?, email = ?, telephone = ?, adresse = ?, date = ? WHERE id = ?';
  try {
    await db.execute(query, [nomComplet, email, telephone, adresse, date, id]);
    res.send('Locataire mis à jour avec succès');
  } catch (err) {
    console.error('Erreur lors de la mise à jour du locataire:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.delete('/api/locataires/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM locataires WHERE id = ?';
  try {
    await db.execute(query, [id]);
    res.send('Locataire supprimé avec succès');
  } catch (err) {
    console.error('Erreur lors de la suppression du locataire:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/api/locataires/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM locataires WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Locataire non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du locataire :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

  /******************************************************************************* */

  app.post('/api/contrats', async (req, res) => {
    const { locataire_id, bien_id, date_debut, date_fin, loyer_mensuel, etat ,libelle} = req.body;
    const query = 'INSERT INTO contrats (locataire_id, bien_id, date_debut, date_fin, loyer_mensuel, etat,libelle) VALUES (?, ?, ?, ?, ?,?, ?)';
    try {
      const [results] = await db.execute(query, [locataire_id, bien_id, date_debut, date_fin, loyer_mensuel, etat,libelle]);
      res.json({ id: results.insertId, locataire_id, bien_id, date_debut, date_fin, loyer_mensuel, etat ,libelle});
    } catch (err) {
      console.error('Erreur lors de l\'ajout du contrat:', err);
      res.status(500).send('Erreur serveur');
    }
  });

  app.put('/api/contrats/:id', async (req, res) => {
    const { id } = req.params;
    const { locataire_id, bien_id, date_debut, date_fin, loyer_mensuel,etat,libelle } = req.body;
    const query = 'UPDATE contrats SET locataire_id = ?, bien_id = ?, date_debut = ?, date_fin = ?, loyer_mensuel = ?,etat = ?,libelle = ? WHERE id = ?';
    try {
      await db.execute(query, [locataire_id, bien_id, date_debut, date_fin, loyer_mensuel,etat,libelle, id]);
      res.send('Contrat mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du contrat:', err);
      res.status(500).send('Erreur serveur');
    }
  });

  app.delete('/api/contrats/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM contrats WHERE id = ?';
    try {
      await db.execute(query, [id]);
      res.send('Contrat supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du contrat:', err);
      res.status(500).send('Erreur serveur');
    }
  });
  
  // Récupérer tous les paiements
  app.get('/api/contrats', async (req, res) => {
    try {
      const query = `
        SELECT 
          contrats.id, 
          contrats.locataire_id, 
          contrats.bien_id, 
          contrats.libelle,
          contrats.date_debut, 
          contrats.date_fin, 
          contrats.loyer_mensuel, 
          contrats.etat, 
          locataires.nomComplet AS nom_locataires,
          locataires.adresse,
          biens.type AS nom_bien
        FROM contrats
        LEFT JOIN locataires ON contrats.locataire_id = locataires.id
        LEFT JOIN biens ON contrats.bien_id = biens.id
      `;
  
      const [rows] = await db.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des contrats' });
    }
  });
  

  /********************************************************************************* */


// Ajouter un paiement
app.post('/api/paiement', async (req, res) => {
  const { contrat_id, montant_paye, mois, montant_total, methode_paiement } = req.body;

  try {
    // Convertir les montants en nombres
    const montantPaye = parseFloat(montant_paye);
    const montantTotal = parseFloat(montant_total);

    // Validation des données
    if (isNaN(montantPaye) || isNaN(montantTotal)) {
      return res.status(400).json({ message: 'Les montants doivent être des nombres valides' });
    }

    if (!contrat_id || !mois || !methode_paiement) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    // Vérifier si le contrat existe
    const [contrat] = await db.query('SELECT id FROM contrats WHERE id = ?', [contrat_id]);
    if (contrat.length === 0) {
      return res.status(404).json({ message: 'Contrat introuvable' });
    }

    // Vérifier les paiements précédents pour ce contrat et ce mois
    const [result] = await db.query(
      'SELECT SUM(montant_paye) AS total_paye FROM paiement WHERE contrat_id = ? AND mois = ?',
      [contrat_id, mois]
    );

    const totalPaye = parseFloat(result[0]?.total_paye || 0); // Valeur déjà payée
    const montantRestant = montantTotal - (totalPaye + montantPaye); // Nouveau montant restant

    if (montantRestant < 0) {
      return res.status(400).json({ message: 'Montant payé dépasse le montant total' });
    }

    // Vérifier les doublons
    const [existingPayment] = await db.query(
      'SELECT id FROM paiement WHERE contrat_id = ? AND mois = ? AND montant_paye = ?',
      [contrat_id, mois, montantPaye]
    );
    if (existingPayment.length > 0) {
      return res.status(409).json({ message: 'Ce paiement a déjà été enregistré' });
    }

    // Déterminer le statut du paiement
    const statut = montantRestant > 0 ? 'avance' : 'payé';

    // Insérer le nouveau paiement
    await db.query(
      'INSERT INTO paiement (contrat_id, montant_paye, montant_total, date_paiement, methode_paiement, statut, mois, montant_restant) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
      [
        contrat_id,
        montantPaye,
        montantTotal,
        methode_paiement,
        statut,
        mois,
        montantRestant,
      ]
    );

    res.status(201).json({
      message: 'Paiement enregistré avec succès',
      statut,
      montantRestant,
    });
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du paiement :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Récupérer tous les paiements avec leurs contrats et locataires associés
app.get('/api/paiement', async (req, res) => {
  try {
    // Requête SQL avec jointures
    const [rows] = await db.query(
      `SELECT
        paiement.id ,
        paiement.contrat_id,
        paiement.montant_total,
        paiement.montant_paye, 
        paiement.date_paiement, 
        paiement.methode_paiement, 
        paiement.statut,
        paiement.mois,
        paiement.montant_restant,
        contrats.id AS contrat_id,
        contrats.libelle,
        contrats.locataire_id,
        contrats.bien_id,
        contrats.date_debut,
        contrats.date_fin,
        contrats.loyer_mensuel,
        contrats.etat AS etat_contrat,
        locataires.id AS locataire_id,
        locataires.nomcomplet AS nom_locataire,
        biens.type AS type_bien
      FROM paiement
      LEFT JOIN contrats ON paiement.contrat_id = contrats.id
      LEFT JOIN locataires ON contrats.locataire_id = locataires.id
      LEFT JOIN biens ON contrats.bien_id = biens.id
      `
    );

    // Répondre avec les données récupérées
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});



// Modifier un paiement
app.put('/api/paiement/:id', async (req, res) => {
  const { contrat_id, montant_paye, date_paiement, methode_paiement,mois, statut,montant_total } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE paiement SET contrat_id = ?, montant_paye = ?, date_paiement = ?, methode_paiement = ?, statut = ?,locataire_id = ? WHERE id = ?',
      [contrat_id, montant_paye, date_paiement, methode_paiement, mois,statut, montant_total,id]
    );
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement' });
  }
});

// Supprimer un paiement
app.delete('/api/paiement/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM paiement WHERE id = ?';
  try {
    await db.execute(query, [id]);
    res.send('paiement supprimé avec succès');
  } catch (err) {
    console.error('Erreur lors de la suppression du paiement:', err);
    res.status(500).send('Erreur serveur');
  }
});


/*************************************************************************************** */


// Récupérer tous les propriétaires
app.get("/api/proprietaires", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM proprietaires");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des propriétaires" });
  }
});

// Ajouter un propriétaire
app.post("/api/proprietaires", async (req, res) => {
  const { nomComplet, email, telephone, adresse } = req.body;

  // Vérification des données reçues
  if (!nomComplet || !email || !telephone || !adresse) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    // Insertion dans la base de données
    const [result] = await db.query(
      "INSERT INTO proprietaires (nomComplet, email, telephone, adresse) VALUES (?, ?, ?, ?)",
      [nomComplet, email, telephone, adresse]
    );

    // Réponse en cas de succès
    res.status(201).json({
      id: result.insertId,
      nomComplet,
      email,
      telephone,
      adresse,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du propriétaire :", error);

    // Gestion des erreurs spécifiques (par exemple, duplication d'email)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "L'email est déjà utilisé." });
    } else {
      res.status(500).json({ message: "Erreur lors de l'ajout du propriétaire." });
    }
  }
});


// Modifier un propriétaire
app.put("/api/proprietaires/:id", async (req, res) => {
  const { nomComplet, email, telephone, adresse } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE proprietaires SET nomComplet = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?",
      [nomComplet, email, telephone, adresse, id]
    );
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du propriétaire" });
  }
});

// Supprimer un propriétaire
app.delete("/api/proprietaires/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM proprietaires WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du propriétaire" });
  }
});

/*******************************cela concerne  le dashboard********************* */

//  cest pour recupere les statitiques des ventes
app.get("/api/stats", async (req, res) => {
  const connection = await db.getConnection(); // Connexion à la base de données

  try {
    // Requête pour le nombre total d'utilisateurs
    const [userResult] = await connection.query("SELECT COUNT(*) AS locataire FROM locataires");
    const locataire = userResult[0].locataire;

    // Requête pour le nombre total de commandes
    const [orderResult] = await connection.query("SELECT COUNT(*) AS paiement FROM paiement");
    const paiement = orderResult[0].paiement;

    // Requête pour les revenus totaux
    const [revenueResult] = await connection.query("SELECT SUM(montant_total) AS revenue FROM paiement");
    const revenue = revenueResult[0].revenue || 0; // Gérer les résultats nuls

    // Envoyer les résultats au client
    res.json({
      locataire,
      paiement,
      revenue,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  } finally {
    connection.release(); // Libérer la connexion à la base de données
  }
});
// cest pour le graphique des  clients
app.get('/api/locataires', async (req, res) => {
  try {
    const connection = await db.getConnection();

    const [results] = await connection.query(`
      SELECT
        DATE_FORMAT(MIN(date), '%b') AS month,    -- Mois abrégé
        COUNT(*) AS total_locataires  -- Nombre total de locataires inscrits
      FROM
        locataires
      GROUP BY
        MONTH(date)
      ORDER BY
        MONTH(date);
    `);

    const allMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const filledResults = allMonths.map(month => ({
      month,
      total_locataires: results.find(r => r.month === month)?.total_locataires || 0
    }));

    res.json(filledResults);
  } catch (err) {
    console.error('Erreur API locataires:', err);
    res.status(500).json({ message: 'Erreur interne.' });
  }
});

// cest pour afficher le graphique des commandes
app.get('/api/paiement', async (req, res) => {
  try {
    const connection = await db.getConnection(); // Connexion à la base de données

    // Exécuter la requête pour récupérer les montants par mois
    const [results] = await connection.query(`
      SELECT
        DATE_FORMAT(MIN(date_paiement), '%b') AS month, -- Mois abrégé
        SUM(montant_total) AS total                             -- Total des montants
      FROM
        paiement
      GROUP BY
        MONTH(date_paiement)
      ORDER BY
        MONTH(date_paiement);
    `);
    // Liste complète des mois
    const allMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    // Fusionner les résultats avec tous les mois
    const filledResults = allMonths.map(month => ({
      month,
      total: results.find(r => r.month === month)?.total || 0 // Si un mois est absent, le total sera 0
    }));

    res.json(filledResults); // Envoyer les résultats remplis au client
  } catch (err) {
    console.error('Erreur API paiements:', err);
    res.status(500).json({ message: 'Erreur interne.' });
  }
});

/********************************************************************* */







  /************************************************************************* */
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});