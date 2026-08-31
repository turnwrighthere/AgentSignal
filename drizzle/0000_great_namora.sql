CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_type` text NOT NULL,
	`generalized_need` text NOT NULL,
	`page_path` text NOT NULL,
	`observation` text NOT NULL,
	`impact` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_day` text NOT NULL,
	`is_seeded` integer DEFAULT false NOT NULL
);
