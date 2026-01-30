-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 30, 2026 at 05:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rp_website`
--

-- --------------------------------------------------------

--
-- Table structure for table `business_logs`
--

CREATE TABLE `business_logs` (
  `business_log_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `origin` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `affected_entity_type` varchar(50) DEFAULT NULL,
  `affected_entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_login_id` int(10) UNSIGNED DEFAULT NULL,
  `context_data` text DEFAULT NULL,
  `user_login_id_plain` varchar(255) DEFAULT NULL,
  `user_login_email_plain` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_logs`
--

INSERT INTO `business_logs` (`business_log_id`, `created_at`, `origin`, `event_type`, `module`, `description`, `affected_entity_type`, `affected_entity_id`, `user_login_id`, `context_data`, `user_login_id_plain`, `user_login_email_plain`) VALUES
(1, '2026-01-28 14:30:09', '127.0.0.1', 'create', 'News', 'Vytvoření nové novinky: test', 'News', 1, NULL, '{\"title\":\"test\",\"thema\":\"Novinka\",\"author\":\"Jon\\u00e1\\u0161 Bu\\u010dina\",\"message\":\"test\",\"bullet_1\":\"jedna\",\"bullet_2\":\"dva\",\"bullet_3\":\"tri\",\"bullet_4\":\"ctyry\"}', '', NULL),
(2, '2026-01-28 14:30:19', '127.0.0.1', 'update', 'News', 'Aktualizace novinky: testING', 'News', 1, NULL, '{\"id\":1,\"title\":\"testING\",\"message\":\"test\",\"author\":\"Jon\\u00e1\\u0161 Bu\\u010dina\",\"thema\":\"Novinka\",\"bullet_1\":\"jedna\",\"bullet_2\":\"dva\",\"bullet_3\":\"tri\",\"bullet_4\":\"ctyry\",\"created_at\":\"2026-01-28T13:30:09.000000Z\",\"updated_at\":\"2026-01-28T13:30:09.000000Z\",\"deleted_at\":null}', '', NULL),
(3, '2026-01-28 14:30:23', '127.0.0.1', 'soft_delete', 'News', 'Soft smazání novinky', 'News', 1, NULL, '[]', '', NULL),
(4, '2026-01-28 14:30:30', '127.0.0.1', 'restore', 'News', 'Obnova smazané novinky', 'News', 1, NULL, '[]', '', NULL),
(5, '2026-01-28 14:30:37', '127.0.0.1', 'soft_delete', 'News', 'Soft smazání novinky', 'News', 1, NULL, '[]', '', NULL),
(6, '2026-01-28 14:30:41', '127.0.0.1', 'hard_delete', 'News', 'Trvalé smazání novinky', 'News', 1, NULL, '{\"force_delete\":\"true\"}', '', NULL),
(7, '2026-01-28 14:30:59', '127.0.0.1', 'create', 'News', 'Vytvoření nové novinky: Test', 'News', 2, NULL, '{\"title\":\"Test\",\"thema\":\"Miln\\u00edk\",\"author\":\"Jon\\u00e1\\u0161 Bu\\u010dina\",\"message\":\"test test test\",\"bullet_1\":\"jedna\",\"bullet_2\":\"dva\",\"bullet_3\":null,\"bullet_4\":null}', '', NULL),
(8, '2026-01-28 14:31:30', '127.0.0.1', 'create', 'News', 'Vytvoření nové novinky: fsdff', 'News', 3, NULL, '{\"title\":\"fsdff\",\"thema\":\"Miln\\u00edk\",\"author\":\"sdfsdf\",\"message\":\"sddfsdf\",\"bullet_1\":\"XDXDXD\",\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '', NULL),
(9, '2026-01-28 14:31:53', '127.0.0.1', 'update', 'News', 'Aktualizace novinky: Test', 'News', 2, NULL, '{\"id\":2,\"title\":\"Test\",\"message\":\"test test test\",\"author\":\"Jon\\u00e1\\u0161 Bu\\u010dina\",\"thema\":\"Miln\\u00edk\",\"bullet_1\":\"jedna\",\"bullet_2\":\"dva\",\"bullet_3\":\"tru\",\"bullet_4\":\"try\",\"created_at\":\"2026-01-28T13:30:59.000000Z\",\"updated_at\":\"2026-01-28T13:30:59.000000Z\",\"deleted_at\":null}', '', NULL),
(10, '2026-01-28 14:39:19', '127.0.0.1', 'create', 'News', 'Vytvořeno: testing', NULL, 4, NULL, NULL, NULL, NULL),
(11, '2026-01-28 14:39:31', '127.0.0.1', 'update', 'News', 'Upraveno: testing', NULL, 4, NULL, NULL, NULL, NULL),
(12, '2026-01-29 19:33:37', '127.0.0.1', 'create', 'News', 'Vytvořeno: asd', NULL, 5, NULL, NULL, NULL, NULL),
(13, '2026-01-29 19:33:45', '127.0.0.1', 'create', 'News', 'Vytvořeno: jhkj', NULL, 6, NULL, NULL, NULL, NULL),
(14, '2026-01-29 19:33:54', '127.0.0.1', 'create', 'News', 'Vytvořeno: hjkhkjh', NULL, 7, NULL, NULL, NULL, NULL),
(15, '2026-01-29 19:34:03', '127.0.0.1', 'create', 'News', 'Vytvořeno: hjgjhg', NULL, 8, NULL, NULL, NULL, NULL),
(16, '2026-01-29 19:39:58', '127.0.0.1', 'update', 'News', 'Upraveno: hjgjhg', NULL, 8, NULL, NULL, NULL, NULL),
(17, '2026-01-29 19:40:04', '127.0.0.1', 'update', 'News', 'Upraveno: hjkhkjh', NULL, 7, NULL, NULL, NULL, NULL),
(18, '2026-01-29 19:40:09', '127.0.0.1', 'update', 'News', 'Upraveno: jhkj', NULL, 6, NULL, NULL, NULL, NULL),
(19, '2026-01-29 19:40:15', '127.0.0.1', 'update', 'News', 'Upraveno: asd', NULL, 5, NULL, NULL, NULL, NULL),
(20, '2026-01-29 19:40:21', '127.0.0.1', 'update', 'News', 'Upraveno: fsdff', NULL, 3, NULL, NULL, NULL, NULL),
(21, '2026-01-29 19:44:38', '127.0.0.1', 'create', 'News', 'Vytvořeno: Spuštění sekce novinek', NULL, 9, NULL, NULL, NULL, NULL),
(22, '2026-01-29 19:52:25', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 11, NULL, '{\"thema\":\"test\",\"contact_email\":\"stese@csd.cz\",\"contact_phone\":null,\"order_description\":\"kjlj\",\"note\":null,\"status\":\"Nov\\u011b zadan\\u00e9\",\"priority\":\"N\\u00edzk\\u00e1\"}', '', NULL),
(23, '2026-01-29 19:54:23', '127.0.0.1', 'create', 'News', 'Vytvořeno: test', NULL, 10, NULL, NULL, NULL, NULL),
(24, '2026-01-29 19:56:30', '127.0.0.1', 'create', 'News', 'Vytvořeno: máslo', 'App\\Models\\News', 11, NULL, '{\"title\":\"máslo\",\"message\":\"sdfsdf\",\"author\":\"sdfds\",\"thema\":\"Update\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', NULL, NULL),
(25, '2026-01-29 19:57:09', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen nový lead: jjkhkjh', 'SalesLead', 10, 25, '{\"subject_name\":\"jjkhkjh\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-28\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(26, '2026-01-29 19:58:40', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: jonas', 'News', 12, NULL, '{\"title\":\"jonas\",\"thema\":\"Update\",\"author\":\"jonas\",\"message\":\"fjsdfk\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '0', 'system'),
(27, '2026-01-29 20:00:07', '127.0.0.1', 'soft_delete', 'News', 'Soft smazání novinky: jonas', 'App\\Models\\News', 12, NULL, '[]', '0', 'unauthenticated/system'),
(28, '2026-01-29 20:01:01', '127.0.0.1', 'soft_delete', 'News', 'Soft smazání novinky: máslo', 'App\\Models\\News', 11, 25, '[]', '25', 'joncl'),
(29, '2026-01-29 23:01:58', '127.0.0.1', 'create', 'News', 'Vytvořeno: asd', NULL, 13, NULL, NULL, NULL, 'joncl'),
(30, '2026-01-29 23:03:47', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: JJJJ', 'News', 14, 25, '{\"title\":\"JJJJ\",\"thema\":\"Info\",\"author\":\"kjklk\",\"message\":\"kjl\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(31, '2026-01-29 23:04:10', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: JJJJ', 'News', 14, 25, '[]', '25', 'joncl'),
(32, '2026-01-29 23:04:15', '127.0.0.1', 'hard_delete', 'News', 'Trvalé smazání novinky ID: 14 (původní název: JJJJ)', 'News', 14, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(33, '2026-01-29 23:04:19', '127.0.0.1', 'restore', 'News', 'Obnovení novinky z koše: máslo', 'News', 11, 25, '[]', '25', 'joncl'),
(34, '2026-01-29 23:04:24', '127.0.0.1', 'bulk_hard_delete', 'News', 'Hromadné trvalé smazání všech položek v koši. Počet: 10', 'News', NULL, 25, '[]', '25', 'joncl'),
(35, '2026-01-29 23:04:53', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Soft smazání požadavku na provizi', 'RawRequestCommission', 11, 25, '[]', '25', 'joncl'),
(36, '2026-01-29 23:05:04', '127.0.0.1', 'soft_delete', 'SalesLead', 'Soft smazání leadu: jjkhkjh', 'SalesLead', 10, 25, '[]', '25', 'joncl'),
(37, '2026-01-30 15:04:51', '127.0.0.1', 'hard_delete', 'RawRequestCommission', 'Trvalé smazání požadavku na provizi', 'RawRequestCommission', 11, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(38, '2026-01-30 15:04:58', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: máslo', 'News', 11, 25, '[]', '25', 'joncl'),
(39, '2026-01-30 15:08:58', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 12, NULL, '{\"thema\":\"test\",\"contact_email\":\"sdsf@sfd.ch\",\"contact_phone\":null,\"order_description\":\"sdklfj\",\"note\":null,\"status\":\"Nově zadané\",\"priority\":\"Nízká\"}', '0', 'system'),
(40, '2026-01-30 15:09:09', '127.0.0.1', 'update', 'RawRequestCommission', 'Aktualizace požadavku na provizi', 'RawRequestCommission', 12, 25, '{\"id\":12,\"thema\":\"test33\",\"contact_email\":\"sdsf@sfd.ch\",\"contact_phone\":null,\"order_description\":\"sdklfj\",\"status\":\"Nově zadané\",\"priority\":\"Nízká\",\"note\":null,\"created_at\":\"2026-01-30T14:08:58.000000Z\",\"updated_at\":\"2026-01-30T14:08:58.000000Z\",\"deleted_at\":null}', '25', 'joncl'),
(41, '2026-01-30 15:09:12', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 12, 25, '[]', '25', 'joncl'),
(42, '2026-01-30 15:09:18', '127.0.0.1', 'restore', 'RawRequestCommission', 'Obnova smazaného požadavku', 'RawRequestCommission', 12, 25, '[]', '25', 'joncl'),
(43, '2026-01-30 15:09:23', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 12, 25, '[]', '25', 'joncl'),
(44, '2026-01-30 15:09:29', '127.0.0.1', 'hard_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 12, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(45, '2026-01-30 15:15:11', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: test', 'SalesLead', 11, 25, '{\"subject_name\":\"test\",\"contact_person\":null,\"contact_email\":\"asfdsfsd@sdf.cz\",\"contact_phone\":\"555555555\",\"contact_other\":\"žžž\",\"location\":\"jlkk\",\"source_channel\":\"Instagram\",\"source_url\":\"jhk\",\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(46, '2026-01-30 15:15:36', '127.0.0.1', 'update', 'SalesLead', 'Aktualizace leadu: test222', 'SalesLead', 11, 25, '{\"id\":11,\"user_login_id\":25,\"salesman_name\":\"joncl\",\"first_contact_date\":\"2025-12-28T23:00:00.000000Z\",\"subject_name\":\"test222\",\"contact_person\":null,\"contact_email\":\"asfdsfsd@sdf.cz\",\"contact_phone\":\"555555555\",\"contact_other\":\"žžž\",\"location\":\"jlkk\",\"source_channel\":\"Instagram\",\"source_url\":\"jhk\",\"description\":null,\"priority\":\"Nízká\",\"status\":\"nové\",\"last_contact_date\":null,\"next_step\":null,\"rejection_reason\":null,\"created_at\":\"2026-01-30 15:15:11\",\"updated_at\":\"2026-01-30 15:15:11\",\"deleted_at\":null}', '25', 'joncl'),
(47, '2026-01-30 15:15:39', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 11', 'SalesLead', 11, 25, '[]', '25', 'joncl'),
(48, '2026-01-30 15:15:45', '127.0.0.1', 'hard_delete', 'SalesLead', 'Smazání leadu ID: 10', 'SalesLead', 10, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(49, '2026-01-30 15:15:49', '127.0.0.1', 'force_delete_all', 'SalesLead', 'Smazání koše leadů. Počet: 1', 'SalesLead', NULL, 25, '[]', '25', 'joncl'),
(50, '2026-01-30 15:16:03', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: jkhkjh', 'SalesLead', 12, 25, '{\"subject_name\":\"jkhkjh\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(51, '2026-01-30 15:16:06', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 12', 'SalesLead', 12, 25, '[]', '25', 'joncl'),
(52, '2026-01-30 15:16:12', '127.0.0.1', 'restore', 'SalesLead', 'Obnova leadu: jkhkjh', 'SalesLead', 12, 25, '[]', '25', 'joncl'),
(53, '2026-01-30 15:16:18', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 12', 'SalesLead', 12, 25, '[]', '25', 'joncl'),
(54, '2026-01-30 15:16:23', '127.0.0.1', 'hard_delete', 'SalesLead', 'Smazání leadu ID: 12', 'SalesLead', 12, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(55, '2026-01-30 15:28:10', '127.0.0.1', 'create', 'UserLogin', 'Vytvořen uživatel: guest_1', 'UserLogin', 32, 25, 'Context data vynechána', '25', 'joncl'),
(56, '2026-01-30 15:28:19', '127.0.0.1', 'update', 'UserLogin', 'Aktualizace: guest_12', 'UserLogin', 32, 25, '{\"id\":32,\"user_email\":\"guest_12\",\"contact_email\":null,\"full_name\":\"Guest\",\"birth_date\":null,\"personal_id_num\":null,\"address\":null,\"bank_account\":null,\"health_insurance\":null,\"commission_rate\":0,\"dpp_hours_spent\":0,\"has_tax_declaration\":false,\"phone_number\":null,\"internal_note\":null,\"last_login_at\":null,\"is_deleted\":false,\"created_at\":\"2026-01-30T14:28:10.000000Z\",\"updated_at\":\"2026-01-30T14:28:10.000000Z\",\"deleted_at\":null,\"roles\":[{\"role_id\":2,\"role_name\":\"admin\",\"description\":null,\"created_at\":\"2025-08-17T07:46:27.000000Z\",\"updated_at\":\"2025-08-17T07:46:27.000000Z\",\"deleted_at\":null}],\"user_permissions\":[\"view-personal-info\",\"view-user-requests\",\"view-dashboard\",\"view-deleted\",\"view-sales-leads\"],\"role_id\":2}', '25', 'joncl'),
(57, '2026-01-30 15:28:35', '127.0.0.1', 'soft_delete', 'UserLogin', 'Smazání uživatele ID: 32', 'UserLogin', 32, 25, '{\"id\":32,\"email\":\"guest_12\",\"roles\":[\"admin\"]}', '25', 'joncl'),
(58, '2026-01-30 15:28:42', '127.0.0.1', 'restore', 'UserLogin', 'Obnova: guest_12', 'UserLogin', 32, 25, 'Context data vynechána', '25', 'joncl'),
(59, '2026-01-30 15:50:18', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 13, NULL, '{\"thema\":\"JONKOJONCLasdsad\",\"contact_email\":\"d@d.cz\",\"contact_phone\":null,\"order_description\":\"asdsad\",\"note\":null,\"status\":\"Zpracovává se\",\"priority\":\"Nízká\"}', '0', 'system'),
(60, '2026-01-30 15:52:44', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 14, NULL, '{\"thema\":\"GAMBA\",\"contact_email\":\"asd@asd.cz\",\"contact_phone\":null,\"order_description\":\"asfsd\",\"note\":null,\"status\":\"Nově zadané\",\"priority\":\"Nízká\"}', '0', 'system/guest'),
(61, '2026-01-30 15:54:04', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: testLEAD', 'SalesLead', 13, 25, '{\"subject_name\":\"testLEAD\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(62, '2026-01-30 15:54:21', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 15, NULL, '{\"thema\":\"JOOOO\",\"contact_email\":\"asd@sf.cz\",\"contact_phone\":null,\"order_description\":\"sdf\",\"note\":null,\"status\":\"Nově zadané\",\"priority\":\"Nízká\"}', '0', 'system/guest'),
(63, '2026-01-30 15:58:50', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 16, 25, '{\"thema\":\"NOVE\",\"contact_email\":\"sdf@sdf.cz\",\"contact_phone\":null,\"order_description\":\"sdf\",\"note\":null,\"status\":\"Zrušeno\",\"priority\":\"Nízká\"}', '25', 'joncl'),
(64, '2026-01-30 15:59:54', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 17, 25, '{\"thema\":\"asdasd\",\"contact_email\":\"asd@asdf.cz\",\"contact_phone\":null,\"order_description\":\"sdf\",\"note\":null,\"status\":\"Nově zadané\",\"priority\":\"Nízká\"}', '25', 'joncl'),
(65, '2026-01-30 16:22:12', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 18, 25, '{\"thema\":\"Desktopový vývoj\",\"contact_email\":\"navstevnik@sdfsdf.cz\",\"contact_phone\":null,\"order_description\":\"jojo chci\",\"dataProcessingAgreement\":true}', '25', 'joncl'),
(66, '2026-01-30 16:23:21', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 19, NULL, '{\"thema\":\"Webový vývoj\",\"contact_email\":\"odhlasen@sf.cz\",\"contact_phone\":null,\"order_description\":\"jkh\",\"dataProcessingAgreement\":true}', '0', 'Veřejný web (Anonym)'),
(67, '2026-01-30 16:24:17', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 20, 25, '{\"thema\":\"test\",\"contact_email\":\"sdfsdf@sdf.cu\",\"contact_phone\":null,\"order_description\":\"jhkj\",\"note\":null,\"status\":\"Nově zadané\",\"priority\":\"Nízká\"}', '25', 'joncl'),
(68, '2026-01-30 16:24:39', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: sdfsdff', 'SalesLead', 14, 25, '{\"subject_name\":\"sdfsdff\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(69, '2026-01-30 16:36:19', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 13, 25, '[]', '25', 'joncl'),
(70, '2026-01-30 16:37:32', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: asdasd', 'SalesLead', 15, 25, '{\"subject_name\":\"asdasd\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(71, '2026-01-30 16:38:50', '127.0.0.1', 'update', 'Translation', 'Update cz.json. Changes: 5', 'Translation', NULL, 25, '{\"lg\":\"cz\",\"df\":\"CHNG:faq.question_1(Jaké typy ->Jaké typy ) | NEW:projects.project_3.client() | NEW:projects.project_4.client() | NEW:projects.project_5.client() | NEW:services.services.item_6.message()\"}', '25', 'joncl'),
(72, '2026-01-30 16:38:55', '127.0.0.1', 'update', 'Translation', 'Update cz.json. Changes: 5', 'Translation', NULL, 25, '{\"lg\":\"cz\",\"df\":\"CHNG:faq.question_1(Jaké typy ->Jaké typy ) | NEW:projects.project_3.client() | NEW:projects.project_4.client() | NEW:projects.project_5.client() | NEW:services.services.item_6.message()\"}', '25', 'joncl'),
(73, '2026-01-30 16:48:38', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: sfsdfsd', 'SalesLead', 16, 25, '{\"subject_name\":\"sfsdfsd\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(74, '2026-01-30 16:48:47', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: mn', 'SalesLead', 17, 25, '{\"subject_name\":\"mn\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(75, '2026-01-30 16:48:57', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: mnkj', 'SalesLead', 18, 25, '{\"subject_name\":\"mnkj\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn\",\"source_url\":null,\"first_contact_date\":\"2025-12-29\",\"status\":\"nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(76, '2026-01-30 16:50:18', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: asd', 'News', 15, 25, '{\"title\":\"asd\",\"thema\":\"Milník\",\"author\":\"asdasd\",\"message\":\"asdasd\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(77, '2026-01-30 16:50:25', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: ssdfdsf', 'News', 16, 25, '{\"title\":\"ssdfdsf\",\"thema\":\"Milník\",\"author\":\"sdgdf\",\"message\":\"sdfsdfsdf\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(78, '2026-01-30 16:50:32', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: sdvsdv', 'News', 17, 25, '{\"title\":\"sdvsdv\",\"thema\":\"Milník\",\"author\":\"fsdf\",\"message\":\"sdfsdf\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(79, '2026-01-30 16:50:39', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: sndv,sdv', 'News', 18, 25, '{\"title\":\"sndv,sdv\",\"thema\":\"Milník\",\"author\":\"fsd\",\"message\":\"sdff\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(80, '2026-01-30 16:50:45', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: kk.jl', 'News', 19, 25, '{\"title\":\"kk.jl\",\"thema\":\"Milník\",\"author\":\"vdfb\",\"message\":\"ddfgd\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(81, '2026-01-30 16:54:08', '127.0.0.1', 'create', 'News', 'Vytvořena novinka: sdmfnsd,mfnds,mfn', 'News', 20, 25, '{\"title\":\"sdmfnsd,mfnds,mfn\",\"thema\":\"Update\",\"author\":\"ddfgdgdfg\",\"message\":\"jhkfhdg\",\"bullet_1\":null,\"bullet_2\":null,\"bullet_3\":null,\"bullet_4\":null}', '25', 'joncl'),
(82, '2026-01-30 16:55:12', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: asd', 'News', 15, 25, '[]', '25', 'joncl'),
(83, '2026-01-30 16:55:20', '127.0.0.1', 'restore', 'News', 'Obnovení novinky z koše: asd', 'News', 15, 25, '[]', '25', 'joncl'),
(84, '2026-01-30 16:55:23', '127.0.0.1', 'restore', 'News', 'Obnovení novinky z koše: máslo', 'News', 11, 25, '[]', '25', 'joncl');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(10, '2025_07_10_155210_create_personal_access_tokens_table', 3),
(11, '2025_07_15_101409_create_refresh_tokens_table', 3),
(12, '2025_07_10_075603_create_raw_request_commissions_table', 4);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `thema` varchar(255) NOT NULL,
  `bullet_1` varchar(255) DEFAULT NULL,
  `bullet_2` varchar(255) DEFAULT NULL,
  `bullet_3` varchar(255) DEFAULT NULL,
  `bullet_4` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `message`, `author`, `thema`, `bullet_1`, `bullet_2`, `bullet_3`, `bullet_4`, `created_at`, `updated_at`, `deleted_at`) VALUES
(9, 'Spuštění sekce novinek', 'První spuštění sekce novinek na našem interním webu, přehled událostí, novinek, upozornění a akcí. Slouží jako informační kanál pro zaměstnance veškeré důležité události budou publikovány zejména zde.', 'Systém', 'Milník', NULL, NULL, NULL, NULL, '2026-01-29 18:44:38', '2026-01-29 18:44:38', NULL),
(11, 'máslo', 'sdfsdf', 'sdfds', 'Update', NULL, NULL, NULL, NULL, '2026-01-29 18:56:30', '2026-01-30 15:55:23', NULL),
(15, 'asd', 'asdasd', 'asdasd', 'Milník', NULL, NULL, NULL, NULL, '2026-01-30 15:50:18', '2026-01-30 15:55:20', NULL),
(16, 'ssdfdsf', 'sdfsdfsdf', 'sdgdf', 'Milník', NULL, NULL, NULL, NULL, '2026-01-30 15:50:25', '2026-01-30 15:50:25', NULL),
(17, 'sdvsdv', 'sdfsdf', 'fsdf', 'Milník', NULL, NULL, NULL, NULL, '2026-01-30 15:50:32', '2026-01-30 15:50:32', NULL),
(18, 'sndv,sdv', 'sdff', 'fsd', 'Milník', NULL, NULL, NULL, NULL, '2026-01-30 15:50:39', '2026-01-30 15:50:39', NULL),
(19, 'kk.jl', 'ddfgd', 'vdfb', 'Milník', NULL, NULL, NULL, NULL, '2026-01-30 15:50:45', '2026-01-30 15:50:45', NULL),
(20, 'sdmfnsd,mfnds,mfn', 'jhkfhdg', 'ddfgdgdfg', 'Update', NULL, NULL, NULL, NULL, '2026-01-30 15:54:08', '2026-01-30 15:54:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_key`, `description`, `created_at`) VALUES
(1, 'manage-administrators', 'Správa administrátorských účtů', '2026-01-10 08:28:44'),
(2, 'view-business-logs', 'Prohlížení business logů', '2026-01-10 08:28:44'),
(3, 'view-personal-info', 'Zobrazení osobních údajů', '2026-01-10 08:28:44'),
(4, 'view-user-requests', 'Zobrazení uživatelských požadavků', '2026-01-10 08:28:44'),
(5, 'view-dashboard', 'Přístup k nástěnce', '2026-01-10 08:28:44'),
(6, 'view-edit-website', 'Možnost editovat web', '2026-01-10 08:28:44'),
(7, 'view-deleted', 'Zobrazit softdeleted záznamy.', '2026-01-11 18:27:23'),
(8, 'view-sales-leads', 'Zobrazit Sales Leads', '2026-01-12 17:56:35'),
(9, 'view-news', 'Může vidět a editovat News.', '2026-01-27 18:44:43');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(911, 'App\\Models\\User', 15, 'access-token', '86256cc89fb15d7cf939deff0ebbcb92a232e1cc622a1d2c9bee7283abd2aa6a', '[\"*\"]', '2025-08-19 15:08:44', '2025-08-19 15:27:52', '2025-08-19 14:57:52', '2025-08-19 15:08:44'),
(1137, 'App\\Models\\User', 25, 'access-token', '71b70329f1743d5cb74bf73e6de95cb94e464656183b5f96ad7e071ef4e6d419', '[\"*\"]', NULL, '2026-01-30 17:19:54', '2026-01-30 16:49:54', '2026-01-30 16:49:54');

