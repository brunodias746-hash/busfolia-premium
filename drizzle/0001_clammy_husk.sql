CREATE TABLE `boarding_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`city` varchar(100) NOT NULL,
	`locationName` varchar(255) NOT NULL,
	`meetingTime` varchar(10),
	`departureTime` varchar(10),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boarding_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`eventDate` varchar(100) NOT NULL,
	`bannerUrl` varchar(512),
	`priceCents` int NOT NULL,
	`feeCents` int NOT NULL DEFAULT 0,
	`packagePriceCents` int,
	`packageLabel` varchar(255),
	`capacity` int NOT NULL DEFAULT 200,
	`soldCount` int NOT NULL DEFAULT 0,
	`groupLink` varchar(512),
	`status` enum('draft','active','sold_out','finished') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shortId` varchar(12) NOT NULL,
	`eventId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerCpf` varchar(14) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`boardingPointId` int NOT NULL,
	`transportDate` varchar(100) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPriceCents` int NOT NULL,
	`feeCents` int NOT NULL DEFAULT 0,
	`totalAmountCents` int NOT NULL,
	`status` enum('pending','paid','failed','canceled') NOT NULL DEFAULT 'pending',
	`stripeSessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_shortId_unique` UNIQUE(`shortId`)
);
--> statement-breakpoint
CREATE TABLE `passengers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`boardingPointId` int NOT NULL,
	`checkInStatus` enum('pending','checked_in') NOT NULL DEFAULT 'pending',
	`checkInAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passengers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`method` varchar(50),
	`amountReceivedCents` int,
	`feeStripeCents` int,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
