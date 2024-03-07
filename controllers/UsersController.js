const UsersDAO = require('../models/UsersDAO');

const sha256 = require('sha256');
const jwt = require('jsonwebtoken');
const {
	SignupValidations,
	LoginValidations,
	EditValidations,
} = require('./validations/UsersValidations');
const CatalogDAO = require('../models/CatalogDAO');
const { ObjectId } = require('mongodb');

module.exports = class UsersController {
	static async Signup(req, res) {
		// console.log('req.body', req.body);
		const userObject = {
			username: req.body.username,
			password: req.body.password,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			phoneNumber: req.body.phoneNumber,
		};

		try {
			const validRequest = SignupValidations(userObject);
			console.log('validRequest', validRequest);
			if (
				!validRequest ||
				userObject.username === '' ||
				userObject.password === ''
			) {
				console.log('Missing required fields');
				return res.status(400).json({
					success: false,
					message: 'Missing required fields',
				});
			}

			const exitingUser = await UsersDAO.getUserByUsername(userObject.username);

			if (exitingUser) {
				console.log('Username already exists', exitingUser.username);
				return res.status(400).json({
					success: false,
					message: 'Username already exists',
				});
			}

			userObject.password = sha256(userObject.password);

			await UsersDAO.createUser(userObject);
			console.log('User created', userObject);
			return res.status(200).json({
				success: true,
				message: 'User created',
				userObj: userObject,
			});
		} catch (err) {
			console.log('Error in UsersController.Signup: ', err);
			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}

	static async EditUser(req, res) {
		const userId = req.currentUser._id;

		const updatedUserObject = {
			_id: req.currentUser._id,
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			phoneNumber: req.body.phoneNumber,
		};

		if (req.body.password) {
			password = req.body.password;
			updatedUserObject.password = sha256(updatedUserObject.password);
		}

		try {
			console.log('updatedUserObject', updatedUserObject);
			const validRequest = EditValidations(updatedUserObject);
			console.log('validRequest', validRequest);
			if (!validRequest) {
				console.log('Missing required fields');
				return res.status(400).json({
					success: false,
					message: 'Missing required fields',
				});
			}
			const exitingUser = await UsersDAO.getUserById(userId);
			if (!exitingUser) {
				console.log('Username do not exists');
				return res.status(400).json({
					success: false,
					message: 'Username do not exists',
				});
			}

			await UsersDAO.updateUserById(userId, updatedUserObject);
			console.log('User edited', updatedUserObject);
			return res.status(200).json({
				success: true,
				message: 'User edited',
				userObj: updatedUserObject,
			});
		} catch (err) {
			console.log('Error in UsersController.Signup: ', err);
			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}
	static async Login(req, res) {
		try {
			const userObject = {
				username: req.body.username,
				password: req.body.password,
			};

			const user = await UsersDAO.getUserByUsername(req.body.username);
			const validRequest = LoginValidations(req.body);
			if (!validRequest) {
				return res.status(400).json({
					success: false,
					message: 'Please enter username and password',
				});
			}

			if (!user || user.password !== sha256(req.body.password)) {
				console.log(sha256(req.body.password));
				return res.status(400).json({
					success: false,
					message: 'Wrong username or password',
				});
			}

			console.log('req.body.password', req.body.password);
			const token = jwt.sign(
				{ user_id: user._id, username: user.username },
				process.env.JWT_SECRET
			);
			const userProfile = await UsersDAO.getUserById(user._id);
			return res.status(200).json({
				success: true,
				message: 'User logged in',
				userProfile: {
					_id: userProfile._id,
					username: userProfile.username,
					firstName: userProfile.firstName,
					lastName: userProfile.lastName,
					phoneNumber: userProfile.phoneNumber,
					role: userProfile.role,
					pets: userProfile.pets,
				},
				token,
			});
		} catch (err) {
			console.log('Error in UsersController.Login: ', err);
			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}

	static async getUserRole(req, res) {
		console.log(req.currentUser.role);
		try {
			const user = await UsersDAO.getUserById(req.currentUser._id);
			if (user.role !== 'admin') {
				return res.status(400).json({
					success: false,
					message: 'Not admin',
				});
			}
			return res.status(200).json({
				success: true,
				message: 'Admin',
			});
		} catch (err) {
			console.log('Error in UsersController.getUserStatus: ', err);

			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}

	static async getUser(req, res) {
		const userId = req.params;

		try {
			const user = await UsersDAO.getUserById(req.currentUser._id);
			if (!user) {
				return res.status(400).json({
					success: false,
					message: 'User not found',
				});
			}
			return res.status(200).json({
				success: true,
				message: 'User found',
				user: getUserObject,
			});
		} catch (err) {
			console.log('Error in UsersController.getUser: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not get user',
			});
		}
	}

	static async getSavedPets(req, res) {
		try {
			const getSavedListInCatalog = await CatalogDAO.getSavedInCatalog(
				req.currentUser.pets
			);
			return res.status(200).json({
				success: true,
				message: 'Saved pets found',
				list: getSavedListInCatalog,
			});
		} catch (err) {
			console.log('Error in UsersController.getSavedPets: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not get saved pets',
			});
		}
	}

	static async getOwnerPetsList(req, res) {
		const userId = req.currentUser._id;
		console.log('userId', userId);
		try {
			const petListById = await CatalogDAO.getUserPets(userId);
			return res.status(200).json({
				success: true,
				message: 'pet list',
				list: petListById,
			});
		} catch (err) {
			console.log('Error in CatalogController.PetList: ', err);
			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}

	static async updateUser(req, res) {
		const userId = req.params;
		const verifiedUserid = new ObjectId(userId);

		if (req.currentUser._id !== verifiedUserid) {
			console.log('You are not authorized to update this user');
		}

		const updatedUserObject = {
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			phoneNumber: req.body.phoneNumber,
		};

		try {
			const user = await UsersDAO.getUserById(userId);

			if (!user) {
				return res.status(400).json({
					success: false,
					message: 'User not found',
				});
			}

			await UsersDAO.updateUserById(userId, updatedUserObject);
			return res.status(200).json({
				success: true,
				message: 'User updated',
				user: updatedUserObject,
			});
		} catch (err) {
			console.log('Error in UsersController.updateUser: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not update user',
			});
		}
	}

	static async savePet(req, res) {
		try {
			const petId = req.params.id;
			const petObj = await CatalogDAO.getPetById(petId);
			const currentUserId = req.currentUser._id;
			console.log('currentUserId log', currentUserId);

			console.log('pets', petObj);

			if (!petObj)
				return res.status(400).json({
					success: false,
					message: 'Pet does not exist',
				});
			const updatedUserObj = await UsersDAO.savePet(currentUserId, petId);
			return res.status(200).json({
				success: true,
				message: 'Pet saved',
			});
		} catch (err) {
			console.log('Error in CatalogController.savePet: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not save pet',
			});
		}
	}

	static async unSavePet(req, res) {
		try {
			const petId = req.params.id;
			const petObj = await CatalogDAO.getPetById(petId);
			const currentUserId = req.currentUser._id;

			const updatedUserObj = await UsersDAO.unSavePets(currentUserId, petId);
			if (!updatedUserObj)
				return res.status(400).json({
					success: false,
					message: 'Unknown error',
				});
			console.log('Unsave', updatedUserObj);
			return res.status(200).json({
				success: true,
				message: 'Pet unsaved',
			});
		} catch (err) {
			console.log('Error in CatalogController.savePet: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not save pet',
			});
		}
	}

	static async deletePet(req, res) {
		try {
			const petId = req.params.id;
			const currentUserId = req.currentUser._id;
			console.log('currentUserId log', currentUserId);
			console.log('petId', petId);

			const savedList = await UsersDAO.deletePet(currentUserId, petId);

			console.log('savedList', savedList);
			return res.status(200).json({
				success: true,
				message: 'Pet deleted',
				save_list: savedList,
			});
		} catch (err) {
			console.log('Error in CatalogController.deleteSavedPet: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not delete pet',
			});
		}
	}

	static async getMyPetsList(req, res) {
		const userId = req.currentUser._id;
		const petToUpdate = await CatalogDAO.getUserPets(userId);
		console.log('users pets', petToUpdate);

		if (petToUpdate.currentOwner !== userId) {
			console.log('Your are not the owner of this pet or pet does not exist');
		}
		console.log('user matched');
		try {
			const petListById = await CatalogDAO.getUserPets(userId);
			return res.status(200).json({
				success: true,
				message: 'pet list',
				petList: petListById,
			});
		} catch (err) {
			console.log('Error in CatalogController.PetList: ', err);
			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}

	static async Logout(req, res) {
		req.currentUser._id;
	}
};
