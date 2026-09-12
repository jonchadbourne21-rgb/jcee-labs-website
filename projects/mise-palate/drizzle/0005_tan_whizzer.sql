CREATE TABLE `packaged_food_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`packagedFoodProductId` int NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
	`servings` int NOT NULL DEFAULT 1,
	`nutritionSnapshot` json NOT NULL,
	`eatenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `packaged_food_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packaged_food_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barcode` varchar(32) NOT NULL,
	`productName` varchar(320) NOT NULL,
	`brands` varchar(320),
	`servingSize` varchar(120),
	`ingredientsText` text,
	`allergens` json NOT NULL,
	`nutritionPerServing` json NOT NULL,
	`nutritionPer100g` json,
	`nutrimentsRaw` json NOT NULL,
	`sourceUrl` text NOT NULL,
	`sourceCompleteness` int,
	`imageUrl` text,
	`sourceUpdatedAt` timestamp,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packaged_food_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `packaged_food_products_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE INDEX `packaged_food_logs_user_eaten_idx` ON `packaged_food_logs` (`userId`,`eatenAt`);--> statement-breakpoint
CREATE INDEX `packaged_food_logs_user_product_idx` ON `packaged_food_logs` (`userId`,`packagedFoodProductId`);