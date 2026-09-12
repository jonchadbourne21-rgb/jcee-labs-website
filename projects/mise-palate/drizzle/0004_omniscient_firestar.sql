CREATE TABLE `nutrition_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('balanced','high_protein','lower_carb','custom') NOT NULL DEFAULT 'balanced',
	`caloriesTarget` int NOT NULL DEFAULT 2000,
	`proteinGTarget` int NOT NULL DEFAULT 100,
	`carbsGTarget` int NOT NULL DEFAULT 250,
	`fatGTarget` int NOT NULL DEFAULT 70,
	`fiberGTarget` int NOT NULL DEFAULT 28,
	`sodiumMgLimit` int NOT NULL DEFAULT 2300,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutrition_goals_id` PRIMARY KEY(`id`),
	CONSTRAINT `nutrition_goals_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`foodLensScanId` int NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'dinner',
	`nutritionSnapshot` json NOT NULL,
	`eatenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nutrition_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `nutrition_logs_user_scan_unique` UNIQUE(`userId`,`foodLensScanId`)
);
--> statement-breakpoint
ALTER TABLE `recipes` ADD `foodLensScanId` int;--> statement-breakpoint
CREATE INDEX `nutrition_logs_user_eaten_idx` ON `nutrition_logs` (`userId`,`eatenAt`);--> statement-breakpoint
CREATE INDEX `recipes_food_lens_scan_idx` ON `recipes` (`foodLensScanId`);