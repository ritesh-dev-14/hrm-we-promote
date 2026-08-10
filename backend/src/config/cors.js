const DEFAULT_ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://hrm.wepromoteindia.com",
  "https://hrm-frontend-iota-topaz.vercel.app",
].filter(Boolean);

const ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/([a-z0-9-]+\.)*wepromoteindia\.com$/i,
  /^https:\/\/([a-z0-9-]+\.)*onrender\.com$/i,
];

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = {
  corsOptions,
  isAllowedOrigin,
};