-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_retail_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `idx_category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Soap','Bathing Soap','2026-06-18 06:34:54','2026-06-18 09:50:14'),(2,'Shampoo','Hair Shampoo','2026-06-18 06:41:49','2026-06-18 09:50:14'),(3,'Snacks and Drinks','','2026-06-18 06:53:25','2026-06-18 09:50:14'),(4,'Pulses','','2026-06-19 09:48:55','2026-06-19 09:48:55'),(5,'Grocery','','2026-06-19 09:49:37','2026-06-19 09:49:37'),(6,'Household Essentials','','2026-06-19 09:50:20','2026-06-19 09:50:20');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `transaction_type` enum('PURCHASE','SALE','ADJUSTMENT','RETURN') NOT NULL,
  `quantity` int NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_product` (`product_id`),
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_transactions`
--

LOCK TABLES `inventory_transactions` WRITE;
/*!40000 ALTER TABLE `inventory_transactions` DISABLE KEYS */;
INSERT INTO `inventory_transactions` VALUES (1,2,'SALE',1,1,'Sale #1','2026-06-22 06:38:31'),(2,2,'SALE',1,2,'Sale #2','2026-06-22 06:40:05'),(3,2,'SALE',3,3,'Sale #3','2026-06-22 06:40:55'),(4,3,'SALE',1,4,'Sale #4','2026-06-22 07:18:32'),(5,4,'SALE',10,5,'Sale #5','2026-06-22 07:24:55'),(6,2,'PURCHASE',10,NULL,'string','2026-06-22 07:36:50'),(7,4,'PURCHASE',5,NULL,'Stock received','2026-06-22 09:59:02'),(8,4,'SALE',1,6,'Sale #6','2026-06-22 10:11:51'),(9,1,'SALE',2,6,'Sale #6','2026-06-22 10:11:51'),(10,2,'SALE',1,7,'Sale #7','2026-06-23 07:14:31'),(11,1,'SALE',1,8,'Sale #8','2026-06-23 07:14:39'),(12,3,'SALE',1,9,'Sale #9','2026-06-23 07:14:51'),(13,4,'SALE',1,9,'Sale #9','2026-06-23 07:14:51');
/*!40000 ALTER TABLE `inventory_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `reorder_level` int DEFAULT '10',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `current_stock` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_stock` (`current_stock`),
  KEY `idx_products_active` (`is_active`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Dove','Dove',50.00,45.00,10,1,'2026-06-18 06:38:35',7,'2026-06-23 09:51:28',NULL),(2,1,'Dettol','Dettol',40.00,35.00,10,1,'2026-06-18 06:41:18',24,'2026-06-23 09:51:46',NULL),(3,2,'Head & Shoulders','Head_shoulders',150.00,120.00,10,1,'2026-06-18 06:43:11',28,'2026-06-23 07:27:15',NULL),(4,3,'Mountain Dew','Dew',90.00,86.00,10,1,'2026-06-18 06:54:09',18,'2026-06-23 07:14:51',NULL),(5,3,'Pepsi','pepsi',95.00,92.00,10,1,'2026-06-18 09:40:14',50,'2026-06-22 08:01:00',NULL),(6,1,'Neem','Neem',40.00,35.00,10,1,'2026-06-23 09:46:43',15,'2026-06-23 09:46:43',NULL),(7,1,'Lux','Lux',25.00,20.00,10,1,'2026-06-23 09:52:24',20,'2026-06-23 09:52:24',NULL),(8,1,'Cinthol','Cinthol',50.00,46.00,10,1,'2026-06-23 09:54:55',10,'2026-06-23 09:54:55',NULL),(9,1,'Fiama','Fiama',65.00,60.00,5,1,'2026-06-23 09:57:52',15,'2026-06-23 09:57:52',NULL),(10,1,'Pears','Pears',180.00,150.00,5,1,'2026-06-23 09:58:30',12,'2026-06-23 09:58:30',NULL),(11,1,'Santoor','Santoor',45.00,41.00,10,1,'2026-06-23 10:06:36',28,'2026-06-23 10:06:36',NULL),(12,1,'WildStone','WildStone',38.00,35.00,10,1,'2026-06-23 10:20:10',15,'2026-06-23 10:20:10',NULL),(13,3,'Sprite','Sprite',80.00,75.00,10,1,'2026-06-23 10:21:52',15,'2026-06-23 10:21:52',NULL),(14,3,'CocaCola','CocaCola',90.00,84.00,15,1,'2026-06-23 10:22:40',15,'2026-06-23 10:23:19',NULL),(15,2,'L\'Oreal','L\'Oreal',200.00,192.00,10,1,'2026-06-23 10:25:33',10,'2026-06-23 10:25:33',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','2026-06-17 06:41:49'),(2,'CASHIER','2026-06-17 06:41:49'),(3,'CUSTOMER','2026-06-17 06:41:49');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sale_item_sale` (`sale_id`),
  KEY `idx_sale_items_product` (`product_id`),
  CONSTRAINT `fk_sale_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_sale_item_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,1,2,1,40.00,40.00,'2026-06-22 06:38:31'),(2,2,2,1,40.00,40.00,'2026-06-22 06:40:05'),(3,3,2,3,40.00,120.00,'2026-06-22 06:40:55'),(4,4,3,1,150.00,150.00,'2026-06-22 07:18:32'),(5,5,4,10,90.00,900.00,'2026-06-22 07:24:55'),(6,6,4,1,90.00,90.00,'2026-06-22 10:11:51'),(7,6,1,2,50.00,100.00,'2026-06-22 10:11:51'),(8,7,2,1,40.00,40.00,'2026-06-23 07:14:31'),(9,8,1,1,50.00,50.00,'2026-06-23 07:14:39'),(10,9,3,1,150.00,150.00,'2026-06-23 07:14:51'),(11,9,4,1,90.00,90.00,'2026-06-23 07:14:51');
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint DEFAULT NULL,
  `cashier_id` bigint NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` enum('CASH','CARD','UPI') NOT NULL,
  `sale_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sale_customer` (`customer_id`),
  KEY `fk_sale_cashier` (`cashier_id`),
  KEY `idx_sale_date` (`sale_date`),
  CONSTRAINT `fk_sale_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_sale_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,NULL,3,40.00,'CASH','2026-06-22 06:38:31'),(2,NULL,1,40.00,'CASH','2026-06-22 06:40:05'),(3,NULL,1,120.00,'CASH','2026-06-22 06:40:55'),(4,NULL,3,150.00,'CARD','2026-06-22 07:18:32'),(5,NULL,3,900.00,'UPI','2026-06-22 07:24:55'),(6,NULL,3,190.00,'CARD','2026-06-22 10:11:51'),(7,NULL,3,40.00,'CASH','2026-06-23 07:14:31'),(8,NULL,3,50.00,'CASH','2026-06-23 07:14:39'),(9,NULL,3,240.00,'CASH','2026-06-23 07:14:51');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_alerts`