-- --------------------------------------------------------

--
-- Table structure for table `raw_request_commissions`
--

CREATE TABLE `raw_request_commissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `thema` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `order_description` text NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Nově zadané',
  `priority` varchar(255) NOT NULL DEFAULT 'Neutrální',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `raw_request_commissions`
--

INSERT INTO `raw_request_commissions` (`id`, `thema`, `contact_email`, `contact_phone`, `order_description`, `status`, `priority`, `created_at`, `updated_at`, `deleted_at`, `note`) VALUES
(13, 'JONKOJONCLasdsad', 'd@d.cz', NULL, 'asdsad', 'Zpracovává se', 'Nízká', '2026-01-30 14:50:18', '2026-01-30 15:36:19', '2026-01-30 15:36:19', NULL),
(14, 'GAMBA', 'asd@asd.cz', NULL, 'asfsd', 'Nově zadané', 'Nízká', '2026-01-30 14:52:44', '2026-01-30 14:52:44', NULL, NULL),
(15, 'JOOOO', 'asd@sf.cz', NULL, 'sdf', 'Nově zadané', 'Nízká', '2026-01-30 14:54:21', '2026-01-30 14:54:21', NULL, NULL),
(16, 'NOVE', 'sdf@sdf.cz', NULL, 'sdf', 'Zrušeno', 'Nízká', '2026-01-30 14:58:50', '2026-01-30 14:58:50', NULL, NULL),
(17, 'asdasd', 'asd@asdf.cz', NULL, 'sdf', 'Nově zadané', 'Nízká', '2026-01-30 14:59:54', '2026-01-30 14:59:54', NULL, NULL),
(18, 'Desktopový vývoj', 'navstevnik@sdfsdf.cz', NULL, 'jojo chci', 'Nově zadané', 'Nízká', '2026-01-30 15:22:12', '2026-01-30 15:22:12', NULL, NULL),
(19, 'Webový vývoj', 'odhlasen@sf.cz', NULL, 'jkh', 'Nově zadané', 'Nízká', '2026-01-30 15:23:21', '2026-01-30 15:23:21', NULL, NULL),
(20, 'test', 'sdfsdf@sdf.cu', NULL, 'jhkj', 'Nově zadané', 'Nízká', '2026-01-30 15:24:17', '2026-01-30 15:24:17', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_login_id` int(10) UNSIGNED NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_login_id`, `token`, `expires_at`, `created_at`, `updated_at`) VALUES
(1114, 25, '42edf554d155a1de61d7e3783615ef0ed4a16d6746523c523debd07143982b06', '2026-02-06 16:49:54', '2026-01-30 16:49:54', '2026-01-30 16:49:54');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'sysadmin', NULL, '2025-08-17 07:46:27', '2025-08-17 07:46:27', NULL),
(2, 'admin', NULL, '2025-08-17 07:46:27', '2025-08-17 07:46:27', NULL),
(3, 'primeadmin', NULL, '2025-08-20 09:02:24', '2025-08-20 09:02:24', NULL),
(4, 'UI/UX Designer', 'Návrh UI/UX', '2026-01-15 21:17:27', '2026-01-15 21:17:27', NULL),
(5, 'Salesman', 'Oslovuje potencionalni klienty.', '2026-01-15 21:17:27', '2026-01-15 21:17:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(2, 3),
(2, 4),
(2, 5),
(2, 7),
(2, 8),
(3, 1),
(3, 2),
(3, 5),
(4, 3),
(4, 5),
(5, 3),
(5, 5),
(5, 8);

-- --------------------------------------------------------

--
-- Table structure for table `sales_leads`
--

CREATE TABLE `sales_leads` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_login_id` int(10) UNSIGNED NOT NULL COMMENT 'ID uživatele pro aktivní propojení',
  `salesman_name` varchar(255) NOT NULL COMMENT 'Jméno obchodníka pro zpětné dohledání (stálá hodnota)',
  `first_contact_date` date NOT NULL COMMENT 'Kdy proběhl první kontakt',
  `subject_name` varchar(255) NOT NULL COMMENT 'Název firmy nebo jméno osoby',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'Jméno konkrétní kontaktní osoby',
  `location` varchar(100) DEFAULT NULL COMMENT 'Město nebo region',
  `source_channel` varchar(255) NOT NULL COMMENT 'Kde k oslovení došlo',
  `source_url` varchar(500) DEFAULT NULL COMMENT 'URL odkaz na profil nebo inzerát',
  `description` text DEFAULT NULL COMMENT 'Krátká poznámka k případu',
  `priority` varchar(255) DEFAULT 'Neutrální' COMMENT 'Priorita obchodního případu',
  `status` varchar(255) DEFAULT 'nové' COMMENT 'Aktuální stav obchodního případu',
  `last_contact_date` date DEFAULT NULL COMMENT 'Datum poslední komunikace',
  `next_step` varchar(255) DEFAULT NULL COMMENT 'Co se má udělat dál',
  `rejection_reason` text DEFAULT NULL COMMENT 'Důvod zamítnutí nebo nerealizace',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `contact_other` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_leads`
--

INSERT INTO `sales_leads` (`id`, `user_login_id`, `salesman_name`, `first_contact_date`, `subject_name`, `contact_person`, `location`, `source_channel`, `source_url`, `description`, `priority`, `status`, `last_contact_date`, `next_step`, `rejection_reason`, `created_at`, `updated_at`, `deleted_at`, `contact_email`, `contact_phone`, `contact_other`) VALUES
(13, 25, 'joncl', '2025-12-29', 'testLEAD', NULL, NULL, 'LinkedIn', NULL, NULL, 'Nízká', 'nové', NULL, NULL, NULL, '2026-01-30 14:54:04', '2026-01-30 14:54:04', NULL, NULL, NULL, NULL),
(14, 25, 'joncl', '2025-12-29', 'sdfsdff', NULL, NULL, 'LinkedIn', NULL, NULL, 'Nízká', 'nové', NULL, NULL, NULL, '2026-01-30 15:24:39', '2026-01-30 15:24:39', NULL, NULL, NULL, NULL),
(15, 25, 'joncl', '2025-12-29', 'asdasd', NULL, NULL, 'LinkedIn', NULL, NULL, 'Nízká', 'nové', NULL, NULL, NULL, '2026-01-30 15:37:32', '2026-01-30 15:37:32', NULL, NULL, NULL, NULL),
(16, 25, 'joncl', '2025-12-29', 'sfsdfsd', NULL, NULL, 'LinkedIn', NULL, NULL, 'Nízká', 'nové', NULL, NULL, NULL, '2026-01-30 15:48:38', '2026-01-30 15:48:38', NULL, NULL, NULL, NULL),
(17, 25, 'joncl', '2025-12-29', 'mn', NULL, NULL, 'LinkedIn', NULL, NULL, 'Nízká', 'nové', NULL, NULL, NULL, '2026-01-30 15:48:47', '2026-01-30 15:48:47', NULL, NULL, NULL, NULL),
(18, 25, 'joncl', '2025-12-29', 'mnkj', NULL, NULL, 'LinkedIn', NULL, NULL, 'Nízká', 'nové', NULL, NULL, NULL, '2026-01-30 15:48:57', '2026-01-30 15:48:57', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('JenIoSubaHISfzQygDzJUKfjY2WO1XMtsV3qpBgW', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT2tmUlVzYnp3UVA2eGlyNVczR205QWdpOFZHSGd5Y2YyZzE3NTFabyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1769538902);

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `system_log_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `origin` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `context_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_login`
--

