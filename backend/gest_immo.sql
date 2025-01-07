-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mar. 07 jan. 2025 à 15:18
-- Version du serveur :  8.0.40-0ubuntu0.20.04.1
-- Version de PHP : 7.4.3-4ubuntu2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gest_immo`
--

-- --------------------------------------------------------

--
-- Structure de la table `biens`
--

CREATE TABLE `biens` (
  `id` int NOT NULL,
  `type` enum('Appartement','Maison','Terran','bureau','autres') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `adresse` text NOT NULL,
  `superficie` decimal(10,2) DEFAULT NULL,
  `nombre_pieces` int NOT NULL,
  `loyer_mensuel` decimal(10,2) NOT NULL,
  `proprietaire_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `biens`
--

INSERT INTO `biens` (`id`, `type`, `adresse`, `superficie`, `nombre_pieces`, `loyer_mensuel`, `proprietaire_id`) VALUES
(1, 'Appartement', 'touba guediawaye', '300.00', 3, '150000.00', 1),
(2, 'Maison', 'Cité Fadia', '650.00', 4, '170000.00', 1),
(3, 'bureau', 'Touba Almadie', '200.00', 1, '60000.00', 2);

-- --------------------------------------------------------

--
-- Structure de la table `contrats`
--

CREATE TABLE `contrats` (
  `id` int NOT NULL,
  `locataire_id` int NOT NULL,
  `bien_id` int NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `loyer_mensuel` decimal(10,2) NOT NULL,
  `etat` varchar(20) NOT NULL,
  `libelle` varchar(250) NOT NULL
) ;

--
-- Déchargement des données de la table `contrats`
--

INSERT INTO `contrats` (`id`, `locataire_id`, `bien_id`, `date_debut`, `date_fin`, `loyer_mensuel`, `etat`, `libelle`) VALUES
(1, 8, 1, '2024-12-26', '2025-05-26', '150000.00', 'Actif', 'Location Appartements'),
(2, 9, 2, '2024-12-26', '2025-06-26', '170000.00', 'Actif', 'Location  Maison'),
(4, 8, 3, '2024-12-27', '2024-12-27', '60000.00', 'Terminé', 'Location Bureau'),
(5, 11, 1, '2024-12-29', '2024-12-29', '150000.00', 'Actif', 'Location Appartement');

-- --------------------------------------------------------

--
-- Structure de la table `locataires`
--

CREATE TABLE `locataires` (
  `id` int NOT NULL,
  `nomComplet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(15) DEFAULT NULL,
  `adresse` text,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `locataires`
--

INSERT INTO `locataires` (`id`, `nomComplet`, `email`, `telephone`, `adresse`, `date`) VALUES
(8, 'Allassane Dia', 'allassane@gmail.com', '778965253', 'Parcelle Assainies', '2024-11-06'),
(9, 'Fallou Diop', 'fallou@gmail.com', '774562125', 'Patte D\'oie', '2024-12-04'),
(11, 'Omar Diop', 'omar@gmail.com', '777756547', 'Touba Liberte 6', '2025-01-03');

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id` int NOT NULL,
  `contrat_id` int NOT NULL,
  `montant_total` int NOT NULL,
  `montant_paye` decimal(10,2) NOT NULL,
  `mois` varchar(255) NOT NULL,
  `montant_restant` decimal(10,2) NOT NULL,
  `date_paiement` datetime DEFAULT CURRENT_TIMESTAMP,
  `methode_paiement` enum('Espèces','Orange Money','Wave','') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `statut` enum('payé','avance','') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `paiement`
--

INSERT INTO `paiement` (`id`, `contrat_id`, `montant_total`, `montant_paye`, `mois`, `montant_restant`, `date_paiement`, `methode_paiement`, `statut`) VALUES
(9, 1, 150000, '100000.00', '12', '50000.00', '2024-12-28 20:21:12', 'Espèces', 'avance'),
(23, 1, 150000, '130000.00', '07', '20000.00', '2024-12-28 22:55:22', 'Wave', 'avance'),
(26, 5, 150000, '140000.00', '06', '10000.00', '2024-12-29 15:04:03', 'Orange Money', 'avance'),
(27, 5, 150000, '150000.00', '07', '0.00', '2024-12-29 16:23:49', 'Orange Money', 'payé');

-- --------------------------------------------------------

--
-- Structure de la table `proprietaires`
--

CREATE TABLE `proprietaires` (
  `id` int NOT NULL,
  `nomComplet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(15) DEFAULT NULL,
  `adresse` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `proprietaires`
--

INSERT INTO `proprietaires` (`id`, `nomComplet`, `email`, `telephone`, `adresse`) VALUES
(1, 'Cheikh Ibra Diop', 'lampfall@gmail.com', '777756542', 'Touba Guediawayee'),
(2, 'Mam Lamp Fall', 'cheikhibra@gmail.com', '777755544', 'Touba Parcelle');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nomComplet` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nomComplet`, `username`, `email`, `password`, `created_at`, `is_active`) VALUES
(1, 'cheikh ibra diop', 'lampfall', 'lampfall@gmail.com', 'lampfall', '2024-12-24 22:37:27', 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `biens`
--
ALTER TABLE `biens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_proprietaire_id` (`proprietaire_id`);

--
-- Index pour la table `contrats`
--
ALTER TABLE `contrats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bien_id` (`bien_id`),
  ADD KEY `fk_locataires_id` (`locataire_id`);

--
-- Index pour la table `locataires`
--
ALTER TABLE `locataires`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrat_id` (`contrat_id`);

--
-- Index pour la table `proprietaires`
--
ALTER TABLE `proprietaires`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `biens`
--
ALTER TABLE `biens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `contrats`
--
ALTER TABLE `contrats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `locataires`
--
ALTER TABLE `locataires`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `biens`
--
ALTER TABLE `biens`
  ADD CONSTRAINT `fk_proprietaire_id` FOREIGN KEY (`proprietaire_id`) REFERENCES `proprietaires` (`id`);

--
-- Contraintes pour la table `contrats`
--
ALTER TABLE `contrats`
  ADD CONSTRAINT `fk_bien_id` FOREIGN KEY (`bien_id`) REFERENCES `biens` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_locataires_id` FOREIGN KEY (`locataire_id`) REFERENCES `locataires` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`contrat_id`) REFERENCES `contrats` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
