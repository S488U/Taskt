CREATE TABLE `task_table` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`description` text,
	`kind` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` text,
	`due_time` text,
	`recurring_mode` text,
	`recurring_days` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`completed_at` text,
	`timezone` text
);
