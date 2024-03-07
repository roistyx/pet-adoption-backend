require('dotenv').config();
const express = require('express');
const { InitDB } = require('./models/init.js');
const UsersController = require('./controllers/UsersController.js');
const CatalogController = require('./controllers/CatalogController.js');
const UsersDAO = require('./models/UsersDAO.js');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const { AuthMiddleware } = require('./middlewares/AuthMiddleware');

const app = express();
const cors = require('cors');

InitDB();

app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);
app.use(express.json());
app.use(express.static('public'));

const uploadsDirectory = 'uploads';

app.use('/' + uploadsDirectory, express.static(uploadsDirectory));
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './' + uploadsDirectory);
	},
	filename: function (req, file, cb) {
		if (file.mimetype != 'image/jpeg' && file.mimetype != 'image/png') {
			cb(new Error('Wrong mime type'));
			return;
		}

		const newFileName = Date.now() + Math.random() * 1000 + file.originalname;

		cb(null, newFileName);
	},
});
const upload = multer({ storage });
app.post('/upload', AuthMiddleware, upload.single('file'), function (req, res) {
	if (req.currentUser.role !== 'admin')
		return res.status(401).json({ success: false, message: 'Unauthorized' });

	return res.json({
		file: 'http://localhost:3100/' + req.file.path,
	});
});

app.get('/Dashboard', AuthMiddleware, UsersController.getUserRole);

app.post('/user/signup', UsersController.Signup);
app.post('/user/login', UsersController.Login);
app.get('/user/profile', AuthMiddleware, UsersController.getUser);
app.put('/user/edit', AuthMiddleware, UsersController.EditUser);
app.get('/user/saved-list', AuthMiddleware, UsersController.getSavedPets);
app.post('/user/logout', AuthMiddleware, UsersController.Logout);
app.get('/pet/:id/save', AuthMiddleware, UsersController.savePet);
app.get('/pet/:id/unsave', AuthMiddleware, UsersController.unSavePet);
app.delete('/pet/:id/delete', AuthMiddleware, UsersController.deletePet);

app.get('/user/owner-pets', AuthMiddleware, UsersController.getOwnerPetsList);

app.get('/auth', authenticate);
app.get;
// app.use(authenticate);

async function authenticate(req, res) {
	try {
		let token = req.headers.authorization.split(' ')[1];

		if (!token) {
			return res.status(401).send('Access denied. No token provided.');
		}

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
		const userData = await UsersDAO.getUserById(decodedToken.user_id);
		if (!userData) {
			return res.status(401).send('Access denied. No token provided.');
		}
		req.currentUser = userData;

		res.status(200).json({
			success: true,
			message: 'User is authenticated',
			userObj: req.currentUser,
		});
	} catch (err) {
		console.log('Error in AuthMiddleware: ', err);
		return res.status(500).json({
			success: false,
			message: 'Unknown error in Auth',
		});
	}
}

app.post('/catalog/add-pet', AuthMiddleware, CatalogController.addPet);
app.post(
	'/catalog/update-pet/:id',
	AuthMiddleware,
	CatalogController.updatePet
);
app.get('/catalog/pet/:id', CatalogController.getPetById);
app.get('/catalog/delete-pet/:id', AuthMiddleware, CatalogController.deletePet);
app.get('/search', CatalogController.searchField);
app.get('/search/:term', CatalogController.searchEverywhere);

app.get('/auth', AuthMiddleware, (req, res) => {
	console.log('req.currentUser', req.currentUser);
	const userObject = {
		username: req.currentUser.username,
		firstName: req.currentUser.firstName,
		lastName: req.currentUser.lastName,
		phoneNumber: req.currentUser.phoneNumber,
	};
	return res.status(200).json({
		success: true,
		message: 'User is authenticated',
		user: userObject,
	});
});

app.listen(3100, () => {
	console.log('Server is running on port 3100');
});
