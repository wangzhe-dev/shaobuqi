-- 开发环境初始化账号（密码: 12345678）
INSERT INTO users (
  mobile,
  email,
  password_hash,
  nickname,
  avatar_url,
  bio,
  display_color,
  status
) VALUES (
  '13800000000',
  'dev@shaobuqi.com',
  '$2b$10$Y31vtJpHUPbrpqiOtzerYuHR3eTW23VpEFLDp3L5qQuTGilrJO4be',
  '开发者',
  NULL,
  '烧不起开发测试账号',
  '#5B5BD6',
  1
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  nickname = VALUES(nickname),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;
