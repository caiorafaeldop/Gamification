"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        next(error);
    }
};
exports.validate = validate;
