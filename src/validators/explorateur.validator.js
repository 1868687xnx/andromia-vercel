import expressValidator from 'express-validator';

const { body } = expressValidator;

class AccountsValidators {
    postValidator() {
        return [
            body('email')
                .exists()
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Email not a in valid format'),
            body('username')
                .exists()
                .notEmpty()
                .withMessage('Username is required')
                .bail()
                .isString()
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters long'),
            body('password')
                .exists()
                .notEmpty()
                .withMessage('Password is required')
                .bail()
                .isString()
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters long')
        ];
    }
}

export default new AccountsValidators();
