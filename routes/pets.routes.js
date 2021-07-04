// -   /pets
// -   /pets?filters (admin can filter by owner user)
// -   /pets/:id (get)
// -   /pets/:id/contact (get, post)
// -   /pets/:id/edit (get, post)(admin only, moderator for reviews)
// -   /pets/:id/delete (post)(admin only)

const router = require('express').Router();
const mongoose = require('mongoose');


const session = require('express-session');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const isLoggedIn = require('../middleware/isLoggedIn');
const loggedUser = require('../utils/loggedUser');


router.get('/', isLoggedIn, (req, res) => {
    const user = req.session.user;
    const { name, species, age, gender } = req.query
    const addressProperties = ['street', 'postal', 'number', 'country', 'city']
    const queryAddress = Object.keys(req.query).reduce((result, key) => {
        if (addressProperties.includes(key)) {
            result[key] = req.query[key];
        }
        return result;
    }, {});
    const result = Object.keys(req.query).reduce((result, key) => {
        if (!addressProperties.includes(key)) {
            result[key] = req.query[key];
        }
        return result;
    }, {});

    let basicFilters = {}
    Object.keys(req.query).length > 0 && (basicFilters = { name, species, age, gender })
    // console.log(basicFilters)
    // console.log(req.query)

    Pet

        .find(result)
        .populate('address')
        .then((pets) => {

            const filteredPets = pets.filter(pet => {

                //PREGUNTAR POR QUÉ OBJECT.VALUES(PET.ADDRESS) NOS DEVUELVE EL INTERNALCACHE

                return Object.keys(queryAddress).reduce((result, key) => {
                    result = (result && pet.address[key] == req.query[key])
                    return result;
                }, true);

                // let result = true;


                // Object.keys(queryAddress).forEach(key => {

                //     result = (result && pet.address[key] == req.query[key])
                // })
                // return result


                // pet.address.city == req.query.city
                // pet.address.country == req.query.country
                // pet.address.street == req.query.street
                // pet.address.number == req.query.number
                // pet.address.postal == req.query.postal
            })

            console.log(filteredPets)
            res.render('pets/', { user: loggedUser(user), pets: filteredPets })
            console.log(pets)
        })
        .catch(err => console.error(err))
})





module.exports = router