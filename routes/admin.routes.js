// -   /admin
// -   /admin/list-users?filters
// -   /admin/:user_id/edit
// -   /admin/:user_id/delete
// -   /admin/:user_id/role-edit?role-query

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const { isLoggedIn, roleCheck } = require('../middleware/');
const { errorValidation, hasPet, hasRole } = require('../utils/');


router.get('/', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    res.render('admin/')
})

router.get('/users', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    User
        .find()
        .populate({
            path: 'pets',
            populate: {
                path: 'messages'
            }
        })
        .then(users => {
            res.send(users)
        })


})



//    User.findById(req.params.id)
//         .populate({
//             path: 'pets',
//             populate: {
//                 path: 'reviews'
//             }
//         }
// 	})
//         .populate(...)





module.exports = router;