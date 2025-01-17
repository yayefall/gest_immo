
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const { Parser } = require("json2csv");
const { PDFDocument, rgb } = require("pdf-lib");
const app = express();
const session = require('express-session');

// hachez le mot de passe avant de l'insérer dans la base :
const bcrypt = require('bcrypt');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; 



// fin **********************************************************

//app.use(cors());

app.use(cors({
  origin: 'http://localhost:9000',  // L'URL de votre frontend
  credentials: true,  // Permet d'envoyer et de recevoir des cookies
}));
app.use(bodyParser.json());

// connexion pour la base de donnee
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

// connexion pour la session

app.use(session({
  secret: '7d2c6c01f47b312c5bf7457aa9171f46c85e4e1c9b37f2a571eb2397b35cfa34', // Une clé secrète pour la session
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS obligatoire
    httpOnly: true, // Protège contre les attaques XSS
    sameSite: 'strict', // Limite le partage des cookies entre domaines
    maxAge: 60 * 60 * 1000 // 1 heure (en millisecondes)
// maxAge: 24 * 60 * 60 * 1000 // 1 jour
  }
}));

/*****************************************************************************/

// cest pour  haché les mots de passse deja existtes
/*
async function hashExistingPasswords() {
  try {
    // Récupérer tous les utilisateurs
    const [users] = await db.query("SELECT id, password FROM users");

    for (const user of users) {
      if (user.password) {
        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Mettre à jour le mot de passe dans la base de données
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
        console.log(`Mot de passe pour l'utilisateur ID ${user.id} haché avec succès.`);
      }
    }
    console.log("Tous les mots de passe existants ont été hachés.");
  } catch (error) {
    console.error("Erreur lors du hachage des mots de passe existants :", error);
  }
}

hashExistingPasswords();
*/
/*********fin de hacher les password deja existé F************** */


// cest la route pour se connecter  elle marche bien avec hasher
/*app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Récupérer l'utilisateur par le nom d'utilisateur
  const sql = 'SELECT * FROM users WHERE username = ?';

  try {
    const [result] = await db.query(sql, [username]);

    if (result.length > 0) {
      const user = result[0];

      // Comparer le mot de passe fourni avec le mot de passe haché stocké
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
      }

      // Si le mot de passe est valide, vous pouvez retourner les informations de l'utilisateur
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          nomComplet: user.nomComplet, // Inclure d'autres informations utilisateur si nécessaire
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
    }
  } catch (err) {
    console.error('Erreur lors de la tentative de connexion :', err);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});*/

/**************************** cest pour tester la session*************************************** */

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Vérifiez que les données nécessaires sont fournies
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe requis." });
    }

    // Requête pour récupérer l'utilisateur par son nom d'utilisateur
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [result] = await db.query(sql, [username]);

    // Vérifiez si l'utilisateur existe
    if (result.length === 0) {
      console.log('Utilisateur non trouvé.');
      return res.status(401).json({ success: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
    }

    const user = result[0];

    // Journaux pour déboguer les données de l'utilisateur
    console.log('Nom d’utilisateur fourni :', username);
    console.log('Utilisateur trouvé :', user);
    console.log('Mot de passe haché dans la base :', user.password);
    console.log('Mot de passe fourni :', password);
    // Comparez le mot de passe fourni avec le mot de passe haché stocké
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Validation du mot de passe :', isPasswordValid);

    if (!isPasswordValid) {
      // Si le mot de passe est incorrect
      console.log('Mot de passe incorrect.');
      return res.status(401).json({ success: false, message: 'Nom d’utilisateur ou mot de passe incorrect.' });
    }

    // Si le mot de passe est correct, créez la session utilisateur
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.nomComplet = user.nomComplet;

    // Réponse en cas de succès
    res.json({
      success: true,
      message: 'Connexion réussie.',
      user: {
        id: user.id,
        username: user.username,
        nomComplet: user.nomComplet,
      },
    });
  } catch (err) {
    // Log l'erreur pour débogage
    console.error('Erreur lors de la tentative de connexion :', err);

    // Réponse en cas d'erreur serveur
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});


