"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchemas = exports.validateBody = void 0;
const express_validator_1 = require("express-validator");
const validateBody = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({
            message: 'Validation error',
            errors: errors.array()
        });
    };
};
exports.validateBody = validateBody;
exports.authSchemas = {
    register: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        (0, express_validator_1.body)('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        (0, express_validator_1.body)('firstName')
            .trim()
            .isLength({ min: 1 })
            .withMessage('First name is required'),
        (0, express_validator_1.body)('lastName')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Last name is required')
    ],
    login: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        (0, express_validator_1.body)('password')
            .isLength({ min: 1 })
            .withMessage('Password is required')
    ],
    updateProfile: [
        (0, express_validator_1.body)('firstName')
            .optional()
            .trim()
            .isLength({ min: 1 })
            .withMessage('First name cannot be empty'),
        (0, express_validator_1.body)('lastName')
            .optional()
            .trim()
            .isLength({ min: 1 })
            .withMessage('Last name cannot be empty')
    ]
};
//# sourceMappingURL=validation.middleware.js.map