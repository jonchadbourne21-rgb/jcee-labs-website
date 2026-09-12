CREATE TABLE `food_lens_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageKey` varchar(512),
	`imageUrl` text,
	`dishGuess` varchar(220) NOT NULL,
	`overallConfidence` int NOT NULL,
	`portionConfidence` int NOT NULL,
	`uncertaintySummary` text NOT NULL,
	`measurementNote` text NOT NULL,
	`estimateDisclosure` text NOT NULL,
	`items` json NOT NULL,
	`totalNutrition` json NOT NULL,
	`generationMode` enum('live_ai','safe_fallback') NOT NULL DEFAULT 'live_ai',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `food_lens_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `semantic_memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('food_lens','recipe','meal_feedback','preference') NOT NULL,
	`sourceId` int,
	`title` varchar(220) NOT NULL,
	`content` text NOT NULL,
	`vector` json NOT NULL,
	`metadata` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `semantic_memories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `semantic_memory_edges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromMemoryId` int NOT NULL,
	`toMemoryId` int NOT NULL,
	`relation` enum('similar_to','derived_from','reinforces') NOT NULL,
	`weight` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `semantic_memory_edges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `food_lens_scans_user_idx` ON `food_lens_scans` (`userId`);--> statement-breakpoint
CREATE INDEX `food_lens_scans_user_created_idx` ON `food_lens_scans` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `semantic_memories_user_idx` ON `semantic_memories` (`userId`);--> statement-breakpoint
CREATE INDEX `semantic_memories_user_kind_idx` ON `semantic_memories` (`userId`,`kind`);--> statement-breakpoint
CREATE INDEX `semantic_memories_source_idx` ON `semantic_memories` (`userId`,`kind`,`sourceId`);--> statement-breakpoint
CREATE INDEX `semantic_memory_edges_user_idx` ON `semantic_memory_edges` (`userId`);--> statement-breakpoint
CREATE INDEX `semantic_memory_edges_from_idx` ON `semantic_memory_edges` (`fromMemoryId`);