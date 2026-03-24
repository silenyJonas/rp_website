-- ============================================
-- Database: `rp_website` - REORGANIZOVANÁ STRUKTURA S KOMPLEXNÍM ESHOPEM
-- ============================================
-- Prefixování:
-- - web_* = původní funkcionalita webu (BEZE ZMĚN)
-- - core_* = sdílené systémové věci (BEZE ZMĚN)
-- - shop_* = nová rozšířená e-shop funkcionalita
-- - laravel tabulky zůstávají beze změn: users, cache, jobs, sessions, migrations
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================
-- LARAVEL CORE TABULKY (BEZ ZMĚN)
-- ============================================

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

INSERT INTO `users` (`id`, `user_email`, `contact_email`, `full_name`, `birth_date`, `personal_id_num`, `address`, `bank_account`, `health_insurance`, `commission_rate`, `dpp_hours_spent`, `has_tax_declaration`, `phone_number`, `internal_note`, `user_password_hash`, `user_password_salt`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`) VALUES
(25, 'joncl', 'jonasbucina@rpsw.cz', 'Jonáš Bučina', NULL, NULL, NULL, NULL, NULL, 10, 0, 0, NULL, NULL, '$2y$12$rV1ILe7YeW1L1XfWb5DrfuiCYTC.1FZsIU4wtNmA95GaUNwXAtYoa', NULL, '2026-03-22 18:33:39', '2026-02-14 08:12:31', '2026-03-22 18:33:39', NULL, 0),
(30, 'prime_admin', NULL, 'Prime Admin', NULL, NULL, NULL, NULL, NULL, 10, 0, 0, NULL, NULL, '$2y$12$NEiDrqVCChulf9S/EUPIpeOHScIM0zwswPTxIFamRDrY4XajgHQOe', NULL, NULL, '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL, 0),
(34, 'lindicka', 'lindicka@mazliva.cz', 'Lindička Trýbíčková Mazliva', NULL, NULL, NULL, NULL, NULL, 10, 0, 0, NULL, NULL, '$2y$12$xbMrIDwkEj.ZOnsLe7Glr..2qbca1i7XnSclNnGILENFKlL.Kw9.W', NULL, '2026-02-15 23:39:56', '2026-02-14 08:12:31', '2026-02-20 23:59:34', NULL, 0);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_email` (`user_email`);

ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

-- ============================================
-- CORE PERMISSIONS (SDÍLENÉ) - BEZ ZMĚN
-- ============================================

CREATE TABLE `core_permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `module` varchar(50) DEFAULT 'core',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `core_permissions` (`id`, `permission_key`, `description`, `module`, `created_at`) VALUES
(1, 'manage-administrators', 'Správa administrátorských účtů', 'web', '2026-02-14 08:12:31'),
(2, 'view-business-logs', 'Prohlížení business logů', 'web', '2026-02-14 08:12:31'),
(3, 'view-personal-info', 'Zobrazení osobních údajů', 'web', '2026-02-14 08:12:31'),
(4, 'view-user-requests', 'Zobrazení uživatelských požadavků', 'web', '2026-02-14 08:12:31'),
(5, 'view-dashboard', 'Přístup k nástěnce', 'web', '2026-02-14 08:12:31'),
(6, 'view-edit-website', 'Možnost editovat web', 'web', '2026-02-14 08:12:31'),
(7, 'view-deleted', 'Zobrazit softdeleted záznamy', 'web', '2026-02-14 08:12:31'),
(8, 'view-sales-leads', 'Zobrazit Sales Leads', 'web', '2026-02-14 08:12:31'),
(9, 'view-news', 'Může vidět a editovat News', 'web', '2026-02-14 08:12:31'),
(10, 'view-sales-orders', 'Vidí poptávkové listy od klientů', 'web', '2026-02-14 08:12:31'),
(11, 'view-support-tickets', 'Může zobrazit tikety zaslané na podporu', 'web', '2026-02-14 08:12:31'),
(12, 'view-job-applications', 'Může zobrazit seznam uchazečů', 'web', '2026-02-14 08:12:31'),
(13, 'shop-manage-products', 'Správa produktů v e-shopu', 'shop', '2026-03-22 08:12:31'),
(14, 'shop-manage-categories', 'Správa kategorií produktů', 'shop', '2026-03-22 08:12:31'),
(15, 'shop-view-orders', 'Prohlížení objednávek e-shopu', 'shop', '2026-03-22 08:12:31'),
(16, 'shop-manage-customers', 'Správa zákazníků e-shopu', 'shop', '2026-03-22 08:12:31'),
(17, 'shop-view-reports', 'Prohlížení reportů e-shopu', 'shop', '2026-03-22 08:12:31');

ALTER TABLE `core_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_permission_key` (`permission_key`);

ALTER TABLE `core_permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

-- ============================================
-- CORE ROLES (SDÍLENÉ ROLE) - BEZ ZMĚN
-- ============================================

CREATE TABLE `core_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `core_roles` (`id`, `role_name`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'sysadmin', 'Systémový administrátor - má vše', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(2, 'admin', 'Administrátor - správa webu', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(3, 'primeadmin', 'Primární administrátor - správa admins', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(4, 'UI/UX Designer', 'Designer - správa UI/UX', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(5, 'Salesman', 'Prodejce - správa sales', '2026-02-14 08:12:31', '2026-02-14 08:12:31', NULL),
(6, 'shop-manager', 'Manager e-shopu', '2026-03-22 08:12:31', '2026-03-22 08:12:31', NULL);

ALTER TABLE `core_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

ALTER TABLE `core_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

-- ============================================
-- CORE ROLE-PERMISSIONS MAPOVÁNÍ - BEZ ZMĚN
-- ============================================

CREATE TABLE `core_role_permissions` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `core_role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12),
(1, 13), (1, 14), (1, 15), (1, 16), (1, 17),
(2, 3), (2, 4), (2, 5), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12),
(2, 13), (2, 14), (2, 15), (2, 16),
(3, 1), (3, 2), (3, 5),
(4, 3), (4, 5), (4, 6),
(5, 3), (5, 5), (5, 8), (5, 10),
(6, 5), (6, 13), (6, 14), (6, 15), (6, 16), (6, 17);

