CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`type` enum('email','sms') NOT NULL,
	`recipient` varchar(320) NOT NULL,
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `registrations` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `registrations` ADD `emailNotificationSent` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `registrations` ADD `smsNotificationSent` int DEFAULT 0 NOT NULL;