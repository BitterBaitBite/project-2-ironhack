module.exports = (...roles) => (req, res, next) => {

    if (roles.includes(req.session.currentUser.role)) {req.user = req.session.user;
        next()
    }
    else {
        res.redirect('/login')
    }
    
    // req.logged = true;
    
};



// checkRoles: (...roles) => (req, res, next) => {
//     // console.log(`req.session.currentUser ${req.session.currentUser.role}`)
//     if (roles.includes(req.session.currentUser.role)) {
//         next()
//     } else {
//         res.render('auth/login-page', { errorMessage: `Restricted to ${roles}` })
//     }
// },