ALTER TABLE `core_role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_crp_permission_id` (`permission_id`);

ALTER TABLE `core_role_permissions`
  ADD CONSTRAINT `fk_crp_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `core_permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_crp_role_id` FOREIGN KEY (`role_id`) REFERENCES `core_roles` (`id`) ON DELETE CASCADE;

-- ============================================
-- USER-ROLES MAPOVÁNÍ - BEZ ZMĚN
-- ============================================

CREATE TABLE `user_roles` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(25, 1),
(30, 3),
(34, 5);

ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `fk_ur_role_id` (`role_id`);

ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_role_id` FOREIGN KEY (`role_id`) REFERENCES `core_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ur_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- ============================================
-- WEB MODULE - LOGS - BEZ ZMĚN
-- ============================================

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
  `user_email_plain` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `web_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_logs_user_id` (`user_id`);

ALTER TABLE `web_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `web_logs`
  ADD CONSTRAINT `fk_web_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ============================================
-- WEB MODULE - SYSTEM LOGS - BEZ ZMĚN
-- ============================================

CREATE TABLE `web_system_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `origin` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `context_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `web_system_logs`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `web_system_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- WEB MODULE - NEWS - BEZ ZMĚN
-- ============================================

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

ALTER TABLE `web_news`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `web_news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ============================================
-- WEB MODULE - SUPPORT TICKETS - BEZ ZMĚN
-- ============================================

CREATE TABLE `web_support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
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

ALTER TABLE `web_support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_support_user_id` (`user_id`);

ALTER TABLE `web_support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `web_support_tickets`
  ADD CONSTRAINT `fk_web_support_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ============================================
-- WEB MODULE - JOB APPLICATIONS - BEZ ZMĚN
-- ============================================

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

ALTER TABLE `web_job_applications`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `web_job_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- WEB MODULE - SALES LEADS - BEZ ZMĚN
-- ============================================

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

ALTER TABLE `web_sales_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_sales_leads_user_id` (`user_id`);

ALTER TABLE `web_sales_leads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `web_sales_leads`
  ADD CONSTRAINT `fk_web_sales_leads_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ============================================
-- WEB MODULE - SALES ORDERS - BEZ ZMĚN
-- ============================================

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

ALTER TABLE `web_sales_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_web_sales_orders_lead_id` (`lead_id`);

ALTER TABLE `web_sales_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `web_sales_orders`
  ADD CONSTRAINT `fk_web_sales_orders_lead_id` FOREIGN KEY (`lead_id`) REFERENCES `web_sales_leads` (`id`) ON DELETE SET NULL;

