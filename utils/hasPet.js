module.exports = (user, pet_id) => {
	return user.pets.includes(String(pet_id));
};
