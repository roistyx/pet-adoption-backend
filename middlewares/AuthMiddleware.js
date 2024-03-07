const jwt = require('jsonwebtoken');
const UsersDAO = require('../models/UsersDAO');

module.exports.AuthMiddleware = async function AuthMiddleware(req, res, next) {
	console.log('token', req.headers.authorization);

	try {
		let token = req.headers.authorization.split(' ')[1];

		if (!token) {
			return res.status(401).send('Access denied. No token provided.');
		}

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		console.log('decodedToken', decodedToken);
		const userData = await UsersDAO.getUserById(decodedToken.user_id);
		console.log('userData', userData);
		if (!userData) {
			return res.status(401).send('Access denied. No token provided.');
		}
		req.currentUser = userData;
		console.log('Authenticated', token);

		next();
	} catch (err) {
		console.log('Error in AuthMiddleware: ', err);
		return res.status(500).json({
			success: false,
			message: 'Unknown error in Auth',
		});
	}
};
