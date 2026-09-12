ALTER TABLE `recipes` ADD `tags` json;--> statement-breakpoint
UPDATE `recipes` SET `tags` = JSON_ARRAY() WHERE `tags` IS NULL;--> statement-breakpoint
ALTER TABLE `recipes` MODIFY `tags` json NOT NULL;--> statement-breakpoint
CREATE INDEX `recipes_user_favorite_idx` ON `recipes` (`userId`,`favorite`);
