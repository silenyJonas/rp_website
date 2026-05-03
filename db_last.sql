-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 30, 2026 at 02:29 PM
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
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `core_permissions`
--

CREATE TABLE `core_permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `module` varchar(50) DEFAULT 'core',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `core_permissions`
--

INSERT INTO `core_permissions` (`id`, `permission_key`, `description`, `module`, `created_at`) VALUES
(1, 'web-manage-administrators', 'Správa administrátorských účtů', 'web', '2026-02-14 08:12:31'),
(2, 'web-view-web-logs', 'Prohlížení web logů', 'web', '2026-02-14 08:12:31'),
(3, 'web-view-personal-info', 'Zobrazení osobních údajů', 'web', '2026-02-14 08:12:31'),
(4, 'web-view-user-requests', 'Zobrazení uživatelských požadavků', 'web', '2026-02-14 08:12:31'),
(5, 'web-view-dashboard', 'Přístup k nástěnce', 'web', '2026-02-14 08:12:31'),
(6, 'web-view-edit-website', 'Možnost editovat web', 'web', '2026-02-14 08:12:31'),
(7, 'view-deleted', 'Zobrazit softdeleted záznamy', 'web', '2026-02-14 08:12:31'),
(8, 'web-view-sales-leads', 'Zobrazit Sales Leads', 'web', '2026-02-14 08:12:31'),
(9, 'web-view-news', 'Může vidět a editovat News', 'web', '2026-02-14 08:12:31'),
(10, 'web-view-sales-orders', 'Vidí poptávkové listy od klientů', 'web', '2026-02-14 08:12:31'),
(11, 'web-view-support-tickets', 'Může zobrazit tikety zaslané na podporu', 'web', '2026-02-14 08:12:31'),
(12, 'web-view-job-applications', 'Může zobrazit seznam uchazečů', 'web', '2026-02-14 08:12:31'),
(13, 'shop-manage-products', 'Správa produktů v e-shopu', 'shop', '2026-03-22 08:12:31'),
(14, 'shop-manage-categories', 'Správa kategorií produktů', 'shop', '2026-03-22 08:12:31'),
(15, 'shop-view-orders', 'Prohlížení objednávek e-shopu', 'shop', '2026-03-22 08:12:31'),
(16, 'shop-manage-customers', 'Správa zákazníků e-shopu', 'shop', '2026-03-22 08:12:31'),
(17, 'shop-view-reports', 'Prohlížení reportů e-shopu', 'shop', '2026-03-22 08:12:31'),
(18, 'view-web', 'Zobrazit Web sekci Administrace.', 'core', '2026-03-25 11:37:06'),
(19, 'view-eshop', 'Zobrazit Eshop sekci Administrace.', 'core', '2026-03-25 11:37:06'),
(20, 'shop-view-dashboard', 'Zobrazit dashboard Eshop sekce administrace.', 'core', '2026-03-25 11:42:21'),
(21, 'shop-view-logs', 'Může zobrazit logy eshopu.', 'core', '2026-03-26 22:39:15'),
(22, 'shop-manage-shipping-methods', 'Zobrazit metody dopravy.', 'core', '2026-03-27 14:41:13'),
(23, 'shop-manage-suppliers', 'Zobrazit dodavatele.', 'core', '2026-03-27 14:41:13'),
(24, 'shop-manage-payment-methods', 'Zobrazit způsoby plateb.', 'core', '2026-03-27 14:49:37');

-- --------------------------------------------------------

--
-- Table structure for table `core_roles`
--

CREATE TABLE `core_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `core_roles`
--

