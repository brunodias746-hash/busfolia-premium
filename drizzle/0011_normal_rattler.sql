CREATE TABLE `seat_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`travelDate` varchar(10) NOT NULL,
	`totalSeats` int NOT NULL DEFAULT 100,
	`availableSeats` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seat_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `manual_passengers` MODIFY COLUMN `notes` text;