CREATE TABLE `custom_food_labels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`barcode` varchar(32),
	`productName` varchar(320) NOT NULL,
	`brand` varchar(320),
	`servingSize` varchar(120) NOT NULL,
	`ingredientsText` text,
	`allergens` json NOT NULL,
	`nutritionPerServing` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_food_labels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_food_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customFoodLabelId` int NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
	`servings` decimal(6,2) NOT NULL DEFAULT '1.00',
	`nutritionSnapshot` json NOT NULL,
	`eatenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_food_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `packaged_food_logs` MODIFY COLUMN `servings` decimal(6,2) NOT NULL DEFAULT '1.00';--> statement-breakpoint
CREATE INDEX `custom_food_labels_user_idx` ON `custom_food_labels` (`userId`);--> statement-breakpoint
CREATE INDEX `custom_food_labels_user_barcode_idx` ON `custom_food_labels` (`userId`,`barcode`);--> statement-breakpoint
CREATE INDEX `custom_food_logs_user_eaten_idx` ON `custom_food_logs` (`userId`,`eatenAt`);--> statement-breakpoint
CREATE INDEX `custom_food_logs_user_label_idx` ON `custom_food_logs` (`userId`,`customFoodLabelId`);