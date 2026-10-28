CREATE TABLE `labor_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trade` varchar(64) NOT NULL,
	`role` varchar(128) NOT NULL,
	`hourlyRate` decimal(8,2) NOT NULL,
	`overtimeRate` decimal(8,2) NOT NULL,
	`region` varchar(128) NOT NULL DEFAULT 'National Avg',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labor_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trade` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`unit` varchar(64) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`supplier` varchar(255),
	`partNumber` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materials_id` PRIMARY KEY(`id`)
);
