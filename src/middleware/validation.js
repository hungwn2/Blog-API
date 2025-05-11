const {body, validationResult}=require('express-validator');


const validate=(req, res, next)=>{
    const errors=validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();
}

const registerValidation=[
    body('username')
    .trim()
    .isLength({min:3, max:30})
    .withMessage("Must be between 3 and 30 chars")
    .isAlphanumeric()
    .withMessage('Only contain letters'),

    body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

    body('password')
    .isLength({min:6})
    .withMessage("At least 6 chars"),

    body("firstName")
    .optional()
    .trim()
    .isLength({min:2, max:50})
    .withMessage("Be between 2 and 50 characters"),

    body('lastName')
    .optional()
    .trim()
    .isLength({min:2 , max:50})
    .withMessage('Must be between 2 and 50 characters'),

    validate
];

const loginValidation=[
    body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

    body('password')
    .notEmpty()
    .withMessage('Password is required'),

    validate
];

const postValidation=[
    body('title')
    .trim()
    .isLength({min:5, max:200})
    .withMessage('Must be between 5 and 200 chars'),

    body('content')
    .trim()
    .isLength({min:10})
    .withMessage('Content must be at least 10 chars'),

    body('published')
    .optional()
    .isBoolean()
    .withMessage('must have boolean value'),
    validate
];

const commentValidation=[
    body('content')
    .trim()
    .isLength({min:3, max:500})
    .withMessage("Comment between 3 and 500 chars"),

    validate
];


module.exports={
    registerValidation,
    loginValidation,
    postValidation,
    commentValidation
};
