CREATE TABLE `barcode_device_diagnostics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceLabel` varchar(180) NOT NULL,
	`platform` varchar(160) NOT NULL,
	`browser` varchar(160) NOT NULL,
	`engine` enum('native','zxing','unavailable') NOT NULL,
	`cameraStartMs` int,
	`firstDetectionMs` int,
	`trialCount` int NOT NULL DEFAULT 0,
	`successfulTrials` int NOT NULL DEFAULT 0,
	`medianDetectionMs` int,
	`focusSupported` boolean NOT NULL DEFAULT false,
	`continuousFocusSupported` boolean NOT NULL DEFAULT false,
	`torchSupported` boolean NOT NULL DEFAULT false,
	`rearCameraSelected` boolean NOT NULL DEFAULT false,
	`videoWidth` int,
	`videoHeight` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `barcode_device_diagnostics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `barcode_device_diagnostics_user_created_idx` ON `barcode_device_diagnostics` (`userId`,`createdAt`);