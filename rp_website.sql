-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 11, 2026 at 07:56 PM
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
(1, '2026-01-05 18:36:11', '127.0.0.1', 'create', 'UserLogin', 'Vytvoření nového uživatele', 'UserLogin', 21, 16, 'Context data obsahují citlivá data a nejsou zobrazována', '16', 'primeadmin@primeadmin.cz'),
(2, '2026-01-07 00:26:38', '127.0.0.1', 'create', 'UserLogin', 'Vytvoření nového uživatele', 'UserLogin', 22, 21, 'Context data obsahují citlivá data a nejsou zobrazována', '21', 'jonasbucina@rpsw.cz'),
(3, '2026-01-07 00:33:35', '127.0.0.1', 'soft_delete', 'UserLogin', 'Soft smazání uživatele', 'UserLogin', 22, 21, '[]', '21', 'jonasbucina@rpsw.cz'),
(4, '2026-01-07 00:41:06', '127.0.0.1', 'soft_delete', 'UserLogin', 'Soft smazání uživatele', 'UserLogin', 1, 21, '[]', '21', 'jonasbucina@rpsw.cz'),
(5, '2026-01-07 15:03:52', '127.0.0.1', 'update', 'Translation', 'Update cz.json. Changes: 5', 'Translation', NULL, 21, '{\"lang\":\"cz\",\"modified\":\"UPD:faq.question_1, NEW:projects.project_3.client, NEW:projects.project_4.client, NEW:projects.project_5.client, NEW:services.services.item_6.message\"}', '21', 'jonasbucina@rpsw.cz'),
(6, '2026-01-07 15:06:42', '127.0.0.1', 'update', 'Translation', 'Update cz.json. Changes: 5', 'Translation', NULL, 21, '{\"lg\":\"cz\",\"df\":\"CHNG:faq.question_1(Jaké typy ->Jaké typy ) | NEW:projects.project_3.client() | NEW:projects.project_4.client() | NEW:projects.project_5.client() | NEW:services.services.item_6.message()\"}', '21', 'jonasbucina@rpsw.cz'),
(7, '2026-01-10 09:46:59', '127.0.0.1', 'create', 'UserLogin', 'Vytvoření nového uživatele', 'UserLogin', 23, 21, 'Context data obsahují citlivá data a nejsou zobrazována', '21', 'jonasbucina@rpsw.cz'),
(8, '2026-01-10 09:56:36', '127.0.0.1', 'update', 'UserLogin', 'Aktualizace údajů uživatele', 'UserLogin', 20, NULL, '{\"id\":20,\"user_email\":\"admin5@example.com\",\"last_login_at\":\"2025-08-20T16:55:49.000000Z\",\"is_deleted\":false,\"created_at\":\"2025-08-20T16:31:24.000000Z\",\"updated_at\":\"2025-08-22T11:21:45.000000Z\",\"deleted_at\":null,\"roles\":[{\"role_id\":2,\"role_name\":\"admin\",\"description\":null,\"created_at\":\"2025-08-17T07:46:27.000000Z\",\"updated_at\":\"2025-08-17T07:46:27.000000Z\",\"deleted_at\":null}],\"user_permissions\":[\"view-personal-info\",\"view-user-requests\",\"view-dashboard\"],\"role_id\":\"1\"}', '', NULL),
(9, '2026-01-11 19:25:06', '127.0.0.1', 'soft_delete', 'RawRequestCommission', 'Soft smazání požadavku na provizi', 'RawRequestCommission', 1, NULL, '[]', '', NULL);

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
(7, 'view-deleted', 'Zobrazit softdeleted záznamy.', '2026-01-11 18:27:23');

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
(1007, 'App\\Models\\User', 21, 'access-token', '74edd31ba0c7827d5eae4e1a4645bd6af257532ffda51b15c1e7adb0fce9fa1b', '[\"*\"]', NULL, '2026-01-10 09:46:12', '2026-01-10 09:16:12', '2026-01-10 09:16:12'),
(1013, 'App\\Models\\User', 23, 'access-token', 'd97f522a1c9504a5a11783b13357200f6be120262ce17b67fbdfcd9c5743c298', '[\"*\"]', NULL, '2026-01-10 11:07:45', '2026-01-10 10:37:45', '2026-01-10 10:37:45'),
(1014, 'App\\Models\\User', 21, 'access-token', '0a031c1a66a9bd6db8a504574ecb876d9065f6f10a0b0158f45ca868d48d205c', '[\"*\"]', NULL, '2026-01-10 16:21:20', '2026-01-10 15:51:20', '2026-01-10 15:51:20'),
(1015, 'App\\Models\\User', 21, 'access-token', '4eb64c593208ba6ae4613837886f2f77e46b6cde36cfcf5a424899ffecd260a9', '[\"*\"]', NULL, '2026-01-11 18:51:29', '2026-01-11 18:21:29', '2026-01-11 18:21:29'),
(1016, 'App\\Models\\User', 21, 'access-token', 'ff710f8254f6d97fd656a6a969a6bae0e66976976dbfadc2714af00fa7908fc0', '[\"*\"]', NULL, '2026-01-11 18:54:05', '2026-01-11 18:24:05', '2026-01-11 18:24:05'),
(1017, 'App\\Models\\User', 21, 'access-token', 'b58abe51e8c5c172ab9dc32a7f04370b92c4c4979acc4d305e253571dd582ea9', '[\"*\"]', NULL, '2026-01-11 18:54:45', '2026-01-11 18:24:45', '2026-01-11 18:24:45'),
(1018, 'App\\Models\\User', 23, 'access-token', 'c476713c84b15becc2a9b51ba95cd3dbd840b6c1323dbd0e46e71c3bdc1c10c0', '[\"*\"]', NULL, '2026-01-11 19:09:22', '2026-01-11 18:39:22', '2026-01-11 18:39:22'),
(1019, 'App\\Models\\User', 21, 'access-token', 'ca83b2360691d0613f162a0fb7b965861a2d3b5e94cc6a9d9af96ca718be6afa', '[\"*\"]', NULL, '2026-01-11 19:09:28', '2026-01-11 18:39:28', '2026-01-11 18:39:28'),
(1020, 'App\\Models\\User', 23, 'access-token', '217aed615e6533e3593fdaf0acde68ca76ecb17b9e4d1a01997f0f5a3d9d1238', '[\"*\"]', NULL, '2026-01-11 19:14:52', '2026-01-11 18:44:52', '2026-01-11 18:44:52'),
(1021, 'App\\Models\\User', 21, 'access-token', '5767dceae20c953a8d3f847f816fac6d03bcad1c97733e7524ce975b160630e3', '[\"*\"]', NULL, '2026-01-11 19:15:06', '2026-01-11 18:45:06', '2026-01-11 18:45:06');

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
(1, 'Webový vývoj', 'resr.res@sf.cz', '123123123', 'sfsdfsfd', 'Nově zadané', 'Nízká', '2025-12-22 09:12:01', '2026-01-11 18:25:06', '2026-01-11 18:25:06', NULL);

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
(1020, 21, 'ac17dd3667dcbef65635ef4fc93285cb0387ea0abffdbd89278b36b4cd0e3401', '2026-01-18 18:45:06', '2026-01-11 18:45:06', '2026-01-11 18:45:06');

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
(3, 'primeadmin', NULL, '2025-08-20 09:02:24', '2025-08-20 09:02:24', NULL);

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
(2, 3),
(2, 4),
(2, 5),
(3, 1),
(3, 2),
(3, 5);

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
('0inpi7uITsCIohrxS3HGNaWvZNGkwhR5Iqdg82wv', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaTA4RE5FSkdRT1ROSHl3OGhRVVB0SHpYaEYyZXozSzZEYjRqNGJSVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752592037),
('1FE0WUrtJ2f43kGAdlhkKqD2TJ5OjYTIu7LETNad', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSXBBRXhUM0hDbUI0Um1uV3RTM0NhQ2ZmVzI2VjR6aGY3TGdQT0w3MCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752590341),
('1OEgb18qudcnz1nKfuwjQmlF46aVplHjST88bt2Q', NULL, '127.0.0.1', 'PostmanRuntime/7.45.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUmtiSndFdm1PUVR4U1FlWDRGSkR1bHJ5dkxVNzVrYzI3dDlhZUVUeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1755424735),
('2bI71fuNtbIzwL52IRcFPCRcDEqzuSb3wGGvOMb2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieE9NWWR6WUtwWmYxTVp2dkVSUDFlbml4bUVMZWZQNzRrM2E3a0VudyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752579037),
('8blnDF9feocbjokaVZgS8kHXCyEttZdWVK2lIPDW', NULL, '127.0.0.1', 'PostmanRuntime/7.45.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic1ZvYjNPZ2V2U0lrUWxUREJXdDljN1Z3dTk0cTlFTTZ4Zk40Nm5aQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1754584531),
('AKF0u3NmuBicKQJW15kVqxvP2nmYwKsp5biSI1eA', NULL, '127.0.0.1', 'PostmanRuntime/7.45.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQmNOT25vbWlBYWwydEFNazB3YUpnZVdnSlNJWVB6SlVSbER0dTNGTCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1755383998),
('bk8XdNnApgkyqprwj2L21EYBHNGo6cW87N0lWFQX', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZkdhZ3ZocU00eGJwS3hrSFdHQlY2QWQ1VW9zdGZOUkE4WkVSYjhqNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLnRlc3QvYXBpL3Jhd19yZXF1ZXN0X2NvbW1pc3Npb25zIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1752217213),
('dBbGrqz9Spmw9jow2frCbphMNl7lncjG04atuZfE', NULL, '127.0.0.1', 'PostmanRuntime/7.45.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidmU1bVhKNmFUbnl5WUJWRjJNUkplQ0hhdENHWUduQ0NzaTV0RjZFbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1755453737),
('dD2NZ6VsdhFrIQqEavFcXlmws4jjMdpyw41qYFPf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZE91eE5YR3VZdGMwM242VXE4cmZuUHV6RjM3OTQweUI4OWNXSU5FeCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1753171826),
('e0U8U0LakUj4cX6tGGVjojuC0SP6hmy3M2lGEm1T', NULL, '127.0.0.1', 'PostmanRuntime/7.45.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaDNvSVNyNDBlTVdadFF6SGdmWXBpVWM4WnhPbVdRUDFzdnYzTXJpSCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1755452834),
('GcoJnP2iIzNWXHNJ66mrs0ccVhlLZ0xoLsnzStCM', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib1ZHVzZ4ak45aGFqVmk5T0hreVNpbERXQ09wR202N0NGcGxGcklYQSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1753171825),
('jPTPRbCa86BSdWqEtigyIVO5AioI49Mj6NY4qzgO', NULL, '127.0.0.1', 'PostmanRuntime/7.44.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS2VUTDRtcnBRSDJMMU9LakQ5cTJRT21pYnZOaHMyNnRTQUM0bVJwcSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752571636),
('K8WS4TaqsplCPDJBbMu2NZ8wTK46mqYuiIFO7oZh', NULL, '127.0.0.1', 'PostmanRuntime/7.45.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS29MTVR3R2hTTzYyVXZYamVXTWZJckZvVzdGV01jd1V6QURadmllVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1755419132),
('kmw2jxWGUNOKUo6qzmqNXD9lAaWuxYrh9lVnvPDT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQklZcUVxc3VlYUc5QTAxcUZZUlFOWTF1SXZ3aHZJTHl3RUFob0xlbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752579008),
('lELz7sIQimFV7ESf0salLbl3nTj7IWRsQ6nbfrco', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicWZlSTNQRzlkSG1LZTZPY0cyVktXNGVxZ2ZOSHVXcTNDamZQTEI4eCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752225341),
('LVuMntqgG8QYRuvKKgyHnki87shgJLgiy9yMz9PQ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV2tKb0xkSDNidnBBMmpQRzRFalRaVFNFejBUeG92OEo2Ynh2MnhCTCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752590343),
('NDygBBymgyCe7rfRPNuVx5ltJG6jBQv4XPDwcLLi', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRG84RW0wTG85WnFXQXRORXlCRFZZWVF0SVFNcVRaT1pVcEphVzJBWCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1753171821),
('P5S5Av5rH4Tubu87a9z0n4o0TvRHF1pD78vn83xa', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibXk4VllLZXJtMnlKTGs0ZWM1MEFDMXN6UTl3UXlwQURuSmNVV2NWbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768036066),
('pFqnNoJkggQsYYhbXyHHJ9w4qVcptJ8Rv7gVfc9J', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNXFObzREdk40ZFd3UDFWTk1VZUJ2dndKalIzdGg0VXhjOTZhRmNZaCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1752588909),
('rcOt9sDPpTUWZzp9eg4zlOUu7vYyWI8sAKKnRD4j', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV1c0YWoxa1M3RENvOG95MnBSRGgxWEFXakZTUTN3eU41M2ZyYnVncyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1753171827),
('rjjHscUmxjdftxIYsca2mJgpxRd8RLLcignBdcXb', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNHZkVHJBeEg2WGk2SWoxNDR2V05pTDd1cDVPdml5M1hJVzZNTW9uciI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vYXBpLnRlc3QvbG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752569522),
('tTfDxexLSQfcO9FLskYkS3lRVEwL83IEMVDAEFE1', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU0hQbG5ieGRPTVpqcGpLNU9kQ2FzU2JtMDNEcUVVdXFNeUNWU0tDQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752218365),
('U70cQJOwpWpu5UeAdD90lPpgIfvL71nRI56C0tTK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZGNQU0VvSHRiTnVWdmZCV3hWTmdDT3p0V3FsMUtiQmVpd2Y4QVU3bCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752591719),
('UqyKEPgdoAoVZYPXBxW2e8l4Rg5cv6Ov7QCy5KwL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZUJXeGI3RGoyZnl0dmw3NWdwaVpDbUpUQmRtR0JYMkZUYzViMmpHeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLnRlc3QvYXBpL3Jhd19yZXF1ZXN0X2NvbW1pc3Npb25zIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1752226311),
('vJAXXObJWbON69ZGiCDbTRSHQi2T3nZEHvG9KMbK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTlphcFozNmhwSDFUc2pwS2RYZUlLUXVZQ0F0b095dEFqV05nQTY1MCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752592036),
('xpLZFN68K2KcH4gyP6R4IUgWHYB7zxZ1uNHH0xBo', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibnBNcUZEeXhDeDY5NUlwOFNxeWVvY0JPQkNOMk95MnlYcnZ2UlFKayI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLnRlc3QvYXBpL3Jhd19yZXF1ZXN0X2NvbW1pc3Npb25zIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1752225336),
('yPtSVnu0OCmauER8WRVT2YJLKJiJrrh1a0QxiB50', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN09DNGNZY0FSVjNLNkRzUUU1ZEtLQzB3Y1lJOWZTZjVCZzRoOGV0SyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752570709),
('z5zug8Qb1JQCMAWJq3VBLghb6sZ2wxA65lRSNB3k', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVzhIelVPTnpoa256azlqNGtyUlhSY2lLZmxxUHY0WUVDQ2dsU2lqdyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MTY6Imh0dHBzOi8vYXBpLnRlc3QiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1752590309);

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

INSERT INTO `user_login` (`user_login_id`, `user_email`, `user_password_hash`, `user_password_salt`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`) VALUES
(1, 'admin@example.com', '$2y$12$v2Uh5xld7hxZIfLHDUw8IOvJiBgxPdBKthG8kvL4nT1xWwDrQRx02', '0', '2025-08-26 10:06:26', '2025-07-10 17:10:32', '2026-01-07 00:41:06', '2026-01-07 00:41:06', 0),
(11, 'admin2@example.com', '$2y$12$kxPzYBFJng7gpeWz/jP5ae9EY5pa27GOuZqYD0KhPQ5jFhsgAmdDG', NULL, '2025-08-20 18:26:20', '2025-08-17 16:36:22', '2025-08-22 13:21:06', NULL, 0),
(16, 'primeadmin@primeadmin.cz', '$2y$12$nkO/meLFwJWy0US8JxNEg.zO2Enb3qyOdsY6GdqI9gSNVALtlno52', NULL, '2026-01-05 18:39:36', '2025-08-20 11:01:19', '2026-01-05 18:39:36', NULL, 0),
(18, 'admin3@example.com', '$2y$12$izfWlAVFHIxkj8bTAVMLw..Kd6q36xvdL6/8MaYK0Yo5YM5FekF8W', NULL, '2025-08-20 18:59:20', '2025-08-20 18:30:58', '2025-08-22 13:21:14', NULL, 0),
(19, 'admin4@example.com', '$2y$12$i2aNPTOXj4SvgzYk1v1Or.lVnWHbe.zxH5eSjIJJd3q2UvnpiX7Ca', NULL, '2025-08-20 18:55:09', '2025-08-20 18:31:09', '2025-08-22 13:21:27', NULL, 0),
(20, 'admin5@example.com', '$2y$12$W1R9lYFf/0ZzkVsj.sMHQuYmuhXMU1NSs0VpLjkzqWgb8AF4UHq9e', NULL, '2025-08-20 18:55:49', '2025-08-20 18:31:24', '2025-08-22 13:21:45', NULL, 0),
(21, 'jonasbucina@rpsw.cz', '$2y$12$sahhjHl6M2FjSYkTg9ABgOwNCOkdZOOmmsyH1S/Q2SpZMmzrhCnPy', NULL, '2026-01-11 19:45:06', '2026-01-05 18:36:11', '2026-01-11 19:45:06', NULL, 0),
(22, 'jonasbucina@rpsw.czsdfsdfd', '$2y$12$gOo6KAJNqIvcmryvecJtAO5Hhr3i09ImYZE46xmucuF0KiOXqHuOC', NULL, NULL, '2026-01-07 00:26:38', '2026-01-07 00:33:35', '2026-01-07 00:33:35', 0),
(23, 'test@test.cz', '$2y$12$VgnDlzEttdLAI3NozFKOoOuAv4GXEjwrQlvGmNl5xUVNScQWX4Bk6', NULL, '2026-01-11 19:44:52', '2026-01-10 09:46:59', '2026-01-11 19:44:52', NULL, 0);

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
(1, 1),
(11, 2),
(16, 3),
(18, 2),
(19, 2),
(20, 1),
(21, 1),
(22, 2),
(23, 2);

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
  MODIFY `business_log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1022;

--
-- AUTO_INCREMENT for table `raw_request_commissions`
--
ALTER TABLE `raw_request_commissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `user_login_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ur_user_login_id` FOREIGN KEY (`user_login_id`) REFERENCES `user_login` (`user_login_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