// fonction pour  faire  deconnecter l'appli
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.status(500).json({ message: 'Erreur lors de la déconnexion.' });
    }
    res.clearCookie('connect.sid'); // Assurez-vous que le nom du cookie correspond
    res.json({ success: true, message: 'Déconnexion réussie.' });
  });
});


// Route pour obtenir les informations de l'utilisateur
app.get('/api/me', (req, res) => {
  console.log('Session actuelle :', req.session); // Log pour déboguer

  if (req.session.userId) {
    res.json({
      success: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        nomComplet: req.session.nomComplet
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
  }
});


  /***************************** autres fonctions**************************************/


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

// route pour ajouter le user
app.post("/api/users", async (req, res) => {
  const { nomComplet, email, username, password } = req.body;

  try {
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur dans la base de données
    await db.query(
      "INSERT INTO users (nomComplet, email, username, password) VALUES (?, ?, ?, ?)",
      [nomComplet, email, username, hashedPassword]
    );

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// route pour modifier le user


app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomComplet, username, email, password, is_active } = req.body;

    // Vérifier si un mot de passe est fourni
    let hashedPassword = null;
    if (password) {
      const saltRounds = 10; // Ajustez le nombre de rounds selon vos besoins
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Construire la requête SQL et les paramètres
    const updateQuery = `
      UPDATE users
      SET
        nomComplet = ?,
        username = ?,
        email = ?,
        ${password ? 'password = ?,' : ''} 
        is_active = ?
      WHERE id = ?
    `;

    const params = password
      ? [nomComplet, username, email, hashedPassword, is_active, id]
      : [nomComplet, username, email, is_active, id];

    // Exécuter la requête SQL
    await db.query(updateQuery.replace(/,\s*WHERE/, ' WHERE'), params);

    res.json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
  }
});

/*app.put('/api/users/:id', async (req, res) => {
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
});*/

// route pour supprimer le user
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

  app.post('/api/paiement', async (req, res) => {
    const {
      contrat_id,
      montant_paye,
      montant_total, // Nouveau champ pour simplifier les calculs
      mois,
      methode_paiement,
      statut,
    } = req.body;
  
    try {
      // Validation des données d'entrée
      if (!contrat_id || !montant_paye || !montant_total || !mois || !methode_paiement || !statut) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être fournis.' });
      }
  
      // Convertir les montants en nombres pour éviter les erreurs de type
      const montantPaye = parseFloat(montant_paye);
      const montantTotal = parseFloat(montant_total);
  
      if (isNaN(montantPaye) || isNaN(montantTotal)) {
        return res.status(400).json({ message: 'Les montants doivent être des nombres valides.' });
      }
  
      // Vérifier si le contrat existe
      const [contrat] = await db.query('SELECT id FROM contrats WHERE id = ?', [contrat_id]);
      if (contrat.length === 0) {
        return res.status(404).json({ message: 'Contrat introuvable.' });
      }
  
      // Vérifier les paiements précédents pour ce contrat et ce mois
      const [paiements] = await db.query(
        'SELECT SUM(montant_paye) AS total_paye FROM paiement WHERE contrat_id = ? AND mois = ?',
        [contrat_id, mois]
      );
      const totalPaye = parseFloat(paiements[0]?.total_paye || 0); // Montant déjà payé pour ce mois
      const montantRestantInitial = montantTotal - totalPaye; // Montant restant initial à payer
  
      // Initialisation des variables pour les calculs
      let montantRestant = montantRestantInitial;
      let paiementStatut;
  
      // Gestion des statuts
      if (statut === 'avance') {
        montantRestant -= montantPaye;
  
        if (montantRestant < 0) {
          return res.status(400).json({ message: 'Le montant payé dépasse le montant restant.' });
        }
  
        paiementStatut = 'avance'; // Statut reste "avance"
      } else if (statut === 'payé') {
        if (montantPaye !== montantTotal) {
          return res.status(400).json({
            message: 'Pour payer, le montant payé doit être exactement égal au loyer mensuel.',
          });
        }
  
        montantRestant = 0; // Le loyer est entièrement payé
        paiementStatut = 'payé';
      } else if (statut === 'payer_plus') {
        const surplus = montantPaye - montantTotal;
  
        if (surplus <= 0) {
          return res.status(400).json({
            message: 'Pour payer plus, le montant payé doit dépasser le loyer mensuel.',
          });
        }
  
        montantRestant = surplus; // Montant restant est le surplus
        paiementStatut = 'payer_plus';
      } else {
        return res.status(400).json({
          message: "Action invalide. Choisissez entre 'avance', 'payer', ou 'payer_plus'.",
        });
      }
  
      // Insérer le paiement dans la base de données
      await db.query(
        'INSERT INTO paiement (contrat_id, montant_paye, montant_total, date_paiement, methode_paiement, mois, statut, montant_restant) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
        [contrat_id, montantPaye, montantTotal, methode_paiement, mois, paiementStatut, montantRestant]
      );
  
      // Réponse en cas de succès
      res.status(201).json({
        message: 'Paiement enregistré avec succès.',
        statut: paiementStatut,
        montantRestant,
      });
    } catch (error) {
      console.error('Erreur lors de l’enregistrement du paiement :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  });
  

  /*
  app.post('/api/paiement', async (req, res) => {
    const { contrat_id, montant_paye, mois, montant_total, methode_paiement, statut } = req.body;

    try {
      console.log('Requête reçue avec :', req.body);

      const montantPaye = parseFloat(montant_paye);
      const montantTotal = parseFloat(montant_total);

      if (isNaN(montantPaye) || isNaN(montantTotal)) {
        return res.status(400).json({ message: 'Les montants doivent être valides.' });
      }

      if (!contrat_id || !mois || !methode_paiement || !statut) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être fournis.' });
      }

      const [contrat] = await db.query('SELECT id, loyer_mensuel FROM contrats WHERE id = ?', [contrat_id]);
      if (!contrat || contrat.length === 0) {
        return res.status(404).json({ message: 'Contrat introuvable.' });
      }

      const montantContratTotal = parseFloat(contrat[0].loyer_mensuel);

      const [result] = await db.query(
        'SELECT SUM(montant_paye) AS total_paye FROM paiement WHERE contrat_id = ? AND mois = ?',
        [contrat_id, mois]
      );

      const totalPaye = parseFloat(result[0]?.total_paye || 0);
      const montantRestantInitial = montantContratTotal - totalPaye;

      console.log('Montant restant initial :', montantRestantInitial);

      if (montantRestantInitial < 0) {
        return res.status(400).json({ message: 'Le montant total a déjà été payé.' });
      }

      let montantRestant = montantRestantInitial;

      if (statut === 'avance') {
        montantRestant -= montantPaye;

        if (montantRestant < 0) {
          return res.status(400).json({ message: 'Le montant payé dépasse le montant restant.' });
        }
      } else if (statut === 'payer') {
        const epsilon = 0.01;

        if (Math.abs(montantPaye - montantRestantInitial) > epsilon) {
          return res.status(400).json({ message: 'Le montant payé doit être égal au montant restant.' });
        }
        montantRestant > 0;
      } else if (statut === 'payer_plus') {
        const surplus = montantPaye - montantRestantInitial;

        if (surplus <= 0) {
          return res.status(400).json({ message: 'Le montant payé doit dépasser le montant restant.' });
        }
        montantRestant > 0;
      } else {
        return res.status(400).json({ message: 'Action invalide.' });
      }

      const paiementStatut = montantRestant > 0 ? 'avance' : 'payé';

      await db.query(
        'INSERT INTO paiement (contrat_id, montant_paye, montant_total, date_paiement, methode_paiement, mois, statut, montant_restant) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
        [contrat_id, montantPaye, montantContratTotal, methode_paiement, mois, paiementStatut, montantRestant]
      );

      res.status(201).json({
        message: 'Paiement enregistré avec succès.',
        statut: paiementStatut,
        montantRestant,
      });
    } catch (error) {
      console.error('Erreur serveur :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  });
  */


// Ajouter un paiement
/*app.post('/api/paiement', async (req, res) => {
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
});*/


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