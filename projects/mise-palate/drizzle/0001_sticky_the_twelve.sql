CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventName` varchar(120) NOT NULL,
	`properties` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chef_knowledge` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`type` enum('technique','ingredient','cut','error','recovery','sensory_transformation','safety') NOT NULL,
	`title` varchar(220) NOT NULL,
	`summary` text NOT NULL,
	`content` json NOT NULL,
	`sourceLabel` varchar(220),
	`sourceUrl` text,
	`reviewStatus` enum('draft','chef_reviewed','authoritative') NOT NULL DEFAULT 'draft',
	`editable` boolean NOT NULL DEFAULT true,
	`updatedBy` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chef_knowledge_id` PRIMARY KEY(`id`),
	CONSTRAINT `chef_knowledge_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cooking_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipeId` int NOT NULL,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`currentStep` int NOT NULL DEFAULT 0,
	`recoveryLog` json NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `cooking_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredient_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`source` enum('photo','description','craving') NOT NULL,
	`imageKey` varchar(512),
	`imageUrl` text,
	`originalInput` text,
	`ingredients` json NOT NULL,
	`status` enum('detected','confirmed','corrected') NOT NULL DEFAULT 'detected',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingredient_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipeId` int NOT NULL,
	`sessionId` int,
	`rating` enum('loved','good','okay','not_for_me') NOT NULL,
	`adjustments` json NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meal_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `palate_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`dimensions` json NOT NULL,
	`confidence` json NOT NULL,
	`dislikedIngredients` json NOT NULL,
	`dietaryRestrictions` json NOT NULL,
	`equipment` json NOT NULL,
	`calibrationComplete` boolean NOT NULL DEFAULT false,
	`mealsLearnedFrom` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `palate_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `palate_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `palate_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipeId` int,
	`feedbackId` int,
	`dimension` varchar(80) NOT NULL,
	`direction` int NOT NULL,
	`weight` int NOT NULL,
	`valueBefore` int NOT NULL,
	`valueAfter` int NOT NULL,
	`confidenceBefore` int NOT NULL,
	`confidenceAfter` int NOT NULL,
	`source` enum('calibration','meal_feedback','explicit_edit') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `palate_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scanId` int,
	`parentRecipeId` int,
	`version` int NOT NULL DEFAULT 1,
	`title` varchar(220) NOT NULL,
	`summary` text NOT NULL,
	`rationale` text NOT NULL,
	`imageUrl` text,
	`sourceIngredients` json NOT NULL,
	`ingredients` json NOT NULL,
	`equipment` json NOT NULL,
	`miseEnPlace` json NOT NULL,
	`steps` json NOT NULL,
	`sensoryProfile` json NOT NULL,
	`substitutions` json NOT NULL,
	`safetyRules` json NOT NULL,
	`platingNotes` text NOT NULL,
	`activeMinutes` int NOT NULL,
	`totalMinutes` int NOT NULL,
	`difficulty` enum('easy','moderate','ambitious') NOT NULL DEFAULT 'moderate',
	`favorite` boolean NOT NULL DEFAULT false,
	`generationMode` enum('live_ai','safe_fallback') NOT NULL DEFAULT 'live_ai',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `analytics_events_user_idx` ON `analytics_events` (`userId`);--> statement-breakpoint
CREATE INDEX `analytics_events_name_idx` ON `analytics_events` (`eventName`);--> statement-breakpoint
CREATE INDEX `cooking_sessions_user_idx` ON `cooking_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `cooking_sessions_recipe_idx` ON `cooking_sessions` (`recipeId`);--> statement-breakpoint
CREATE INDEX `ingredient_scans_user_idx` ON `ingredient_scans` (`userId`);--> statement-breakpoint
CREATE INDEX `meal_feedback_user_idx` ON `meal_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `meal_feedback_recipe_idx` ON `meal_feedback` (`recipeId`);--> statement-breakpoint
CREATE INDEX `palate_signals_user_idx` ON `palate_signals` (`userId`);--> statement-breakpoint
CREATE INDEX `recipes_user_idx` ON `recipes` (`userId`);--> statement-breakpoint
CREATE INDEX `recipes_scan_idx` ON `recipes` (`scanId`);