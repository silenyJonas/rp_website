-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 07, 2026 at 11:39 AM
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
(1, '2026-02-07 10:05:26', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 126', 'SalesLead', 126, 25, '[]', '25', 'joncl'),
(2, '2026-02-07 10:05:33', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 115', 'SalesLead', 115, 25, '[]', '25', 'joncl'),
(3, '2026-02-07 10:05:36', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 117', 'SalesLead', 117, 25, '[]', '25', 'joncl'),
(4, '2026-02-07 10:05:39', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 118', 'SalesLead', 118, 25, '[]', '25', 'joncl'),
(5, '2026-02-07 10:05:42', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 119', 'SalesLead', 119, 25, '[]', '25', 'joncl'),
(6, '2026-02-07 10:06:07', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 49, 25, '[]', '25', 'joncl'),
(7, '2026-02-07 10:06:10', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 48, 25, '[]', '25', 'joncl'),
(8, '2026-02-07 10:06:12', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 47, 25, '[]', '25', 'joncl'),
(9, '2026-02-07 10:06:15', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 35, 25, '[]', '25', 'joncl'),
(10, '2026-02-07 10:06:21', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 33, 25, '[]', '25', 'joncl'),
(11, '2026-02-07 10:06:24', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 37, 25, '[]', '25', 'joncl'),
(12, '2026-02-07 10:06:29', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 27, 25, '[]', '25', 'joncl'),
(13, '2026-02-07 10:06:32', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 46, 25, '[]', '25', 'joncl'),
(14, '2026-02-07 10:06:35', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 45, 25, '[]', '25', 'joncl'),
(15, '2026-02-07 10:06:38', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 44, 25, '[]', '25', 'joncl'),
(16, '2026-02-07 10:06:42', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 43, 25, '[]', '25', 'joncl'),
(17, '2026-02-07 10:06:47', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 42, 25, '[]', '25', 'joncl'),
(18, '2026-02-07 10:06:50', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 41, 25, '[]', '25', 'joncl'),
(19, '2026-02-07 10:06:54', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 40, 25, '[]', '25', 'joncl'),
(20, '2026-02-07 10:06:57', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 39, 25, '[]', '25', 'joncl'),
(21, '2026-02-07 10:07:00', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 28, 25, '[]', '25', 'joncl'),
(22, '2026-02-07 10:07:04', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 26, 25, '[]', '25', 'joncl'),
(23, '2026-02-07 10:07:08', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 25, 25, '[]', '25', 'joncl'),
(24, '2026-02-07 10:07:11', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 24, 25, '[]', '25', 'joncl'),
(25, '2026-02-07 10:07:14', '127.0.0.1', 'soft_delete', 'News', 'Smazáno do koše: adasd', 'News', 23, 25, '[]', '25', 'joncl'),
(26, '2026-02-07 10:07:29', '127.0.0.1', 'bulk_hard_delete', 'News', 'Hromadné trvalé smazání všech položek v koši. Počet: 28', 'News', NULL, 25, '[]', '25', 'joncl'),
(27, '2026-02-07 10:07:43', '127.0.0.1', 'force_delete_all', 'UserLogin', 'Vysypání koše: 9', 'UserLogin', NULL, 25, 'Context data vynechána', '25', 'joncl'),
(28, '2026-02-07 10:17:40', '127.0.0.1', 'create', 'RawRequestCommission', 'Uložení nového požadavku na provizi', 'RawRequestCommission', 1, 25, '{\"thema\":\"test\",\"contact_email\":\"jonas@sdf.cz\",\"contact_phone\":\"123123123\",\"order_description\":\"sdklfdfkgj\",\"note\":null,\"status\":\"Nově zadané\",\"priority\":\"Nízká\"}', '25', 'joncl'),
(29, '2026-02-07 10:17:46', '127.0.0.1', 'update', 'RawRequestCommission', 'Aktualizace požadavku na provizi', 'RawRequestCommission', 1, 25, '{\"id\":1,\"thema\":\"testXD\",\"contact_email\":\"jonas@sdf.cz\",\"contact_phone\":\"123123123\",\"order_description\":\"sdklfdfkgj\",\"status\":\"Nově zadané\",\"priority\":\"Nízká\",\"note\":null,\"created_at\":\"2026-02-07T09:17:40.000000Z\",\"updated_at\":\"2026-02-07T09:17:40.000000Z\",\"deleted_at\":null}', '25', 'joncl'),
(30, '2026-02-07 10:17:50', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 1, 25, '[]', '25', 'joncl'),
(31, '2026-02-07 10:18:04', '127.0.0.1', 'restore', 'RawRequestCommission', 'Obnova smazaného požadavku', 'RawRequestCommission', 1, 25, '[]', '25', 'joncl'),
(32, '2026-02-07 10:18:10', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 1, 25, '[]', '25', 'joncl'),
(33, '2026-02-07 10:18:15', '127.0.0.1', 'hard_delete', 'RawRequestCommission', 'Smazání požadavku', 'RawRequestCommission', 1, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(34, '2026-02-07 10:19:19', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: test', 'SalesLead', 1, 25, '{\"subject_name\":\"test\",\"contact_person\":\"jonas\",\"contact_email\":\"jonasOdhlásit@sdf.cu\",\"contact_phone\":\"123123123\",\"contact_other\":\"test\",\"location\":\"praha\",\"source_channel\":\"LinkedIn - Direct Message\",\"source_url\":null,\"status\":\"Nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(35, '2026-02-07 10:23:56', '127.0.0.1', 'create', 'SalesLead', 'Vytvořen lead: test2', 'SalesLead', 2, 25, '{\"subject_name\":\"test2\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn - Direct Message\",\"source_url\":null,\"status\":\"Nové\",\"priority\":\"Nízká\",\"next_step\":null,\"description\":null}', '25', 'joncl'),
(36, '2026-02-07 10:27:14', '127.0.0.1', 'update', 'SalesLead', 'Aktualizace leadu: test2XD', 'SalesLead', 2, 25, '{\"id\":2,\"user_login_id\":25,\"salesman_name\":\"joncl\",\"first_contact_date\":null,\"subject_name\":\"test2XD\",\"contact_person\":null,\"contact_email\":null,\"contact_phone\":null,\"contact_other\":null,\"location\":null,\"source_channel\":\"LinkedIn - Direct Message\",\"source_url\":null,\"description\":null,\"priority\":\"Nízká\",\"status\":\"Nové\",\"last_contact_date\":null,\"next_step\":null,\"rejection_reason\":null,\"created_at\":\"2026-02-07 10:23:56\",\"updated_at\":\"2026-02-07 10:23:56\",\"deleted_at\":null}', '25', 'joncl'),
(37, '2026-02-07 11:33:57', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 2', 'SalesLead', 2, 25, '[]', '25', 'joncl'),
(38, '2026-02-07 11:34:05', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 1', 'SalesLead', 1, 25, '[]', '25', 'joncl'),
(39, '2026-02-07 11:34:10', '127.0.0.1', 'hard_delete', 'SalesLead', 'Smazání leadu ID: 2', 'SalesLead', 2, 25, '{\"force_delete\":\"true\"}', '25', 'joncl'),
(40, '2026-02-07 11:34:13', '127.0.0.1', 'restore', 'SalesLead', 'Obnova leadu: test', 'SalesLead', 1, 25, '[]', '25', 'joncl'),
(41, '2026-02-07 11:34:59', '127.0.0.1', 'create', 'SalesOrder', 'Vytvořena poptávka pro: test_klient', 'SalesOrder', 1, NULL, '{\"lead_id\":\"1\",\"client_name\":\"test_klient\",\"ico\":\"123123123\",\"client_address\":\"dsfds fdf,ČŠĚÚŮL§\",\"client_phone\":\"12312312312\",\"client_email\":\"FSDFSDF@SDF.CU\",\"order_description\":\"dsdfljsdfdfk\",\"dataProcessingAgreement\":\"true\",\"tosAgreement\":\"true\",\"attachment\":{}}', '0', 'Veřejný web (Anonym)'),
(42, '2026-02-07 11:35:24', '127.0.0.1', 'update', 'SalesLead', 'Aktualizace leadu: testXD', 'SalesLead', 1, 25, '{\"id\":1,\"user_login_id\":25,\"salesman_name\":\"joncl\",\"first_contact_date\":null,\"subject_name\":\"testXD\",\"contact_person\":\"jonas\",\"contact_email\":\"jonasOdhlásit@sdf.cu\",\"contact_phone\":\"123123123\",\"contact_other\":\"test\",\"location\":\"praha\",\"source_channel\":\"LinkedIn - Direct Message\",\"source_url\":null,\"description\":null,\"priority\":\"Nízká\",\"status\":\"Nové\",\"last_contact_date\":null,\"next_step\":null,\"rejection_reason\":null,\"created_at\":\"2026-02-07 10:19:19\",\"updated_at\":\"2026-02-07 11:34:13\",\"deleted_at\":null}', '25', 'joncl'),
(43, '2026-02-07 11:35:28', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 1', 'SalesLead', 1, 25, '[]', '25', 'joncl'),
(44, '2026-02-07 11:35:33', '127.0.0.1', 'restore', 'SalesLead', 'Obnova leadu: testXD', 'SalesLead', 1, 25, '[]', '25', 'joncl'),
(45, '2026-02-07 11:35:38', '127.0.0.1', 'soft_delete', 'SalesLead', 'Smazání leadu ID: 1', 'SalesLead', 1, 25, '[]', '25', 'joncl'),
(46, '2026-02-07 11:35:42', '127.0.0.1', 'hard_delete', 'SalesLead', 'Smazání leadu ID: 1', 'SalesLead', 1, 25, '{\"force_delete\":\"true\"}', '25', 'joncl');

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `position_name` varchar(150) NOT NULL,
  `message` text DEFAULT NULL,
  `cv_path` varchar(255) DEFAULT NULL,
  `state` varchar(50) DEFAULT 'Nový',
  `internal_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(21, 'Redesing administrace', 'Celý systém administrace dostal nový vzhled, modernější, čistší a přehlednější, nové barvy vzhledy a tvary. Každé vložení záznamu je nyní příjemnější než kdy dříve.', 'Systém', 'Info', 'Nové barvy', 'Nové rozložení', NULL, NULL, '2026-02-05 23:23:51', '2026-02-05 23:23:51', NULL);

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
(9, 'view-news', 'Může vidět a editovat News.', '2026-01-27 18:44:43'),
(10, 'view-sales-orders', 'Vidí poptávkové listy od klientů.', '2026-01-30 17:42:32'),
(11, 'view-support-tickets', 'Může zobrazit tikety zaslané na podporu.', '2026-02-03 21:48:13'),
(12, 'view-job-applications', 'Může zobrazit seznam uchazečů.', '2026-02-04 08:49:37');

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
(1173, 'App\\Models\\User', 35, 'access-token', '28635d1380112b9d5dc4bf4d938099a275b094265cbc0362fed0fc78ef5d5b79', '[\"*\"]', '2026-02-01 18:34:09', '2026-02-01 18:48:28', '2026-02-01 18:18:28', '2026-02-01 18:34:09'),
(1219, 'App\\Models\\User', 25, 'access-token', '31ca7f90353d62cfbe5b6a3e4b9c2a3cde1eb964a8337069bdf22515b48559b6', '[\"*\"]', '2026-02-07 10:36:42', '2026-02-07 11:03:57', '2026-02-07 10:33:57', '2026-02-07 10:36:42');

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
(1147, 34, '59580e407f9d929a507bc6ecba23b5affdbb7b8dc529ffba0c37b302dd0a9961', '2026-02-08 17:58:16', '2026-02-01 17:58:16', '2026-02-01 17:58:16'),
(1196, 25, 'a5728777a3273d7c375612bea36b8287f425ab2b39e1c50ee76dbed8d35c7f61', '2026-02-14 10:33:57', '2026-02-07 10:33:57', '2026-02-07 10:33:57');

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
(1, 10),
(1, 11),
(1, 12),
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
  `first_contact_date` date DEFAULT NULL COMMENT 'Kdy proběhl první kontakt',
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

-- --------------------------------------------------------

--
-- Table structure for table `sales_orders`
--

CREATE TABLE `sales_orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `lead_id` int(10) UNSIGNED NOT NULL,
  `salesman_name` varchar(255) NOT NULL,
  `ico` varchar(20) DEFAULT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_address` varchar(500) DEFAULT NULL,
  `client_phone` varchar(255) DEFAULT NULL,
  `client_email` varchar(255) DEFAULT NULL,
  `order_description` text DEFAULT NULL,
  `attachment_path` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('EC6pEjvhWkUoEfaPB0eNLYmUfpwp48KnjmfDcD2j', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQUJiTXhWNlM4YmVPYkpsV1l0TkNYVWk2dDFhTzFUSmZzalhvSUtoeCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1770143033),
('JenIoSubaHISfzQygDzJUKfjY2WO1XMtsV3qpBgW', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT2tmUlVzYnp3UVA2eGlyNVczR205QWdpOFZHSGd5Y2YyZzE3NTFabyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1769538902),
('VcMhKjPkGrF0qYQ20bBCQQiVwRVK9PrtZ5FjSX24', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWkF0ZnlNTkZyTFpKbFlaTmNLWkFucTJXRHl3RTY5NElmR1JqRzlNQSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1769792764);

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_login_id` int(10) UNSIGNED DEFAULT NULL,
  `user_name_plain` varchar(255) NOT NULL,
  `user_email_plain` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `priority` varchar(50) DEFAULT 'medium',
  `state` varchar(50) DEFAULT 'new',
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(25, 'joncl', 'jonasbucina@rpsw.cz', 'Jonáš Bučina', '2003-12-04', '031204/0597', 'Kytlická 862/6', '296456145/0300', '211', 0, 0, 0, '733 188 328', 'proste joncl', '$2y$12$rV1ILe7YeW1L1XfWb5DrfuiCYTC.1FZsIU4wtNmA95GaUNwXAtYoa', NULL, '2026-02-07 09:00:25', '2026-01-15 22:31:12', '2026-02-07 09:00:25', NULL, 0),
(30, 'prime_admin', NULL, 'Prime Admin', '1950-01-01', NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, '$2y$12$NEiDrqVCChulf9S/EUPIpeOHScIM0zwswPTxIFamRDrY4XajgHQOe', NULL, '2026-01-20 19:09:59', '2026-01-20 19:04:18', '2026-01-20 19:09:59', NULL, 0),
(34, 'lindicka', 'lindicka@mazliva.cz', 'LIndička Trýbíčková', '2025-01-31', NULL, NULL, NULL, NULL, 100, 0, 0, '123131231', NULL, '$2y$12$PJhlGzYNOhlpUiIeR/9/aOIkd/wBMrTTMbiiwbGZ24ARU7BLwXGSe', NULL, '2026-02-01 16:14:54', '2026-02-01 12:10:33', '2026-02-01 16:14:54', NULL, 0);

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
(34, 5);

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
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `sales_orders`
--
ALTER TABLE `sales_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_orders_lead` (`lead_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_support_user_login` (`user_login_id`);

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
  MODIFY `business_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1220;

--
-- AUTO_INCREMENT for table `raw_request_commissions`
--
ALTER TABLE `raw_request_commissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1197;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sales_leads`
--
ALTER TABLE `sales_leads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sales_orders`
--
ALTER TABLE `sales_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `user_login_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
-- Constraints for table `sales_orders`
--
ALTER TABLE `sales_orders`
  ADD CONSTRAINT `FK_orders_lead` FOREIGN KEY (`lead_id`) REFERENCES `sales_leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `fk_support_user_login` FOREIGN KEY (`user_login_id`) REFERENCES `user_login` (`user_login_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
