ALTER TABLE `orders` MODIFY COLUMN `status` enum('pending','pending_checkout','paid','failed','canceled') NOT NULL DEFAULT 'pending_checkout';--> statement-breakpoint
ALTER TABLE `orders` ADD `transportDates` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `purchaseType` enum('single','multiple','all_days') DEFAULT 'single' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `transportDate`;