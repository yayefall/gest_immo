-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mar. 21 jan. 2025 à 20:47
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
(1, 'Appartement', 'touba guediawaye', '200.00', 3, '150000.00', 1),
(2, 'Maison', 'Cité Fadia', '650.00', 4, '170000.00', 1);

-- --------------------------------------------------------

--
-- Structure de la table `cautions`
--

CREATE TABLE `cautions` (
  `id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_depot` date NOT NULL,
  `contrat_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `cautions`
--

INSERT INTO `cautions` (`id`, `montant`, `date_depot`, `contrat_id`, `created_at`) VALUES
(1, '450000.00', '2025-01-17', 6, '2025-01-17 20:13:41'),
(2, '510000.00', '2025-01-17', 7, '2025-01-17 21:53:15'),
(36, '450000.00', '2025-01-21', 8, '2025-01-21 20:40:52');

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
(6, 8, 1, '2024-10-11', '2025-03-11', '150000.00', 'Actif', 'location_Apt_Allassane'),
(7, 9, 2, '2024-05-11', '2025-06-11', '170000.00', 'Actif', 'Location_Maison_Fallou'),
(8, 11, 1, '2024-04-21', '2025-01-21', '150000.00', 'Actif', 'Location_Apt_Omar');

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
  `statut` enum('payé','avance','payer_plus') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `paiement`
--

INSERT INTO `paiement` (`id`, `contrat_id`, `montant_total`, `montant_paye`, `mois`, `montant_restant`, `date_paiement`, `methode_paiement`, `statut`) VALUES
(49, 8, 150000, '100000.00', '02', '50000.00', '2025-01-16 14:06:06', 'Wave', 'avance'),
(56, 6, 150000, '200000.00', '03', '50000.00', '2025-01-16 16:51:51', 'Wave', 'payer_plus'),
(57, 8, 150000, '50000.00', '04', '100000.00', '2025-01-17 08:31:55', 'Orange Money', 'avance'),
(60, 6, 150000, '250000.00', '06', '100000.00', '2025-01-17 09:57:36', 'Wave', 'payer_plus'),
(61, 7, 170000, '70000.00', '03', '100000.00', '2025-01-17 10:02:19', 'Espèces', 'avance'),
(64, 6, 150000, '300000.00', '01', '150000.00', '2025-01-17 11:56:31', 'Espèces', 'payer_plus'),
(65, 7, 340000, '300000.00', '01,02', '40000.00', '2025-01-17 12:11:44', 'Espèces', 'avance'),
(66, 8, 300000, '300000.00', '01,04', '0.00', '2025-01-17 12:14:19', 'Orange Money', 'payé'),
(67, 8, 150000, '100000.00', '01', '50000.00', '2025-01-17 12:18:13', 'Wave', 'avance'),
(68, 7, 680000, '500000.00', '01,02,03,04', '180000.00', '2025-01-17 12:21:11', 'Espèces', 'avance'),
(69, 8, 450000, '500000.00', '01,02,03', '50000.00', '2025-01-17 12:30:09', 'Espèces', 'payer_plus'),
(70, 6, 450000, '400000.00', '01,02,03', '50000.00', '2025-01-17 14:29:56', 'Espèces', 'avance'),
(71, 7, 510000, '600000.00', '01,02,03', '90000.00', '2025-01-17 14:31:26', 'Wave', 'payer_plus'),
(72, 8, 150000, '150000.00', '01', '0.00', '2025-01-17 14:36:16', 'Espèces', 'payé'),
(73, 6, 300000, '250000.00', '01,06', '50000.00', '2025-01-17 23:36:37', 'Orange Money', 'avance'),
(75, 7, 170000, '150000.00', '01', '20000.00', '2025-01-17 23:45:37', 'Orange Money', 'avance'),
(76, 8, 300000, '350000.00', '02,01', '50000.00', '2025-01-17 23:56:37', 'Espèces', 'payer_plus'),
(77, 7, 340000, '340000.00', '02,03', '0.00', '2025-01-18 00:01:31', 'Orange Money', 'payé'),
(79, 6, 150000, '200000.00', '01', '50000.00', '2025-01-21 20:29:00', 'Espèces', 'payer_plus'),
(80, 8, 150000, '150000.00', '02', '0.00', '2025-01-21 20:32:52', 'Wave', 'payé');

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
(1, 'cheikh ibra diop', 'lampfall', 'lampfall@gmail.com', '$2b$10$io4g55MQSvbZBTS0VkBfU.dvK2NGKw6qRmKSnp4m3rVCrQxhl08.S', '2024-12-24 22:37:27', 1),
(5, 'Bocar Anne', 'bocaranne', 'bocaranne@gmail.com', '$2b$10$zkg6c10ipVPW/2ECbaWrWe/dUjXyAuih47l5wbmhAd4w53vFD0kBi', '2025-01-11 17:40:40', 1),
(10, 'Bigué Mr Ba', 'bigueba', 'bigue@gmail.com', '$2b$10$kJv1bSe58jhjxgJ8ZaIDaeJckCJVygXus6OsEJMNKuwmdL0Wr2og.', '2025-01-17 12:37:11', 1);

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
-- Index pour la table `cautions`
--
ALTER TABLE `cautions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrat_id` (`contrat_id`);

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
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT pour la table `cautions`
--
ALTER TABLE `cautions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT pour la table `proprietaires`
--
ALTER TABLE `proprietaires`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cautions`
--
ALTER TABLE `cautions`
  ADD CONSTRAINT `cautions_ibfk_1` FOREIGN KEY (`contrat_id`) REFERENCES `contrats` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
