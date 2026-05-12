ALTER TABLE `orders` ADD `paymentGateway` enum('stripe','asaas','manual') DEFAULT 'stripe';--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` enum('card','pix','boleto') DEFAULT 'card';--> statement-breakpoint
ALTER TABLE `orders` ADD `asaasPaymentId` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `asaasCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `asaasPaymentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `gateway` varchar(20);--> statement-breakpoint
ALTER TABLE `payments` ADD `feeAsaasCents` int;