--

DROP TABLE IF EXISTS `stock_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_alerts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `alert_level` enum('CRITICAL','MODERATE','HEALTHY') DEFAULT NULL,
  `current_stock` int NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `is_resolved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_alert_product` (`product_id`),
  KEY `idx_alert_level` (`alert_level`),
  CONSTRAINT `fk_alert_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_alerts`
--

LOCK TABLES `stock_alerts` WRITE;
/*!40000 ALTER TABLE `stock_alerts` DISABLE KEYS */;
INSERT INTO `stock_alerts` VALUES (1,1,'CRITICAL',7,'Dove Soap stock is 7',0,'2026-06-18 06:38:35'),(2,2,'HEALTHY',24,'Dettol Soap stock is 24',0,'2026-06-18 06:41:18'),(3,3,'HEALTHY',28,'Head & Shoulders stock is 28',0,'2026-06-18 06:43:11'),(4,4,'MODERATE',18,'Mountain Dew stock is 18',0,'2026-06-18 06:54:09'),(5,5,'HEALTHY',50,'Pepsi stock is 50',0,'2026-06-18 09:40:14'),(6,6,'MODERATE',15,'Neem stock is 15',0,'2026-06-23 09:46:43'),(7,7,'MODERATE',20,'Lux stock is 20',0,'2026-06-23 09:52:24'),(8,8,'CRITICAL',10,'Cinthol stock is 10',0,'2026-06-23 09:54:55'),(9,9,'HEALTHY',15,'Fiama stock is 15',0,'2026-06-23 09:57:52'),(10,10,'HEALTHY',12,'Pears stock is 12',0,'2026-06-23 09:58:30'),(11,11,'HEALTHY',28,'Santoor stock is 28',0,'2026-06-23 10:06:36'),(12,12,'MODERATE',15,'WildStone stock is 15',0,'2026-06-23 10:20:10'),(13,13,'MODERATE',15,'Sprite stock is 15',0,'2026-06-23 10:21:52'),(14,14,'MODERATE',15,'CocaCola stock is 15',0,'2026-06-23 10:22:40'),(15,15,'CRITICAL',10,'L\'Oreal stock is 10',0,'2026-06-23 10:25:33');
/*!40000 ALTER TABLE `stock_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_layout`
--

DROP TABLE IF EXISTS `store_layout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_layout` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `width` int NOT NULL DEFAULT '180',
  `height` int NOT NULL DEFAULT '80',
  `rotation` int NOT NULL DEFAULT '0',
  `color` varchar(20) DEFAULT '#3B82F6',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_id` (`category_id`),
  CONSTRAINT `fk_layout_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_layout`