-- ============================================
-- WEB MODULE - RAW REQUEST COMMISSIONS - BEZ ZMĚN
-- ============================================

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

ALTER TABLE `web_raw_request_commissions`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `web_raw_request_commissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - LOGS
-- ============================================

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
  `context_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `shop_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_logs_user_id` (`user_id`);

ALTER TABLE `shop_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `shop_logs`
  ADD CONSTRAINT `fk_shop_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ============================================
-- SHOP MODULE - CATEGORIES
-- ============================================

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `shop_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_shop_categories_parent` (`parent_id`);

ALTER TABLE `shop_categories`
  ADD CONSTRAINT `fk_shop_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `shop_categories` (`id`) ON DELETE SET NULL;

ALTER TABLE `shop_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - SUPPLIERS (DODAVATELÉ)
-- ============================================

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

ALTER TABLE `shop_suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ico` (`ico`);

ALTER TABLE `shop_suppliers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - PRODUCTS
-- ============================================

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

ALTER TABLE `shop_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_shop_products_category` (`category_id`),
  ADD KEY `fk_shop_products_supplier` (`supplier_id`);

ALTER TABLE `shop_products`
  ADD CONSTRAINT `fk_shop_products_category` FOREIGN KEY (`category_id`) REFERENCES `shop_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `shop_suppliers` (`id`) ON DELETE SET NULL;

ALTER TABLE `shop_products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - PRODUCT VARIANTS (VELIKOSTI, BARVY ATD.)
-- ============================================

CREATE TABLE `shop_product_variants` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `variant_name` varchar(100) NOT NULL COMMENT 'např. "Černá - Velikost M"',
  `attribute_1_name` varchar(50) DEFAULT NULL COMMENT 'např. "Barva"',
  `attribute_1_value` varchar(100) DEFAULT NULL COMMENT 'např. "Černá"',
  `attribute_2_name` varchar(50) DEFAULT NULL COMMENT 'např. "Velikost"',
  `attribute_2_value` varchar(100) DEFAULT NULL COMMENT 'např. "M"',
  `sku_variant` varchar(50) DEFAULT NULL,
  `price_modifier` decimal(8,2) DEFAULT 0.00 COMMENT 'Přídavná cena',
  `stock_quantity` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `shop_product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_variant` (`sku_variant`),
  ADD KEY `fk_shop_product_variants_product` (`product_id`);

ALTER TABLE `shop_product_variants`
  ADD CONSTRAINT `fk_shop_product_variants_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE;

ALTER TABLE `shop_product_variants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - PRODUCT IMAGES
-- ============================================

CREATE TABLE `shop_product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(200) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `shop_product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_product_images_product` (`product_id`);

ALTER TABLE `shop_product_images`
  ADD CONSTRAINT `fk_shop_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE;

ALTER TABLE `shop_product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - PAYMENT METHODS (ZPŮSOBY PLATBY)
-- ============================================

-- 1. Vytvoření tabulky s PRIMARY KEY a AUTO_INCREMENT od začátku
-- CREATE TABLE `shop_payment_methods` (
--   `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, -- 👈 Rovnou přidáno AUTO_INCREMENT
--   `code` varchar(50) NOT NULL COMMENT 'např. credit_card, bank_transfer, paypal',
--   `name` varchar(100) NOT NULL,
--   `description` text DEFAULT NULL,
--   `is_active` tinyint(1) DEFAULT 1,
--   `sort_order` int(11) DEFAULT 0,
--   `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
--   `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
--   PRIMARY KEY (`id`), 
--   UNIQUE KEY `code` (`code`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT INTO `shop_payment_methods` (`code`, `name`, `is_active`, `sort_order`) VALUES
-- ('credit_card', 'Kreditní karta', 1, 1),
-- ('bank_transfer', 'Bankovní převod', 1, 2),
-- ('paypal', 'PayPal', 1, 3),
-- ('cash_on_delivery', 'Platba při převzetí', 1, 4);

-- ALTER TABLE `shop_payment_methods`
--   ADD PRIMARY KEY (`id`),
--   ADD UNIQUE KEY `code` (`code`);

-- ALTER TABLE `shop_payment_methods`
--   MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
-- ============================================
-- SHOP MODULE - PAYMENT METHODS (ZPŮSOBY PLATBY)
-- ============================================

CREATE TABLE `shop_payment_methods` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'např. credit_card, bank_transfer, paypal',
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`), 
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 📝 Zde rovnou vkládáme data. O ID se starat nemusíš (vygeneruje se 1, 2, 3...)
INSERT INTO `shop_payment_methods` (`code`, `name`, `is_active`, `sort_order`) VALUES
('credit_card', 'Kreditní karta', 1, 1),
('bank_transfer', 'Bankovní převod', 1, 2),
('paypal', 'PayPal', 1, 3),
('cash_on_delivery', 'Platba při převzetí', 1, 4);