INSERT INTO `core_roles` (`id`, `role_name`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'sysadmin', 'Systémový administrátor - má vše', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(2, 'admin', 'Administrátor - správa webu', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(3, 'primeadmin', 'Primární administrátor - správa admins', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(4, 'UI/UX Designer', 'Designer - správa UI/UX', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(5, 'Salesman', 'Prodejce - správa sales', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(6, 'shop-manager', 'Manager e-shopu', '2026-03-22 08:12:31', '2026-03-22 08:12:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `core_role_permissions`
--

CREATE TABLE `core_role_permissions` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `core_role_permissions`
--

INSERT INTO `core_role_permissions` (`role_id`, `permission_id`) VALUES
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
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(2, 3),
(2, 4),
(2, 5),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(2, 12),
(2, 13),
(2, 14),
(2, 15),
(2, 16),
(2, 18),
(2, 19),
(2, 20),
(2, 21),
(3, 1),
(3, 2),
(3, 5),
(3, 18),
(4, 3),
(4, 5),
(4, 6),
(4, 18),
(5, 3),
(5, 5),
(5, 8),
(5, 10),
(5, 18),
(6, 5),
(6, 13),
(6, 14),
(6, 15),
(6, 16),
(6, 17),
(6, 18),
(6, 19),
(6, 20),
(6, 21);

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
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
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
(79, 'App\\Models\\User', 34, 'access-token', '46ffc555bdaa30fe9c7baf1ff082fbc0a7e78cf5bdf4a8a08580f153eab32b51', '[\"*\"]', '2026-02-15 22:39:32', '2026-02-15 23:09:32', '2026-02-15 22:39:32', '2026-02-15 22:39:32'),
(81, 'App\\Models\\User', 34, 'access-token', 'b68364618e440f61d911b78ad90ca53d74ec497c10d71d743a4e4eb20081c2d7', '[\"*\"]', '2026-02-15 22:39:56', '2026-02-15 23:09:56', '2026-02-15 22:39:56', '2026-02-15 22:39:56'),
(87, 'App\\Models\\User', 59, 'access-token', 'c58f7b40a4862562dc033216ec4ba476336d5cc77af42b57e8a6721e0c735545', '[\"*\"]', '2026-02-15 22:41:38', '2026-02-15 23:11:38', '2026-02-15 22:41:38', '2026-02-15 22:41:38'),
(134, 'App\\Models\\User', 62, 'access-token', '696da6ddfce759f43fcd6c430016ffff654238b4bd746c50642599a4b68a1cd7', '[\"*\"]', '2026-02-18 02:12:13', '2026-02-18 03:12:09', '2026-02-18 02:12:09', '2026-02-18 02:12:13'),
(172, 'App\\Models\\User', 77, 'access-token', 'f783051fdb88711a863e9ccd4e5176a5a3f2a3606204c816754c3227d07698f8', '[\"*\"]', '2026-02-25 00:08:53', '2026-02-25 00:42:29', '2026-02-24 23:42:29', '2026-02-25 00:08:53'),
(328, 'App\\Models\\User', 25, 'access-token', 'c3fbc89c3f7473fe9883d5dda2da7ad4fe36f966c4c1f2c0a6d3f4ffcb15dda1', '[\"*\"]', '2026-04-30 12:28:09', '2026-04-30 13:10:41', '2026-04-30 12:10:41', '2026-04-30 12:28:09');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`, `updated_at`) VALUES
(327, 25, 'fc5e0e5b49590b56da581066a85f5381459b18978a7ebde25737b896e65dcb31', '2026-05-07 12:10:41', '2026-04-30 12:10:41', '2026-04-30 12:10:41');

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

-- --------------------------------------------------------

--
-- Table structure for table `shop_categories`
--

CREATE TABLE `shop_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_categories`
--

INSERT INTO `shop_categories` (`id`, `name`, `slug`, `description`, `parent_id`, `image_path`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(51, 'testovaci_kat', 'testovaci-kat', NULL, NULL, NULL, 1, 0, '2026-04-27 22:14:28', '2026-04-29 21:19:07');

-- --------------------------------------------------------

--
-- Table structure for table `shop_coupons`
--

CREATE TABLE `shop_coupons` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` varchar(20) NOT NULL COMMENT 'percent, fixed',
  `discount_value` decimal(10,2) NOT NULL,
  `max_usage` int(11) DEFAULT NULL COMMENT 'NULL = neomezeno',
  `usage_count` int(11) DEFAULT 0,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `applies_to` varchar(50) DEFAULT 'all' COMMENT 'all, products, categories',
  `valid_from` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_coupons`
--

INSERT INTO `shop_coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `max_usage`, `usage_count`, `min_order_amount`, `applies_to`, `valid_from`, `valid_until`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'JONAS200', NULL, 'fixed', 200.00, 10, 1, 1000.00, 'all', '2026-04-16 00:00:00', '2026-05-10 00:00:00', 1, '2026-04-29 16:23:51', '2026-04-30 12:28:09', NULL),
(3, 'JONAS10', NULL, 'percent', 10.00, 10, 0, 0.00, 'all', NULL, NULL, 1, '2026-04-29 22:04:28', '2026-04-29 22:04:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_customers`
--

CREATE TABLE `shop_customers` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `total_spent` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_customers`
--

INSERT INTO `shop_customers` (`id`, `user_id`, `email`, `first_name`, `last_name`, `phone`, `company`, `address`, `city`, `postal_code`, `country`, `is_active`, `total_spent`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, 'jonas.bucina@seznam.cz', 'Joncl', 'Bučina', '733188328', 'Fonetika SS', 'Kytlicka 862/6', 'Praha', '19000', NULL, 1, 0.00, 'to jsem ja', '2026-04-29 16:20:28', '2026-04-29 16:21:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_logs`
--

CREATE TABLE `shop_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `origin` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `affected_entity_type` varchar(50) DEFAULT NULL,
  `affected_entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `context_data` text DEFAULT NULL,
  `user_id_plain` varchar(255) DEFAULT NULL,
  `user_plain` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shop_logs`
--

INSERT INTO `shop_logs` (`id`, `created_at`, `origin`, `event_type`, `module`, `description`, `affected_entity_type`, `affected_entity_id`, `user_id`, `context_data`, `user_id_plain`, `user_plain`) VALUES
(1, '2026-04-30 14:28:09', '127.0.0.1', 'create', 'ShopOrder', 'Vytvořena objednávka: 2026040001', 'ShopOrder', 4, 25, '\"{\\\"customer_id\\\":\\\"1\\\",\\\"payment_method_id\\\":\\\"2\\\",\\\"shipping_method_id\\\":\\\"2\\\",\\\"coupon_id\\\":\\\"2\\\",\\\"status\\\":\\\"pending\\\",\\\"payment_status\\\":\\\"pending\\\",\\\"shipping_address\\\":\\\"hjkh\\\",\\\"shipping_city\\\":\\\"jkh\\\",\\\"shipping_postal_code\\\":\\\"jkh\\\",\\\"shipping_country\\\":\\\"jk\\\",\\\"items\\\":[{\\\"product_id\\\":14,\\\"product_name\\\":\\\"test prod1\\\",\\\"product_variant_id\\\":\\\"18\\\",\\\"variant_name\\\":\\\"cerna prod\\\",\\\"quantity\\\":1,\\\"unit_price\\\":1000,\\\"total_price\\\":1000}],\\\"delete_items\\\":[]}\"', '25', 'Jonáš Bučina');

-- --------------------------------------------------------

--
-- Table structure for table `shop_orders`
--

CREATE TABLE `shop_orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, confirmed, processing, shipped, delivered, returned, canceled',
  `payment_status` varchar(50) DEFAULT 'pending' COMMENT 'pending, paid, failed, refunded, cod',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_id` int(10) UNSIGNED DEFAULT NULL,
  `payment_method_id` int(10) UNSIGNED DEFAULT NULL,
  `shipping_method_id` int(10) UNSIGNED DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_postal_code` varchar(10) DEFAULT NULL,
  `shipping_country` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_orders`
--

INSERT INTO `shop_orders` (`id`, `customer_id`, `order_number`, `status`, `payment_status`, `total_amount`, `shipping_amount`, `tax_amount`, `discount_amount`, `final_amount`, `coupon_id`, `payment_method_id`, `shipping_method_id`, `shipping_address`, `shipping_city`, `shipping_postal_code`, `shipping_country`, `notes`, `paid_at`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(4, 1, '2026040001', 'pending', 'pending', 1000.00, 250.00, 0.00, 200.00, 1050.00, 2, 2, 2, 'hjkh', 'jkh', 'jkh', 'jk', NULL, NULL, NULL, NULL, '2026-04-30 12:28:09', '2026-04-30 12:28:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_order_items`
--

CREATE TABLE `shop_order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `product_variant_id` int(10) UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) NOT NULL COMMENT 'Kopie názvu (pro historii)',
  `variant_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_order_items`
--

INSERT INTO `shop_order_items` (`id`, `order_id`, `product_id`, `product_variant_id`, `product_name`, `variant_name`, `quantity`, `unit_price`, `total_price`, `discount_amount`, `created_at`, `updated_at`) VALUES
(1, 4, 14, 18, 'test prod1', 'cerna prod', 1, 1000.00, 1000.00, 0.00, '2026-04-30 12:28:09', '2026-04-30 12:28:09');

-- --------------------------------------------------------

--
-- Table structure for table `shop_payment_methods`
--

CREATE TABLE `shop_payment_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL COMMENT 'např. stripe, bank_transfer, cod',
  `name` varchar(100) NOT NULL COMMENT 'Název pro zákazníka',
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Poplatek za platbu',
  `provider` varchar(50) NOT NULL DEFAULT 'manual' COMMENT 'stripe, paypal, manual, atd.',
  `is_external` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = manuální/v e-shopu, 1 = přesměrování na bránu',
  `bank_account_number` varchar(50) DEFAULT NULL COMMENT 'Číslo účtu bez kódu banky',
  `bank_account_code` varchar(10) DEFAULT NULL COMMENT 'Kód banky (např. 0100)',
  `bank_iban` varchar(34) DEFAULT NULL COMMENT 'Pro mezinárodní platby',
  `bank_swift_bic` varchar(11) DEFAULT NULL,
  `variable_symbol_type` enum('order_number','phone_number','none') DEFAULT 'order_number',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft Delete pro koš'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_payment_methods`
--

INSERT INTO `shop_payment_methods` (`id`, `code`, `name`, `description`, `price`, `provider`, `is_external`, `bank_account_number`, `bank_account_code`, `bank_iban`, `bank_swift_bic`, `variable_symbol_type`, `is_active`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'stripe_card', 'Platební karta', 'Rychlá platba kartou přes zabezpečenou bránu Stripe', 0.00, 'stripe', 1, NULL, NULL, NULL, NULL, 'none', 1, 1, '2026-04-09 21:48:12', '2026-04-09 21:48:12', NULL),
(2, 'bank_transfer', 'Bankovní převod', 'Platba předem na náš bankovní účet. Zboží odesíláme po připsání platby.', 0.00, 'manual', 0, '2201992201', '2010', NULL, NULL, 'order_number', 1, 2, '2026-04-09 21:48:12', '2026-04-09 21:48:12', NULL),
(3, 'paypal', 'PayPal', 'Platba přes PayPal účet nebo kartou', 0.00, 'paypal', 1, NULL, NULL, NULL, NULL, 'none', 1, 3, '2026-04-09 21:48:12', '2026-04-09 21:48:12', NULL),
(4, 'cash_on_delivery', 'Platba při převzetí (Dobírka)', 'Zaplatíte hotově nebo kartou kurýrovi při převzetí zásilky.', 49.00, 'manual', 0, NULL, NULL, NULL, NULL, 'none', 1, 4, '2026-04-09 21:48:12', '2026-04-09 21:48:12', NULL),
(5, 'apple_google_pay', 'Apple Pay / Google Pay', 'Moderní a rychlá platba mobilním telefonem', 0.00, 'stripe', 1, NULL, NULL, NULL, NULL, 'none', 1, 5, '2026-04-09 21:48:12', '2026-04-09 21:48:12', NULL),
(6, 'cash', 'Hotovost', NULL, 0.00, 'manual', 0, '123123123', '123123', NULL, NULL, 'none', 1, 6, '2026-04-29 21:03:53', '2026-04-29 21:18:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_products`
--

CREATE TABLE `shop_products` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `supplier_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `stock_warning_level` int(11) DEFAULT 10,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_products`
--

INSERT INTO `shop_products` (`id`, `category_id`, `supplier_id`, `name`, `slug`, `description`, `short_description`, `price`, `cost_price`, `sku`, `stock_quantity`, `stock_warning_level`, `is_active`, `is_featured`, `created_at`, `updated_at`, `deleted_at`) VALUES
(14, 51, 3, 'test prod1', 'test-prod', 'lk', 'lk', 1000.00, 100.00, 'QWE', 10, 10, 1, 0, '2026-04-27 22:14:53', '2026-04-29 21:30:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_product_images`
--

CREATE TABLE `shop_product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `variant_id` int(10) UNSIGNED DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shop_product_variants`
--

CREATE TABLE `shop_product_variants` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `variant_name` varchar(100) NOT NULL COMMENT 'např. "Černá - Velikost M"',
  `attribute_1_name` varchar(50) DEFAULT NULL COMMENT 'např. "Barva"',
  `attribute_1_value` varchar(100) DEFAULT NULL COMMENT 'např. "Černá"',
  `attribute_2_name` varchar(50) DEFAULT NULL COMMENT 'např. "Velikost"',
  `attribute_2_value` varchar(100) DEFAULT NULL COMMENT 'např. "M"',
  `sku_variant` varchar(50) DEFAULT NULL,
  `price_with_vat` decimal(10,2) DEFAULT 0.00 COMMENT 'Cena S DPH',
  `price_without_vat` decimal(10,2) DEFAULT 0.00 COMMENT 'Cena BEZ DPH',
  `vat_rate` decimal(5,2) DEFAULT 21.00 COMMENT 'DPH sazba (%)',
  `stock_quantity` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_product_variants`
--

INSERT INTO `shop_product_variants` (`id`, `product_id`, `variant_name`, `attribute_1_name`, `attribute_1_value`, `attribute_2_name`, `attribute_2_value`, `sku_variant`, `price_with_vat`, `price_without_vat`, `vat_rate`, `stock_quantity`, `created_at`, `updated_at`, `deleted_at`) VALUES
(18, 14, 'cerna prod', 'Barva', 'Cerna', 'Velikost', 'M', 'asdasd', 1000.00, 826.45, 21.00, 10, '2026-04-29 21:30:47', '2026-04-29 22:04:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_reviews`
--

CREATE TABLE `shop_reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED DEFAULT NULL,
  `rating` tinyint(1) NOT NULL COMMENT '1-5',
  `title` varchar(100) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shop_shipping_methods`
--

CREATE TABLE `shop_shipping_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL COMMENT 'např. ppl_parcel, zasilkovna, osobni_odber',
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `shipping_type` varchar(30) NOT NULL DEFAULT 'address',
  `base_price` decimal(8,2) NOT NULL DEFAULT 0.00,
  `free_shipping_threshold` decimal(10,2) DEFAULT NULL,
  `max_weight` decimal(8,2) DEFAULT NULL,
  `requires_pickup_point` tinyint(1) DEFAULT 0 COMMENT '1 = vyžaduje výběr pobočky (mapu)',
  `allows_cod` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = nepodporuje dobírku',
  `cod_price` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Příplatek za dobírku',
  `tracking_url` varchar(255) DEFAULT NULL COMMENT 'Např. https://www.ppl.cz/vyhledat-balik?slug={T}',
  `logo_path` varchar(255) DEFAULT NULL,
  `delivery_days_min` int(11) DEFAULT NULL,
  `delivery_days_max` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_shipping_methods`
--

INSERT INTO `shop_shipping_methods` (`id`, `code`, `name`, `description`, `shipping_type`, `base_price`, `free_shipping_threshold`, `max_weight`, `requires_pickup_point`, `allows_cod`, `cod_price`, `tracking_url`, `logo_path`, `delivery_days_min`, `delivery_days_max`, `is_active`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'standard', 'Standardní doprava', NULL, 'pickup_point', 100.00, NULL, NULL, 0, 0, 0.00, NULL, NULL, 3, 5, 0, 1, '2026-03-24 17:14:02', '2026-04-09 21:16:43', NULL),
(2, 'express', 'Expresní doprava', NULL, 'address', 250.00, NULL, NULL, 0, 0, 0.00, NULL, NULL, 1, 2, 1, 2, '2026-03-24 17:14:02', '2026-03-24 17:14:02', NULL),
(3, 'dhl', 'DHL kurýr', NULL, 'address', 300.00, NULL, NULL, 0, 0, 0.00, NULL, NULL, 1, 1, 1, 3, '2026-03-24 17:14:02', '2026-03-24 17:14:02', NULL),
(4, 'pickup', 'Vyzvednutí na pobočce', NULL, 'address', 0.00, NULL, NULL, 0, 0, 0.00, NULL, NULL, 1, 3, 1, 4, '2026-03-24 17:14:02', '2026-03-24 17:14:02', NULL),
(5, 'foneticke_sluzby', 'Fonetický Express', NULL, 'address', 199.00, 1999.00, 10.00, 0, 0, 0.00, NULL, NULL, 5, 14, 0, 5, '2026-04-09 21:01:44', '2026-04-29 22:14:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shop_suppliers`
--

CREATE TABLE `shop_suppliers` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `ico` varchar(20) DEFAULT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_suppliers`
--

INSERT INTO `shop_suppliers` (`id`, `name`, `ico`, `contact_person`, `email`, `phone`, `address`, `city`, `postal_code`, `country`, `payment_terms`, `is_active`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'Fonetický Express', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-04-10 21:31:05', '2026-04-10 21:31:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_email`, `contact_email`, `full_name`, `birth_date`, `personal_id_num`, `address`, `bank_account`, `health_insurance`, `commission_rate`, `dpp_hours_spent`, `has_tax_declaration`, `phone_number`, `internal_note`, `user_password_hash`, `user_password_salt`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`) VALUES
(25, 'joncl', 'jonasbucina@rpsw.cz', 'Jonáš Bučina', NULL, NULL, NULL, NULL, NULL, 10, 0, 0, NULL, NULL, '$2y$12$rV1ILe7YeW1L1XfWb5DrfuiCYTC.1FZsIU4wtNmA95GaUNwXAtYoa', NULL, '2026-04-27 23:20:04', '2026-02-14 08:12:31', '2026-04-27 23:20:04', NULL, 0),
(30, 'prime_admin', NULL, 'Prime Admin', NULL, NULL, NULL, NULL, NULL, 10, 0, 0, NULL, NULL, '$2y$12$NEiDrqVCChulf9S/EUPIpeOHScIM0zwswPTxIFamRDrY4XajgHQOe', NULL, NULL, '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL, 0),
(34, 'lindicka', 'lindicka@mazliva.cz', 'Lindička Trýbíčková Mazliva', NULL, NULL, NULL, NULL, NULL, 10, 0, 0, NULL, NULL, '$2y$12$xbMrIDwkEj.ZOnsLe7Glr..2qbca1i7XnSclNnGILENFKlL.Kw9.W', NULL, '2026-02-15 23:39:56', '2026-02-14 08:12:31', '2026-02-20 23:59:34', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(25, 1),
(30, 3),
(34, 5);

-- --------------------------------------------------------

--
-- Table structure for table `web_job_applications`
--

CREATE TABLE `web_job_applications` (
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
-- Table structure for table `web_logs`
--

CREATE TABLE `web_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `origin` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `affected_entity_type` varchar(50) DEFAULT NULL,
  `affected_entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `context_data` text DEFAULT NULL,
  `user_id_plain` varchar(255) DEFAULT NULL,
  `user_plain` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `web_logs`
--

INSERT INTO `web_logs` (`id`, `created_at`, `origin`, `event_type`, `module`, `description`, `affected_entity_type`, `affected_entity_id`, `user_id`, `context_data`, `user_id_plain`, `user_plain`) VALUES
(1, '2026-04-09 23:48:34', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(2, '2026-04-09 23:55:22', '127.0.0.1', 'logout', 'Auth', 'Uživatel se odhlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(3, '2026-04-10 19:17:00', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(4, '2026-04-11 12:19:06', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(5, '2026-04-12 23:40:50', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(6, '2026-04-17 23:33:44', '127.0.0.1', 'logout', 'Auth', 'Uživatel se odhlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(7, '2026-04-17 23:33:49', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(8, '2026-04-18 00:02:51', 'GenericTable', 'DATA_EXPORT', 'shop/logs', 'Uživatel exportoval 46 záznamů z tabulky: Seznam e-shopových událostí systému.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(9, '2026-04-20 18:47:48', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(10, '2026-04-27 18:16:40', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl'),
(11, '2026-04-27 18:42:43', 'GenericTable', 'DATA_EXPORT', 'shop/payment_methods', 'Uživatel exportoval 5 záznamů z tabulky: Seznam aktivních platebních metod.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(12, '2026-04-27 18:45:56', '127.0.0.1', 'create', 'WebRawRequestCommission', 'Vytvořen požadavek na provizi: asdas', 'WebRawRequestCommission', 4, 25, '\"{\\\"thema\\\":\\\"asdas\\\",\\\"contact_email\\\":\\\"asd@sdf.cz\\\",\\\"contact_phone\\\":null,\\\"status\\\":\\\"Nov\\u011b zadan\\u00e9\\\",\\\"priority\\\":\\\"N\\u00edzk\\u00e1\\\",\\\"order_description\\\":\\\"jk\\\",\\\"note\\\":null}\"', '25', 'joncl'),
(13, '2026-04-27 18:45:59', 'GenericTable', 'DATA_EXPORT', 'web/raw_request_commissions', 'Uživatel exportoval 1 záznamů z tabulky: Seznam aktivních požadavků.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(14, '2026-04-27 18:51:01', '127.0.0.1', 'export', 'WebSalesLead', 'Hromadný export obchodních leadů.', 'WebSalesLead', NULL, 25, '\"{\\\"sort_by\\\":\\\"id\\\",\\\"sort_direction\\\":\\\"desc\\\",\\\"no_pagination\\\":\\\"true\\\"}\"', '25', 'joncl'),
(15, '2026-04-27 18:51:32', 'GenericTable', 'DATA_EXPORT', 'web/raw_request_commissions', 'Uživatel exportoval 1 záznamů z tabulky: Seznam aktivních požadavků.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(16, '2026-04-27 18:51:53', '127.0.0.1', 'DATA_EXPORT', 'web/raw_request_commissions', 'Uživatel exportoval 1 záznamů z tabulky: Seznam aktivních požadavků.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(17, '2026-04-27 18:52:00', '127.0.0.1', 'export', 'WebSalesLead', 'Hromadný export obchodních leadů.', 'WebSalesLead', NULL, 25, '\"{\\\"sort_by\\\":\\\"id\\\",\\\"sort_direction\\\":\\\"desc\\\",\\\"no_pagination\\\":\\\"true\\\"}\"', '25', 'joncl'),
(18, '2026-04-27 18:53:17', '127.0.0.1', 'export', 'WebSalesLead', 'Hromadný export obchodních leadů.', 'WebSalesLead', NULL, 25, '\"{\\\"sort_by\\\":\\\"id\\\",\\\"sort_direction\\\":\\\"desc\\\",\\\"no_pagination\\\":\\\"true\\\"}\"', '25', 'joncl'),
(19, '2026-04-27 21:44:28', '127.0.0.1', 'DATA_EXPORT', 'shop/logs', 'Uživatel exportoval 42 záznamů z tabulky: Seznam e-shopových událostí systému.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(20, '2026-04-27 22:28:09', '127.0.0.1', 'DATA_EXPORT', 'shop/products', 'Uživatel exportoval 1 záznamů z tabulky: Seznam produktů.', 'collection', NULL, 25, NULL, '25', 'joncl'),
(21, '2026-04-27 23:20:04', '127.0.0.1', 'login_success', 'Auth', 'Uživatel se úspěšně přihlásil: joncl', 'User', 25, 25, '\"{\\\"ip\\\":\\\"127.0.0.1\\\",\\\"user_agent\\\":\\\"Mozilla\\\\\\/5.0 (X11; Linux x86_64; rv:145.0) Gecko\\\\\\/20100101 Firefox\\\\\\/145.0\\\"}\"', '25', 'joncl');

-- --------------------------------------------------------

--
-- Table structure for table `web_news`
--

CREATE TABLE `web_news` (
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

-- --------------------------------------------------------

--
-- Table structure for table `web_raw_request_commissions`
--

CREATE TABLE `web_raw_request_commissions` (
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
-- Dumping data for table `web_raw_request_commissions`
--

INSERT INTO `web_raw_request_commissions` (`id`, `thema`, `contact_email`, `contact_phone`, `order_description`, `status`, `priority`, `created_at`, `updated_at`, `deleted_at`, `note`) VALUES
(4, 'asdas', 'asd@sdf.cz', NULL, 'jk', 'Nově zadané', 'Nízká', '2026-04-27 16:45:56', '2026-04-27 16:45:56', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `web_sales_leads`
--

CREATE TABLE `web_sales_leads` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `salesman_name` varchar(255) NOT NULL,
  `first_contact_date` date DEFAULT NULL,
  `subject_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `source_channel` varchar(255) NOT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `priority` varchar(255) DEFAULT 'Neutrální',
  `status` varchar(255) DEFAULT 'nové',
  `last_contact_date` date DEFAULT NULL,
  `next_step` varchar(255) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `contact_other` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_sales_orders`
--

CREATE TABLE `web_sales_orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `lead_id` int(10) UNSIGNED DEFAULT NULL,
  `salesman_name` varchar(255) DEFAULT NULL,
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
-- Table structure for table `web_support_tickets`
--

CREATE TABLE `web_support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_name_plain` varchar(255) NOT NULL,
  `user_plain` varchar(255) NOT NULL,
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

--
-- Dumping data for table `web_support_tickets`
--

INSERT INTO `web_support_tickets` (`id`, `user_id`, `user_name_plain`, `user_plain`, `category`, `priority`, `state`, `subject`, `description`, `attachment_path`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 25, 'Jonáš Bučina', 'joncl', 'it', 'low', 'new', 'ams,nda,smd', 'asdsd', NULL, '2026-04-07 21:36:00', '2026-04-09 20:18:45', '2026-04-09 20:18:45'),
(3, 25, 'Jonáš Bučina', 'joncl', 'it', 'low', 'new', 'asmdnasm,d', 'asdasd', NULL, '2026-04-09 19:47:05', '2026-04-09 20:18:41', '2026-04-09 20:18:41');

-- --------------------------------------------------------

--
-- Table structure for table `web_system_logs`
--

CREATE TABLE `web_system_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `origin` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `context_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `core_permissions`
--
ALTER TABLE `core_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_permission_key` (`permission_key`);

--
-- Indexes for table `core_roles`
--
ALTER TABLE `core_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `core_role_permissions`
--
ALTER TABLE `core_role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_crp_permission_id` (`permission_id`);

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
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_unique` (`token`),
  ADD KEY `tokenable_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_unique` (`token`),
  ADD KEY `fk_refresh_user_id` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shop_categories`
--
ALTER TABLE `shop_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_slug_per_level` (`slug`,`parent_id`),
  ADD KEY `idx_shop_categories_parent` (`parent_id`),
  ADD KEY `idx_shop_categories_active_sort` (`is_active`,`sort_order`);

--
-- Indexes for table `shop_coupons`
--
ALTER TABLE `shop_coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `shop_customers`
--
ALTER TABLE `shop_customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_shop_customers_user` (`user_id`);

--
-- Indexes for table `shop_logs`
--
ALTER TABLE `shop_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_logs_user_id` (`user_id`);

--
-- Indexes for table `shop_orders`
--
ALTER TABLE `shop_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `fk_shop_orders_customer` (`customer_id`),
  ADD KEY `fk_shop_orders_coupon` (`coupon_id`),
  ADD KEY `fk_shop_orders_payment` (`payment_method_id`),
  ADD KEY `fk_shop_orders_shipping` (`shipping_method_id`);

--
-- Indexes for table `shop_order_items`
--
ALTER TABLE `shop_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_order_items_order` (`order_id`),
  ADD KEY `fk_shop_order_items_product` (`product_id`),
  ADD KEY `fk_shop_order_items_variant` (`product_variant_id`);

--
-- Indexes for table `shop_payment_methods`
--
ALTER TABLE `shop_payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `shop_products`
--
ALTER TABLE `shop_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_shop_products_category` (`category_id`),
  ADD KEY `fk_shop_products_supplier` (`supplier_id`);

--
-- Indexes for table `shop_product_images`
--
ALTER TABLE `shop_product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_product_images_product` (`product_id`),
  ADD KEY `fk_shop_product_images_variant` (`variant_id`);

--
-- Indexes for table `shop_product_variants`
--
ALTER TABLE `shop_product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_variant` (`sku_variant`),
  ADD KEY `fk_shop_product_variants_product` (`product_id`);

--
-- Indexes for table `shop_reviews`
--
ALTER TABLE `shop_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_reviews_product` (`product_id`),
  ADD KEY `fk_shop_reviews_customer` (`customer_id`);

--
-- Indexes for table `shop_shipping_methods`
--
ALTER TABLE `shop_shipping_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `shop_suppliers`
--
ALTER TABLE `shop_suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ico` (`ico`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_email` (`user_email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `fk_ur_role_id` (`role_id`);

--
-- Indexes for table `web_job_applications`
--
ALTER TABLE `web_job_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_logs`
--
ALTER TABLE `web_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_logs_user_id` (`user_id`);

--
-- Indexes for table `web_news`
--
ALTER TABLE `web_news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_raw_request_commissions`
--
ALTER TABLE `web_raw_request_commissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_sales_leads`
--
ALTER TABLE `web_sales_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_sales_leads_user_id` (`user_id`);

--
-- Indexes for table `web_sales_orders`
--
ALTER TABLE `web_sales_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_sales_orders_lead_id` (`lead_id`);

--
-- Indexes for table `web_support_tickets`
--
ALTER TABLE `web_support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_support_user_id` (`user_id`);

--
-- Indexes for table `web_system_logs`
--
ALTER TABLE `web_system_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `core_permissions`
--
ALTER TABLE `core_permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `core_roles`
--
ALTER TABLE `core_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=329;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=328;

--
-- AUTO_INCREMENT for table `shop_categories`
--
ALTER TABLE `shop_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `shop_coupons`
--
ALTER TABLE `shop_coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shop_customers`
--
ALTER TABLE `shop_customers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shop_logs`
--
ALTER TABLE `shop_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shop_orders`
--
ALTER TABLE `shop_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `shop_order_items`
--
ALTER TABLE `shop_order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shop_payment_methods`
--
ALTER TABLE `shop_payment_methods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `shop_products`
--
ALTER TABLE `shop_products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `shop_product_images`
--
ALTER TABLE `shop_product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `shop_product_variants`
--
ALTER TABLE `shop_product_variants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `shop_reviews`
--
ALTER TABLE `shop_reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shop_shipping_methods`
--
ALTER TABLE `shop_shipping_methods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shop_suppliers`
--
ALTER TABLE `shop_suppliers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `web_job_applications`
--
ALTER TABLE `web_job_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `web_logs`
--
ALTER TABLE `web_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `web_news`
--
ALTER TABLE `web_news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `web_raw_request_commissions`
--
ALTER TABLE `web_raw_request_commissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `web_sales_leads`
--
ALTER TABLE `web_sales_leads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `web_sales_orders`
--
ALTER TABLE `web_sales_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `web_support_tickets`
--
ALTER TABLE `web_support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `web_system_logs`
--
ALTER TABLE `web_system_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `core_role_permissions`
--
ALTER TABLE `core_role_permissions`
  ADD CONSTRAINT `fk_crp_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `core_permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_crp_role_id` FOREIGN KEY (`role_id`) REFERENCES `core_roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shop_categories`
--
ALTER TABLE `shop_categories`
  ADD CONSTRAINT `fk_shop_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `shop_categories` (`id`);

--
-- Constraints for table `shop_customers`
--
ALTER TABLE `shop_customers`
  ADD CONSTRAINT `fk_shop_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shop_logs`
--
ALTER TABLE `shop_logs`
  ADD CONSTRAINT `fk_shop_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shop_orders`
--
ALTER TABLE `shop_orders`
  ADD CONSTRAINT `fk_shop_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `shop_coupons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shop_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `shop_customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_orders_payment` FOREIGN KEY (`payment_method_id`) REFERENCES `shop_payment_methods` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shop_orders_shipping` FOREIGN KEY (`shipping_method_id`) REFERENCES `shop_shipping_methods` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shop_order_items`
--
ALTER TABLE `shop_order_items`
  ADD CONSTRAINT `fk_shop_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `shop_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`),
  ADD CONSTRAINT `fk_shop_order_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `shop_product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shop_products`
--
ALTER TABLE `shop_products`
  ADD CONSTRAINT `fk_shop_products_category` FOREIGN KEY (`category_id`) REFERENCES `shop_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `shop_suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shop_product_images`
--
ALTER TABLE `shop_product_images`
  ADD CONSTRAINT `fk_shop_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_product_images_variant` FOREIGN KEY (`variant_id`) REFERENCES `shop_product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shop_product_variants`
--
ALTER TABLE `shop_product_variants`
  ADD CONSTRAINT `fk_shop_product_variants_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shop_reviews`
--
ALTER TABLE `shop_reviews`
  ADD CONSTRAINT `fk_shop_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `shop_customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shop_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_role_id` FOREIGN KEY (`role_id`) REFERENCES `core_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ur_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `web_logs`
--
ALTER TABLE `web_logs`
  ADD CONSTRAINT `fk_web_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `web_sales_leads`
--
ALTER TABLE `web_sales_leads`
  ADD CONSTRAINT `fk_web_sales_leads_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `web_sales_orders`
--
ALTER TABLE `web_sales_orders`
  ADD CONSTRAINT `fk_web_sales_orders_lead_id` FOREIGN KEY (`lead_id`) REFERENCES `web_sales_leads` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `web_support_tickets`
--
ALTER TABLE `web_support_tickets`
  ADD CONSTRAINT `fk_web_support_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
