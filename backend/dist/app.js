"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const tier_routes_1 = __importDefault(require("./routes/tier.routes"));
const achievement_routes_1 = __importDefault(require("./routes/achievement.routes")); // Import new achievement routes
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin }));
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/teams', team_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use('/api/v1/leaderboard', leaderboard_routes_1.default);
app.use('/api/v1/tiers', tier_routes_1.default);
app.use('/api/v1/achievements', achievement_routes_1.default); // Use new achievement routes
// Basic health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Connecta CI Backend is running!' });
});
// Error handling middleware (basic example)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});
exports.default = app;
