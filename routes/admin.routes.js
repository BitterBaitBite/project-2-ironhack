// -   /admin
// -   /admin/list-users?filters
// -   /admin/:user_id/edit
// -   /admin/:user_id/delete
// -   /admin/:user_id/role-edit?role-query

const router = require('express').Router();

const User = require('../models/User.model');
const Review = require('../models/Review.model');
const { isLoggedIn, roleCheck } = require('../middleware/');
const { errorValidation, hasPet, hasRole } = require('../utils/');
const { events } = require('../models/Pet.model');


router.get('/', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    res.render('admin/')
})

router.get('/users', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    //seria bonito ver los eventos!!!
    User
        .find({ role: { $ne: 'ADMIN' } })
        .populate({
            path: 'pets',
            populate: [{
                path: 'reviews',
                // model: 'Review'
            },
            {
                path: 'friends',
                // model: 'Pet',
                select: '_id name'
            }
            ]
        })
        .then(users => {
            res.render('admin/users-panel', { users })
        })


})


router.get('/:id/edit-user', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    const { id } = req.params
    User
        .findById(id)
        .then(user => {
            res.render('admin/edit-user', { user });
        })

});

router.post('/:id/edit-user', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    const { id } = req.params
    const { username, email, role } = req.body;



    if (!username) {
        return res.status(400).redirect(`/${id}/edit-user`)
    }

    User.findByIdAndUpdate(id, { username, email, role })
        .then((user) => {
            // Bind the user to the session object
            res.redirect('/admin/users');
        })
        .catch((err) => errorValidation(res, err));
})

router.post('/:id/delete-user', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
    const { id } = req.params

    User.findByIdAndDelete(id)
        .then((user) => {
            res.redirect('/admin/users');
        })
        .catch((err) => errorValidation(res, err));
})



module.exports = router;