CREATE TABLE `user_login` (
  `user_login_id` int(10) UNSIGNED NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `personal_id_num` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `health_insurance` varchar(10) DEFAULT NULL,
  `commission_rate` int(3) DEFAULT 10,
  `dpp_hours_spent` int(5) NOT NULL DEFAULT 0,
  `has_tax_declaration` tinyint(1) NOT NULL DEFAULT 0,
  `phone_number` varchar(20) DEFAULT NULL,
  `internal_note` text DEFAULT NULL,
  `user_password_hash` varchar(255) NOT NULL,
  `user_password_salt` varchar(255) DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_login`
--

INSERT INTO `user_login` (`user_login_id`, `user_email`, `contact_email`, `full_name`, `birth_date`, `personal_id_num`, `address`, `bank_account`, `health_insurance`, `commission_rate`, `dpp_hours_spent`, `has_tax_declaration`, `phone_number`, `internal_note`, `user_password_hash`, `user_password_salt`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`) VALUES
(25, 'joncl', 'jonasbucina@rpsw.cz', 'Jonáš Bučina', '2003-12-04', '031204/0597', 'Kytlická 862/6', '296456145/0300', '211', 0, 0, 0, '733 188 328', 'proste joncl', '$2y$12$rV1ILe7YeW1L1XfWb5DrfuiCYTC.1FZsIU4wtNmA95GaUNwXAtYoa', NULL, '2026-01-30 16:23:30', '2026-01-15 22:31:12', '2026-01-30 16:23:30', NULL, 0),
(30, 'prime_admin', NULL, 'Prime Admin', '1950-01-01', NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, '$2y$12$NEiDrqVCChulf9S/EUPIpeOHScIM0zwswPTxIFamRDrY4XajgHQOe', NULL, '2026-01-20 19:09:59', '2026-01-20 19:04:18', '2026-01-20 19:09:59', NULL, 0),
(32, 'guest_12', NULL, 'Guest', NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, '$2y$12$FHHhgUo5FNzuXMsBE2l8/Or31BCLTjYkOo/epJ4uCjC5Ur0HuMNj6', NULL, '2026-01-30 15:28:57', '2026-01-30 15:28:10', '2026-01-30 15:28:57', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_login_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_login_id`, `role_id`) VALUES
(25, 1),
(30, 3),
(32, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `business_logs`
--
ALTER TABLE `business_logs`
  ADD PRIMARY KEY (`business_log_id`),
  ADD KEY `idx_business_logs_affected_entity` (`affected_entity_type`,`affected_entity_id`),
  ADD KEY `idx_business_logs_user_login_id` (`user_login_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `uq_permission_key` (`permission_key`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `raw_request_commissions`
--
ALTER TABLE `raw_request_commissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_tokens_token_unique` (`token`),
  ADD KEY `refresh_tokens_user_login_id_foreign` (`user_login_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD UNIQUE KEY `uq_role_name` (`role_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_rp_permission_id` (`permission_id`);

--
-- Indexes for table `sales_leads`
--
ALTER TABLE `sales_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sales_leads_user` (`user_login_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`system_log_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_login`
--
ALTER TABLE `user_login`
  ADD PRIMARY KEY (`user_login_id`) USING BTREE,
  ADD UNIQUE KEY `user_email` (`user_email`),
  ADD UNIQUE KEY `uq_user_login_email` (`user_email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_login_id`,`role_id`),
  ADD KEY `idx_ur_user_login_id` (`user_login_id`),
  ADD KEY `idx_ur_role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `business_logs`
--
ALTER TABLE `business_logs`
  MODIFY `business_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1138;

--
-- AUTO_INCREMENT for table `raw_request_commissions`
--
ALTER TABLE `raw_request_commissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1115;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sales_leads`
--
ALTER TABLE `sales_leads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `system_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_login`
--
ALTER TABLE `user_login`
  MODIFY `user_login_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `business_logs`
--
ALTER TABLE `business_logs`
  ADD CONSTRAINT `fk_business_logs_user_login_id` FOREIGN KEY (`user_login_id`) REFERENCES `user_login` (`user_login_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_user_login_id_foreign` FOREIGN KEY (`user_login_id`) REFERENCES `user_login` (`user_login_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_rp_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rp_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_leads`
--
ALTER TABLE `sales_leads`
  ADD CONSTRAINT `fk_sales_leads_user` FOREIGN KEY (`user_login_id`) REFERENCES `user_login` (`user_login_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ur_user_login_id` FOREIGN KEY (`user_login_id`) REFERENCES `user_login` (`user_login_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