--

LOCK TABLES `store_layout` WRITE;
/*!40000 ALTER TABLE `store_layout` DISABLE KEYS */;
INSERT INTO `store_layout` VALUES (10,5,580,100,100,48,0,'#51ae29','2026-06-22 05:00:48','2026-06-22 10:08:35'),(11,6,280,100,150,40,0,'#3B82F6','2026-06-22 05:00:48','2026-06-22 10:45:19'),(12,3,440,160,130,50,90,'#09182f','2026-06-22 05:00:48','2026-06-23 10:18:29'),(13,1,240,300,165,60,0,'#58730d','2026-06-22 05:00:48','2026-06-23 10:20:53'),(14,2,560,320,200,40,0,'#f7863b','2026-06-22 05:00:48','2026-06-23 10:18:19');
/*!40000 ALTER TABLE `store_layout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_paths`
--

DROP TABLE IF EXISTS `store_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_paths` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `path_name` varchar(100) NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `width` int NOT NULL,
  `height` int NOT NULL,
  `rotation` int DEFAULT '0',
  `color` varchar(20) DEFAULT '#E5E7EB',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_store_paths_position` (`x`,`y`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_paths`
--

LOCK TABLES `store_paths` WRITE;
/*!40000 ALTER TABLE `store_paths` DISABLE KEYS */;
INSERT INTO `store_paths` VALUES (15,'Front aisle',100,60,750,40,0,'#E5E7EB','2026-06-22 04:58:00','2026-06-23 10:18:19'),(16,'Main aisle',460,100,500,40,90,'#E5E7EB','2026-06-22 04:58:12','2026-06-23 05:46:30'),(17,'Path 3',100,360,360,40,0,'#E5E7EB','2026-06-22 04:58:42','2026-06-23 10:18:19'),(18,'Path 4',500,360,340,40,0,'#E5E7EB','2026-06-22 04:59:00','2026-06-23 10:18:19'),(19,'Rear aisle',100,580,750,40,0,'#E5E7EB','2026-06-22 04:59:16','2026-06-23 10:18:19');
/*!40000 ALTER TABLE `store_paths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_role` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Shreyansh','shreyansh.khokhar@outworx.com','$argon2id$v=19$m=65536,t=3,p=4$3+Kda83ciT3FZTqUBptmdw$wEYklMSo8DALeROlrdP6T5EXGp2nBdAKHPtZ+jsaaMY',1,'2026-06-17 10:41:30'),(2,3,'Ashish','ashish.raghav@outworx.com','$argon2id$v=19$m=65536,t=3,p=4$AlTe7opspnQZr95BJUl3zg$C+CBEtaQRk0sDTROYRouVY6HOR3qAvKLr1GPaUxaVHc',1,'2026-06-17 12:55:27'),(3,2,'Cashier','cashier@outworx.com','$argon2id$v=19$m=65536,t=3,p=4$hcsXIhtmUwVDOyk6T9rjDg$Z56MVURVL/zHWKjTwGqpt6bPgGNe/c34hw9jAz3jTsU',1,'2026-06-22 05:59:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-23 16:04:31
