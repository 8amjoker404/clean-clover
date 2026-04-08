-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 08, 2026 at 04:29 PM
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
-- Table structure for table `active_missions`
--

CREATE TABLE `active_missions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'in_progress',
  `current_enemy_hp` int(11) DEFAULT 100,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_history`
--

CREATE TABLE `exam_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage` int(11) NOT NULL,
  `action` text DEFAULT NULL,
  `narrative` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_history`
--

INSERT INTO `exam_history` (`id`, `user_id`, `stage`, `action`, `narrative`, `created_at`) VALUES
(1, 1, 1, 'I focus my mana and blast the bronze dummy with my elemental magic!', 'The sun beats down on the Royal Capital’s training grounds, reflecting off the cold, metallic surface of the bronze dummy standing resolute at the center of the arena. Thousands of eyes are upon you, but none pierce deeper than those of the Magic Knight Captains peering down from the high balcony. Yami Sukehiro leans lazily against the stone railing, exhaling a cloud of smoke, while William Vangeance watches with a faint, unreadable smile. Nozel Silva’s gaze is as sharp as a blade, silently judging your worth before you’ve even moved a muscle.\n\nYou plant your feet, feeling the reserves of your internal mana coil tight within your core. You reach out, your fingertips glowing with a jagged, prismatic light. \"Crystal Magic: Crystal Shard!\" you command.\n\nWith a resonant *hum*, a jagged, razor-sharp spike of translucent crystal erupts from the air, streaking across the field like a bullet of refined earth. The sound of whistling wind is cut short by the sickening crunch of metal buckling. The crystal spear slams into the dummy’s chest with devastating force, the bronze armor cratering inward and spider-webbing with cracks before the entire construct is knocked backward, pinned against the rear wall of the arena in a shower of glittering, pulverized shards. Silence hangs in the air for a heartbeat as the dust settles, the captains eyeing the sheer destructive weight of your attack.', '2026-04-08 13:15:04'),
(2, 1, 2, 'I focus my mana and blast the bronze dummy with my elemental magic!', 'The arena air grows heavy as the bronze dummy, pinned against the wall, shudders and begins to disassemble. From the mechanical joints of the training apparatus, a hidden compartment slides open, unleashing a barrage of razor-sharp bronze discs that whirl through the air like a storm of serrated saws. They hum with a lethal, metallic shriek, homing in on your position with pinpoint accuracy.\n\nHigh above, Yami flicks his cigarette away, his eyes narrowing. \"Let\'s see if he\'s got more than just a heavy punch,\" he grumbles. Nozel Silva barely shifts his posture, his silver hair catching the light, his expression one of cold detachment. \"Offense is common,\" he murmurs, his voice carrying down to the floor. \"Survival is the test of a true mage.\"\n\nYou brace yourself, the incoming discs blurring into a gold-tinted vortex of death. As you desperately search for a way to stop the onslaught, your Grimoire—bound in battered, enchanted leather—begins to vibrate against your hip. A radiant, crystalline luminescence pulses from its cover. With a rhythmic *thwack*, the pages fan open of their own accord, settling on a blank leaf that begins to etch itself with shimmering, jagged sigils. \n\nInstinct takes over. You slam your hand onto the open page, flooding it with your remaining mana. \"Crystal Magic: Crystalline Bastion!\" you scream. \n\nA wall of dense, multifaceted crystals erupts from the ground in front of you, growing with explosive speed. The bronze discs strike the surface with a deafening cacophony of ringing steel, embedding themselves deep into the translucent, reinforced prism, unable to pierce through. You stand behind your shimmering shield, breathless, as the metal debris clatters to the sand. The captains remain silent, watching the refracted light dance across the arena floor, the test of your endurance now etched into the record.', '2026-04-08 13:15:28'),
(5, 1, 3, 'i use my Crystalline Bastion with my elemental magic!', 'The air in the arena crackles with tension as the smoke from the shattered bronze dummy clears. Before you can even catch your breath, the ground tremors. A massive iron gate slides open at the opposite end of the field, and a rival examinee steps out—a towering mage draped in tattered robes, his hands wreathed in roiling, unstable flame. He doesn\'t waste time with pleasantries. With a roar, he thrusts his palms forward, launching a torrent of searing fire that roars toward you like a tidal wave of molten gold.\n\nHigh above, the balcony erupts with quiet intensity. Fueled by the adrenaline of your successful defense, you don\'t retreat. As the flames lash out, you slam your palm against the ground. \"Crystal Magic: Crystalline Bastion!\" The jagged wall erupts once more, but this time, you don\'t just stand behind it. You weave your mana through the crystalline lattice, feeling the heat intensify as the fire washes over your construct. \n\n\"Now!\" you grit out. You channel the residual heat and the structural integrity of the wall, surging forward as the barrier begins to crack. As the flames dissipate, leaving your rival exposed and momentarily stunned by your endurance, you thrust your hand forward. \"Crystal Shard!\" \n\nYou don\'t just fire one; you strike at the base of your own Bastion, shattering the structure into a thousand razor-sharp projectiles that catch the fire mage mid-stride. The crystalline shrapnel overwhelms his flames, pinning his robes to the sand and knocking the wind out of him. He collapses, defeated, his magic flickering out into gray wisps of smoke.\n\nYami Sukehiro lets out a low, impressed whistle, leaning forward over the railing. \"He used his own defense to create a counter-attack. Not bad, kid. Not bad at all.\" Nozel Silva stares down, his cold eyes unblinking, yet he offers a singular, stiff nod of acknowledgment. William Vangeance watches with a soft, satisfied smile, his eyes tracking the lingering glimmer of your magic as it fades into the sand. You stand in the center of the arena, the victor, your mana pool drained but your potential clear for all to see.', '2026-04-08 13:28:15');

-- --------------------------------------------------------

--
-- Table structure for table `exam_results`
--

CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `grade` varchar(2) DEFAULT NULL,
  `available_squads` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_results`
