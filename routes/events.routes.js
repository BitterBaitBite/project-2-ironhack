// -   /events
// -   /events/search?filters
// -   /events/add
// -   /events/:id
// -   /events/:id/edit (admin, moderator, publisher)
// -   /events/:id/delete (admin, moderator, publisher)
// -   /events/:id/join (owner only)(option to multipet join)
// -   /events/:id/quit (owner only)(option to multipet join)

const router = require('express').Router();
const mongoose = require('mongoose');

const session = require('express-session');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const Event = require('../models/Event.model');
const isLoggedIn = require('../middleware/isLoggedIn');
const loggedUser = require('../utils/loggedUser');
const roleCheck = require('../middleware/roleCheck');
const Message = require('../models/Message.model')

router.get('/', isLoggedIn, (req, res) => {
    const sessionUser = req.session.user;

    Event
        .find()
        .then( (events) => {
            res.render('events/', {events,  user: loggedUser(sessionUser)})
        })
        .catch( ( err ) => console.log(err))

    
})

router.get('/add', isLoggedIn, (req, res) => {    
    const sessionUser = req.session.user;

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const time = new Date(Date.now()).toISOString().split('T')[1].split(':').splice(0,2).join(':');

    console.log(date)
    console.log(time)


    
    res.render('events/new-event', {user: loggedUser(sessionUser), date, time})

})




    

module.exports = router;
