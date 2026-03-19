CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `nickname` VARCHAR(64) NOT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `bio` VARCHAR(255) DEFAULT NULL,
  `display_color` CHAR(7) DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `published_skill_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_copy_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `avg_success_rate` DECIMAL(5,2) DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_mobile` (`mobile`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `sort_no` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`),
  KEY `idx_categories_status_sort` (`status`, `sort_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `slug` VARCHAR(64) DEFAULT NULL,
  `use_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_name` (`name`),
  UNIQUE KEY `uk_tags_slug` (`slug`),
  KEY `idx_tags_status_use_count` (`status`, `use_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skills` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `creator_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `brief` VARCHAR(500) DEFAULT NULL,
  `category_id` BIGINT UNSIGNED DEFAULT NULL,
  `scene` VARCHAR(32) DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0=draft,1=published,2=archived',
  `publish_at` DATETIME DEFAULT NULL,
  `copy_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `favorite_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `feedback_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `success_rate` DECIMAL(5,2) DEFAULT NULL,
  `avg_input_tokens` INT UNSIGNED DEFAULT NULL,
  `avg_output_tokens` INT UNSIGNED DEFAULT NULL,
  `avg_total_tokens` INT UNSIGNED DEFAULT NULL,
  `estimated_cost_low` DECIMAL(12,4) DEFAULT NULL,
  `estimated_cost_high` DECIMAL(12,4) DEFAULT NULL,
  `recommended_model_name` VARCHAR(64) DEFAULT NULL,
  `common_model_name` VARCHAR(64) DEFAULT NULL,
  `total_uses` INT UNSIGNED NOT NULL DEFAULT 0,
  `week_uses` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skills_creator` (`creator_id`),
  KEY `idx_skills_status_publish` (`status`, `publish_at`),
  KEY `idx_skills_scene` (`scene`),
  KEY `idx_skills_category` (`category_id`),
  KEY `idx_skills_copy_count` (`copy_count`),
  KEY `idx_skills_favorite_count` (`favorite_count`),
  CONSTRAINT `fk_skills_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_skills_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_contents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_id` BIGINT UNSIGNED NOT NULL,
  `version_no` INT UNSIGNED NOT NULL DEFAULT 1,
  `is_current` TINYINT NOT NULL DEFAULT 1,
  `prompt` LONGTEXT DEFAULT NULL,
  `system_prompt` LONGTEXT DEFAULT NULL,
  `user_template` LONGTEXT DEFAULT NULL,
  `full_prompt` LONGTEXT DEFAULT NULL,
  `full_prompt_html` LONGTEXT DEFAULT NULL,
  `variable_notes` TEXT DEFAULT NULL,
  `variables_json` JSON DEFAULT NULL,
  `steps_json` JSON DEFAULT NULL,
  `use_scenes_json` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_skill_contents_skill_version` (`skill_id`, `version_no`),
  KEY `idx_skill_contents_current` (`skill_id`, `is_current`),
  CONSTRAINT `fk_skill_contents_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `image_type` ENUM('cover','content') NOT NULL DEFAULT 'content',
  `sort_no` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `width` INT UNSIGNED DEFAULT NULL,
  `height` INT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_images_skill_sort` (`skill_id`, `sort_no`),
  CONSTRAINT `fk_skill_images_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_tag_rel` (
  `skill_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`skill_id`, `tag_id`),
  KEY `idx_skill_tag_rel_tag` (`tag_id`, `skill_id`),
  CONSTRAINT `fk_skill_tag_rel_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_tag_rel_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `skill_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_skill_favorites_user_skill` (`user_id`, `skill_id`),
  KEY `idx_skill_favorites_skill_time` (`skill_id`, `created_at`),
  CONSTRAINT `fk_skill_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_favorites_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_copies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `skill_id` BIGINT UNSIGNED NOT NULL,
  `source_channel` VARCHAR(32) DEFAULT NULL,
  `copied_text_hash` CHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_copies_user_time` (`user_id`, `created_at`),
  KEY `idx_skill_copies_skill_time` (`skill_id`, `created_at`),
  CONSTRAINT `fk_skill_copies_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_copies_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_usage_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `skill_id` BIGINT UNSIGNED DEFAULT NULL,
  `copy_id` BIGINT UNSIGNED DEFAULT NULL,
  `model_name` VARCHAR(64) NOT NULL,
  `input_tokens` INT UNSIGNED DEFAULT NULL,
  `output_tokens` INT UNSIGNED DEFAULT NULL,
  `total_tokens` INT UNSIGNED DEFAULT NULL,
  `cost_amount` DECIMAL(12,4) DEFAULT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'CNY',
  `reaction` ENUM('worth','ok','regret','addicted') DEFAULT NULL,
  `note_text` TEXT DEFAULT NULL,
  `images_json` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_skill_usage_user_time` (`user_id`, `created_at`),
  KEY `idx_skill_usage_skill_time` (`skill_id`, `created_at`),
  KEY `idx_skill_usage_model_time` (`model_name`, `created_at`),
  CONSTRAINT `fk_skill_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_usage_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_skill_usage_copy` FOREIGN KEY (`copy_id`) REFERENCES `skill_copies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skill_feedbacks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `skill_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `usage_record_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('success','normal','fail') NOT NULL,
  `comment` VARCHAR(1000) NOT NULL,
  `model_name` VARCHAR(64) DEFAULT NULL,
  `input_tokens` INT UNSIGNED DEFAULT NULL,
  `output_tokens` INT UNSIGNED DEFAULT NULL,
  `total_tokens` INT UNSIGNED DEFAULT NULL,
  `cost_amount` DECIMAL(12,4) DEFAULT NULL,
  `is_public` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_skill_feedbacks_usage_record` (`usage_record_id`),
  KEY `idx_skill_feedbacks_skill_time` (`skill_id`, `created_at`),
  KEY `idx_skill_feedbacks_user_time` (`user_id`, `created_at`),
  KEY `idx_skill_feedbacks_status` (`status`),
  CONSTRAINT `fk_skill_feedbacks_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_feedbacks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_skill_feedbacks_usage` FOREIGN KEY (`usage_record_id`) REFERENCES `skill_usage_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `drafts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(120) DEFAULT NULL,
  `brief` VARCHAR(500) DEFAULT NULL,
  `category_id` BIGINT UNSIGNED DEFAULT NULL,
  `scene` VARCHAR(32) DEFAULT NULL,
  `tags_json` JSON DEFAULT NULL,
  `prompt` LONGTEXT DEFAULT NULL,
  `system_prompt` LONGTEXT DEFAULT NULL,
  `user_template` LONGTEXT DEFAULT NULL,
  `full_prompt` LONGTEXT DEFAULT NULL,
  `full_prompt_html` LONGTEXT DEFAULT NULL,
  `variable_notes` TEXT DEFAULT NULL,
  `variables_json` JSON DEFAULT NULL,
  `steps_json` JSON DEFAULT NULL,
  `use_scenes_json` JSON DEFAULT NULL,
  `images_json` JSON DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0=editing,1=published,2=discarded',
  `last_saved_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_skill_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_drafts_user_status_time` (`user_id`, `status`, `last_saved_at`),
  KEY `idx_drafts_published_skill` (`published_skill_id`),
  CONSTRAINT `fk_drafts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_drafts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_drafts_published_skill` FOREIGN KEY (`published_skill_id`) REFERENCES `skills` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`name`, `sort_no`) VALUES
('写作', 10), ('编程', 20), ('自媒体', 30), ('办公', 40),
('运营', 50), ('学习', 60), ('设计', 70), ('电商', 80)
ON DUPLICATE KEY UPDATE `sort_no` = VALUES(`sort_no`);