--

INSERT INTO `exam_results` (`id`, `user_id`, `grade`, `available_squads`, `created_at`, `updated_at`) VALUES
(1, 1, 'A', '[1,2,3,4,5,6,7,8,9]', '2026-04-08 13:28:15', '2026-04-08 13:28:15');

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
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `effect_value` int(11) DEFAULT 0,
  `price` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `missions`
--

CREATE TABLE `missions` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `difficulty` varchar(50) DEFAULT 'D-Rank',
  `rank_required` int(11) DEFAULT 1000,
  `yul_reward` int(11) DEFAULT 0,
  `merit_reward` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Dumping data for table `spells`
--

INSERT INTO `spells` (`id`, `grimoire_id`, `name`, `mp_cost`, `spell_type`) VALUES
(1, 1, 'Crystalline Bastion', 20, 'defensive');

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
  `tutorial_stage` int(11) DEFAULT 1,
  `role` varchar(20) DEFAULT 'player'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `squad_id`, `rank`, `merit`, `yul`, `hp`, `max_hp`, `mp`, `max_mp`, `is_cracked`, `tutorial_stage`, `role`) VALUES
(1, 'light', '8amlight@gmail.com', '$2b$10$PY.nECWnaPrdfZ4zx8h28O2lwPEAy.CduTPwpxMZqy6/yGaJNB2E2', 3, 1000, 0, 0, 90, 100, 55, 100, 0, 1000, 'player'),
(2, 'joker', '8amjoker@gmail.com', '$2b$10$PY.nECWnaPrdfZ4zx8h28O2lwPEAy.CduTPwpxMZqy6/yGaJNB2E2', 3, 1000, 0, 0, 90, 100, 55, 100, 0, 1000, 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_missions`
--
ALTER TABLE `active_missions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `mission_id` (`mission_id`);

--
-- Indexes for table `exam_history`
--
ALTER TABLE `exam_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_user` (`user_id`),
  ADD KEY `idx_exam_stage` (`stage`);

--
-- Indexes for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_exam_results_user_id` (`user_id`),
  ADD KEY `idx_exam_results_user_id` (`user_id`);

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
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `missions`
--
ALTER TABLE `missions`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT for table `active_missions`
--
ALTER TABLE `active_missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_history`
--
ALTER TABLE `exam_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `exam_results`
--
ALTER TABLE `exam_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `missions`
--
ALTER TABLE `missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spells`
--
ALTER TABLE `spells`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `squads`
--
ALTER TABLE `squads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `active_missions`
--
ALTER TABLE `active_missions`
  ADD CONSTRAINT `active_missions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `active_missions_ibfk_2` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_history`
--
ALTER TABLE `exam_history`
  ADD CONSTRAINT `fk_exam_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD CONSTRAINT `fk_exam_results_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grimoires`
--
ALTER TABLE `grimoires`
  ADD CONSTRAINT `grimoires_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