-- ❌ Starý ALTER TABLE a MODIFY ID byl kompletně odstraněn, protože klíče už máme nahoře v CREATE TABLE!
-- ============================================
-- SHOP MODULE - SHIPPING METHODS (DOPRAVCI/ZPŮSOBY DOPRAVY)
-- ============================================
-- 1. Vytvoření tabulky rovnou s klíči a auto-incrementem
CREATE TABLE `shop_shipping_methods` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, -- 👈 Přidáno AUTO_INCREMENT
  `code` varchar(50) NOT NULL COMMENT 'např. standard, express, dhl',
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(8,2) NOT NULL DEFAULT 0.00,
  `free_shipping_threshold` decimal(10,2) DEFAULT NULL COMMENT 'Zdarma nad tuto cenu',
  `delivery_days_min` int(11) DEFAULT NULL,
  `delivery_days_max` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`), -- 👈 Primární klíč hned na začátku
  UNIQUE KEY `code` (`code`) -- 👈 Unikátní kód dopravy
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Vložení dat (ID se dopočítají sama: 1, 2, 3, 4)
INSERT INTO `shop_shipping_methods` (`code`, `name`, `base_price`, `delivery_days_min`, `delivery_days_max`, `is_active`, `sort_order`) VALUES
('standard', 'Standardní doprava', 100.00, 3, 5, 1, 1),
('express', 'Expresní doprava', 250.00, 1, 2, 1, 2),
('dhl', 'DHL kurýr', 300.00, 1, 1, 1, 3),
('pickup', 'Vyzvednutí na pobočce', 0.00, 1, 3, 1, 4);

-- ============================================
-- SHOP MODULE - COUPONS (SLEVOVÉ KUPONY)
-- ============================================

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

ALTER TABLE `shop_coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

ALTER TABLE `shop_coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - CUSTOMERS
-- ============================================

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

ALTER TABLE `shop_customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_shop_customers_user` (`user_id`);

ALTER TABLE `shop_customers`
  ADD CONSTRAINT `fk_shop_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `shop_customers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - ORDERS
-- ============================================

CREATE TABLE `shop_orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, paid, processing, shipped, delivered, cancelled',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `shop_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `fk_shop_orders_customer` (`customer_id`),
  ADD KEY `fk_shop_orders_coupon` (`coupon_id`),
  ADD KEY `fk_shop_orders_payment` (`payment_method_id`),
  ADD KEY `fk_shop_orders_shipping` (`shipping_method_id`);

ALTER TABLE `shop_orders`
  ADD CONSTRAINT `fk_shop_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `shop_customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `shop_coupons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shop_orders_payment` FOREIGN KEY (`payment_method_id`) REFERENCES `shop_payment_methods` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shop_orders_shipping` FOREIGN KEY (`shipping_method_id`) REFERENCES `shop_shipping_methods` (`id`) ON DELETE SET NULL;

ALTER TABLE `shop_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - ORDER ITEMS
-- ============================================

