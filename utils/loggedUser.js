module.exports = (currentUser) => {
	let user;
	const isLogged = currentUser && (user = currentUser);
	return { user, isLogged };
};
