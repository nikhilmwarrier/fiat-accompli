CREATE TABLE `billing_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`prev_hash` text,
	`payload` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `billing_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'PENDING',
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `billing_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`name` text NOT NULL,
	`currency` text DEFAULT 'inr',
	`pan` text,
	`gstin` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `billing_customers_external_id_unique` ON `billing_customers` (`external_id`);--> statement-breakpoint
CREATE TABLE `billing_gl_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`customer_id` text,
	`debit` integer DEFAULT 0,
	`credit` integer DEFAULT 0,
	`voucher_type` text NOT NULL,
	`voucher_id` text NOT NULL,
	`description` text,
	`created_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `billing_customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cust_idx` ON `billing_gl_entries` (`customer_id`);--> statement-breakpoint
CREATE INDEX `voucher_idx` ON `billing_gl_entries` (`voucher_id`);