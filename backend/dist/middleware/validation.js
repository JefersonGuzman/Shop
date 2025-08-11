"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = validateQuery;
exports.validateBody = validateBody;
const zod_1 = require("zod");
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: 'Validation failed', details: error.errors });
            }
            next(error);
        }
    };
}
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const before = JSON.stringify(req.body);
            const parsed = schema.parse(req.body);
            const after = JSON.stringify(parsed);
            console.log('🧪 [Validation] body before:', before);
            console.log('🧪 [Validation] body after:', after);
            req.body = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                console.error('⚠️ [Validation] failed:', JSON.stringify(error.errors));
                return res.status(400).json({ error: 'Validation failed', details: error.errors });
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validation.js.map