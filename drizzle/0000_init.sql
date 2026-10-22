CREATE TABLE `app_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `episode_states` (
	`show_id` text NOT NULL,
	`season` integer NOT NULL,
	`episode` integer NOT NULL,
	`watched` integer DEFAULT false NOT NULL,
	`downloaded` integer DEFAULT false NOT NULL,
	`favorited` integer DEFAULT false NOT NULL,
	`watched_at` integer,
	PRIMARY KEY(`show_id`, `season`, `episode`),
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notification_history` (
	`show_id` text PRIMARY KEY NOT NULL,
	`season` integer NOT NULL,
	`episode` integer NOT NULL,
	`date_sent` integer,
	`date_checked` integer,
	`date_last_notify` integer,
	`text` text NOT NULL,
	`other_info` text,
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `season_summaries` (
	`show_id` text NOT NULL,
	`season` integer NOT NULL,
	`total_episodes` integer DEFAULT 0 NOT NULL,
	`watched` integer DEFAULT 0 NOT NULL,
	`downloaded` integer DEFAULT 0 NOT NULL,
	`favorited` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`show_id`, `season`),
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `show_genres` (
	`show_id` text NOT NULL,
	`genre` text NOT NULL,
	PRIMARY KEY(`show_id`, `genre`),
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `show_genres_genre_idx` ON `show_genres` (`genre`);--> statement-breakpoint
CREATE TABLE `show_tags` (
	`show_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`show_id`, `tag_id`),
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `show_tags_tag_idx` ON `show_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `show_watch_providers` (
	`show_id` text NOT NULL,
	`provider_id` integer NOT NULL,
	PRIMARY KEY(`show_id`, `provider_id`),
	FOREIGN KEY (`show_id`) REFERENCES `shows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `show_watch_providers_provider_idx` ON `show_watch_providers` (`provider_id`);--> statement-breakpoint
CREATE TABLE `shows` (
	`id` text PRIMARY KEY NOT NULL,
	`imdb_id` text,
	`tvdb_id` integer,
	`name` text NOT NULL,
	`poster_url` text,
	`backdrop_url` text,
	`show_status` text,
	`avg_episode_run_time` integer,
	`first_air_date` integer,
	`next_air_date` integer,
	`imdb_episodes_url` text,
	`user_rating` integer DEFAULT 0 NOT NULL,
	`favorited_at` integer,
	`track_and_notify` integer DEFAULT true NOT NULL,
	`date_added` integer NOT NULL,
	`date_last_updated` integer NOT NULL,
	`date_last_notified` integer,
	`date_last_notify_checked` integer,
	`last_notify_season_episode` text,
	`next_notify_offset` integer,
	`streaming_updated_at` integer,
	`all_watched` integer DEFAULT false NOT NULL,
	`total_episodes` integer DEFAULT 0 NOT NULL,
	`total_watched` integer DEFAULT 0 NOT NULL,
	`last_watched_season` integer DEFAULT 0 NOT NULL,
	`next_dl_season` integer,
	`next_dl_episode` integer,
	`next_dl_air_date` integer,
	`next_dl_status` text DEFAULT 'n' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shows_name_idx` ON `shows` ("name" COLLATE NOCASE);--> statement-breakpoint
CREATE INDEX `shows_date_added_idx` ON `shows` (`date_added`);--> statement-breakpoint
CREATE INDEX `shows_user_rating_idx` ON `shows` (`user_rating`);--> statement-breakpoint
CREATE INDEX `shows_next_dl_air_date_idx` ON `shows` (`next_dl_air_date`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL
);
