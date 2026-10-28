CREATE TABLE `business_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`projectDescription` text NOT NULL,
	`budget` varchar(64),
	`timeline` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `business_inquiries_id` PRIMARY KEY(`id`)
);