CREATE TABLE `shop_order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `product_variant_id` int(10) UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) NOT NULL COMMENT 'Kopie názvu (pro historii)',
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL COMMENT 'Cena za kus v čase nákupu',
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `shop_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_order_items_order` (`order_id`),
  ADD KEY `fk_shop_order_items_product` (`product_id`),
  ADD KEY `fk_shop_order_items_variant` (`product_variant_id`);

ALTER TABLE `shop_order_items`
  ADD CONSTRAINT `fk_shop_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `shop_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_shop_order_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `shop_product_variants` (`id`) ON DELETE SET NULL;

ALTER TABLE `shop_order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- SHOP MODULE - REVIEWS
-- ============================================

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

ALTER TABLE `shop_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shop_reviews_product` (`product_id`),
  ADD KEY `fk_shop_reviews_customer` (`customer_id`);

ALTER TABLE `shop_reviews`
  ADD CONSTRAINT `fk_shop_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shop_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `shop_customers` (`id`) ON DELETE SET NULL;

ALTER TABLE `shop_reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

-- ============================================
-- LARAVEL CORE TABULKY - CACHE
-- ============================================

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

-- ============================================
-- LARAVEL CORE TABULKY - SESSIONS
-- ============================================

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

-- ============================================
-- LARAVEL CORE TABULKY - MIGRATIONS
-- ============================================

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(10, '2025_07_10_155210_create_personal_access_tokens_table', 3),
(11, '2025_07_15_101409_create_refresh_tokens_table', 3),
(12, '2025_07_10_075603_create_raw_request_commissions_table', 4);

ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

-- ============================================
-- LARAVEL CORE TABULKY - PASSWORD RESET
-- ============================================

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

-- ============================================
-- LARAVEL CORE TABULKY - PERSONAL ACCESS TOKENS
-- ============================================

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

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(79, 'App\\Models\\User', 34, 'access-token', '46ffc555bdaa30fe9c7baf1ff082fbc0a7e78cf5bdf4a8a08580f153eab32b51', '[\"*\"]', '2026-02-15 22:39:32', '2026-02-15 23:09:32', '2026-02-15 22:39:32', '2026-02-15 22:39:32'),
(81, 'App\\Models\\User', 34, 'access-token', 'b68364618e440f61d911b78ad90ca53d74ec497c10d71d743a4e4eb20081c2d7', '[\"*\"]', '2026-02-15 22:39:56', '2026-02-15 23:09:56', '2026-02-15 22:39:56', '2026-02-15 22:39:56'),
(87, 'App\\Models\\User', 59, 'access-token', 'c58f7b40a4862562dc033216ec4ba476336d5cc77af42b57e8a6721e0c735545', '[\"*\"]', '2026-02-15 22:41:38', '2026-02-15 23:11:38', '2026-02-15 22:41:38', '2026-02-15 22:41:38'),
(134, 'App\\Models\\User', 62, 'access-token', '696da6ddfce759f43fcd6c430016ffff654238b4bd746c50642599a4b68a1cd7', '[\"*\"]', '2026-02-18 02:12:13', '2026-02-18 03:12:09', '2026-02-18 02:12:09', '2026-02-18 02:12:13'),
(172, 'App\\Models\\User', 77, 'access-token', 'f783051fdb88711a863e9ccd4e5176a5a3f2a3606204c816754c3227d07698f8', '[\"*\"]', '2026-02-25 00:08:53', '2026-02-25 00:42:29', '2026-02-24 23:42:29', '2026-02-25 00:08:53'),
(217, 'App\\Models\\User', 25, 'access-token', '4fcd0510eaa636f2539731bd63f28d647ec76bd56c2382a18f585b23b58a52a7', '[\"*\"]', '2026-03-22 17:34:24', '2026-03-22 18:33:39', '2026-03-22 17:33:39', '2026-03-22 17:34:24');

ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_unique` (`token`),
  ADD KEY `tokenable_index` (`tokenable_type`,`tokenable_id`);

ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=218;

-- ============================================
-- LARAVEL CORE TABULKY - REFRESH TOKENS
-- ============================================

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`, `updated_at`) VALUES
(216, 25, '82a6445a9a64deb43aa626ed37ab8b971a25f0fb3f7c50a183850a8d0658d685', '2026-03-29 16:33:39', '2026-03-22 17:33:39', '2026-03-22 17:33:39');

ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_unique` (`token`),
  ADD KEY `fk_refresh_user_id` (`user_id`);

ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=217;

-- ============================================
-- COMMIT TRANSAKCE
-- ============================================

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;