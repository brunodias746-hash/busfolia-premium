CREATE TABLE `manual_passengers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`travelDate` varchar(10) NOT NULL,
	`boardingPointId` int NOT NULL,
	`referenceOrderId` varchar(12),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manual_passengers_id` PRIMARY KEY(`id`)
);
