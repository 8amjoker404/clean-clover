-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 08, 2026 at 11:00 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clover_soul`
--

-- --------------------------------------------------------

--
-- Table structure for table `grimoires`
--

CREATE TABLE `grimoires` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `magic_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grimoires`
--

INSERT INTO `grimoires` (`id`, `user_id`, `magic_type`) VALUES
(1, 1, 'Crystal');

-- --------------------------------------------------------

--
-- Table structure for table `grimoire_elements`
--

CREATE TABLE `grimoire_elements` (
  `id` int(11) NOT NULL,
  `element_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grimoire_elements`
--

INSERT INTO `grimoire_elements` (`id`, `element_name`) VALUES
(8, 'Crystal'),
(7, 'Dark'),
(4, 'Earth'),
(1, 'Fire'),
(5, 'Light'),
(6, 'Spatial'),
(2, 'Water'),
(3, 'Wind');

-- --------------------------------------------------------

--
-- Table structure for table `spells`
--

CREATE TABLE `spells` (
  `id` int(11) NOT NULL,
  `grimoire_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `mp_cost` int(11) NOT NULL,
  `spell_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `squads`
--

CREATE TABLE `squads` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `passive_buff` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `squads`
--

INSERT INTO `squads` (`id`, `name`, `passive_buff`) VALUES
(1, 'Golden Dawn', '+10% Max MP'),
(2, 'Silver Eagles', '+10% Magic Defense'),
(3, 'Black Bulls', 'Limit Break damage is higher'),
(4, 'Crimson Lion Kings', '+10% Physical Attack Damage'),
(5, 'Blue Rose Knights', 'Faster MP Regeneration'),
(6, 'Green Mantis', 'Higher chance for Critical Hits'),
(7, 'Coral Peacocks', 'Higher \"Creativity\" bonus score'),
(8, 'Azure Deer', 'Reduced cost for Combo spells'),
(9, 'Purple Orcas', 'Earn 15% more Yul from missions');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `squad_id` int(11) DEFAULT NULL,
  `rank` int(11) DEFAULT 1000,
  `merit` int(11) DEFAULT 0,
  `yul` int(11) DEFAULT 0,
  `hp` int(11) DEFAULT 100,
  `max_hp` int(11) DEFAULT 100,
  `mp` int(11) DEFAULT 100,
  `max_mp` int(11) DEFAULT 100,
  `is_cracked` tinyint(1) DEFAULT 0,
  `tutorial_stage` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `squad_id`, `rank`, `merit`, `yul`, `hp`, `max_hp`, `mp`, `max_mp`, `is_cracked`, `tutorial_stage`) VALUES
(1, 'light', '8amlight@gmail.com', '$2b$10$PY.nECWnaPrdfZ4zx8h28O2lwPEAy.CduTPwpxMZqy6/yGaJNB2E2', NULL, 1000, 0, 0, 100, 100, 80, 100, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `grimoires`
--
ALTER TABLE `grimoires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `grimoire_elements`
--
ALTER TABLE `grimoire_elements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `element_name` (`element_name`);

--
-- Indexes for table `spells`
--
ALTER TABLE `spells`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grimoire_id` (`grimoire_id`);

--
-- Indexes for table `squads`
--
ALTER TABLE `squads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `squad_id` (`squad_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `grimoires`
--
ALTER TABLE `grimoires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `grimoire_elements`
--
ALTER TABLE `grimoire_elements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `spells`
--
ALTER TABLE `spells`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `squads`
--
ALTER TABLE `squads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `grimoires`
--
ALTER TABLE `grimoires`
  ADD CONSTRAINT `grimoires_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `spells`
--
ALTER TABLE `spells`
  ADD CONSTRAINT `spells_ibfk_1` FOREIGN KEY (`grimoire_id`) REFERENCES `grimoires` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`squad_id`) REFERENCES `squads` (`id`);

--
-- Migration safety: create spells table if missing
--
CREATE TABLE IF NOT EXISTS spells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  spell_name VARCHAR(100) NOT NULL,
  mp_cost INT DEFAULT 20,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
