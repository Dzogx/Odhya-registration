CREATE TABLE `registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`ramCount` int NOT NULL,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`)
);
