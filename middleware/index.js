module.exports = {

    roleCheck: (...roles) => (req, res, next) => {

        if (roles.includes(req.session.user.role)) {
            req.user = req.session.user;
            next()
        }
        else {
            res.redirect('/login')
        }
        // req.logged = true;
    },
    isLoggedOut: (req, res, next) => {
        // if an already logged in user tries to access the login page it
        // redirects the user to the home page
        if (req.session.user) {
            return res.redirect('/');
        }
        next();
    },
    isLoggedIn: (req, res, next) => {
        // checks if the user is logged in when trying to access a specific page
        if (!req.session.user) {
            // req.logged = false;
            return res.redirect('/login');
        }
        req.user = req.session.user;
        // req.logged = true;
        next();
    },

    isPetLoggedIn: (req, res, next) => {
        // checks if the user is logged in when trying to access a specific page

        if (!req.session.pet && req.session.user.role != 'ADMIN') {
            return res.render('user/', { errorMessage: "You need to select a pet to proceed." });
        }
        next();
    },

    isPetLoggedOut: (req, res, next) => {

        if (req.session.pet) {
            console.log(req.session.pet)
            return res.render('user/', { errorMessage: "Cannot proceed from Pet profile." });
        }
        next();
    },




}


// checkRoles: (...roles) => (req, res, next) => {
//     // console.log(`req.session.currentUser ${req.session.currentUser.role}`)
//     if (roles.includes(req.session.currentUser.role)) {
//         next()
//     } else {
//         res.render('auth/login-page', { errorMessage: `Restricted to ${roles}` })
//     }
// },

