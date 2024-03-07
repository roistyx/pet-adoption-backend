const CatalogDAO = require('../models/CatalogDAO');
const multer = require('multer');
const path = require('path');
const UsersDao = require('../models/UsersDAO');
const upload = multer({ dest: 'uploads/' });
const { ObjectId } = require('mongodb');

module.exports = class CatalogController {
	static async addPet(req, res) {
		if (req.currentUser.role !== 'admin')
			return res.status(401).json({ success: false, message: 'Unauthorized' });
		try {
			const petObject = {
				specie: req.body.specie,
				breed: req.body.breed,
				sex: req.body.sex,
				age: req.body.age,
				weight: req.body.weight,
				height: req.body.height,
				color: req.body.color,
				hypoallergenic: req.body.hypoallergenic,
				name: req.body.name,
				bio: req.body.bio,
				profilePic: req.body.profilePic,
				status: req.body.status,
				created_at: JSON.stringify(new Date()),
				created_by: req.currentUser._id,
				currentOwner: req.currentUser._id,
			};
			// console.log('petObject', petObject);
			// petObject.petCreatedByUsername = req.currentUser.username;

			const insertedPet = await CatalogDAO.createPet(petObject);
			console.log('pet created', insertedPet);
			return res.status(200).json({
				success: true,
				message: ['Thank you', 'Your pet was added to the database.'],
				petObj: insertedPet,
			});
		} catch (err) {
			console.log('Error in CatalogController.addPet: ', err);
			return res.status(500).json({
				success: false,
				message: 'Unknown error',
			});
		}
	}

	static async updatePet(req, res) {
		const petId = req.params.id;
		console.log('req.body.status', req.body.status);
		const objectId = new ObjectId(req.body.id);
		const petToUpdateObject = {
			specie: req.body.specie,
			breed: req.body.breed,
			sex: req.body.sex,
			age: req.body.age,
			weight: req.body.weight,
			height: req.body.height,
			color: req.body.color,
			hypoallergenic: req.body.hypoallergenic,
			name: req.body.name,
			bio: req.body.bio,
			profilePic: req.body.profilePic,
			status: req.body.status,
			modified_at: new Date(),
			currentOwner: req.currentUser._id,
		};

		try {
			const isPetExist = await CatalogDAO.getPetById(petId);

			if (!isPetExist)
				return res.status(400).json({
					success: false,
					message: 'Pet does not exist',
				});
			const result = await CatalogDAO.updatePetById(petId, petToUpdateObject);
			const updatedPet = await CatalogDAO.getPetById(petId);
			console.log('updatedPet', updatedPet);
			return res.status(200).json({
				success: true,
				message: ['Thank you', 'Your pet was updated.'],
				something: result,
				petObj: updatedPet,
			});
		} catch (err) {
			console.log('Error in CatalogController.updatePet: ', err);
			return res.status(400).json({
				success: false,

				message: 'Could not update pet',
			});
		}
	}

	static async getPetById(req, res) {
		try {
			const petId = req.params;
			console.log('petId', petId);
			const isPetExist = await CatalogDAO.getPetById(petId);
			if (!isPetExist)
				return {
					success: false,
					message: 'pet does not exist',
				};
			const pet = await CatalogDAO.getPetById(petId);
			console.log('pet', pet);
			return res.status(200).json({
				success: true,
				message: 'pet',
				pet: pet,
			});
		} catch (err) {
			console.log('Error in CatalogController.getPetById: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not get pet by id',
			});
		}
	}
	static async deletePet(req, res) {
		try {
			const petId = req.params.id;
			const petObj = await CatalogDAO.getPetById(petId);
			const currentUserId = req.currentUser._id.toString();
			const petOwnerId = petObj.currentOwner.toString();

			if (!petObj || req.currentUser.role !== 'admin') {
				console.log('Your are not the admin of this pet or pet does not exist');
				return res.status(400).json({
					success: false,
					message: 'Your are not the admin of this pet or pet does not exist',
				});
			}

			const deletePetById = await CatalogDAO.deletePetById(petId);
			console.log('deletePetById', deletePetById);
			return res.status(200).json({
				success: true,
				message: 'pet deleted',
				petObj: deletePetById,
			});
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: 'could not delete pet',
			});
		}
	}

	static async searchField(req, res) {
		const searchQuery = req.query;
		try {
			const petList = await CatalogDAO.getPetCatalog(searchQuery);
			if (petList.length === 0) {
				console.log('No pet found');
				return res.status(201).json({
					success: false,
					message: 'No pet found',
					petList: petList,
				});
			} else {
				return res.status(200).json({
					success: true,
					message: 'pet list',
					petList: petList,
				});
			}
		} catch (err) {
			console.log('Error in CatalogController.petList: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not get pet list',
			});
		}
	}

	static async searchEverywhere(req, res) {
		const searchQuery = req.params.term;

		try {
			const petList = await CatalogDAO.getTextPetCatalog(searchQuery);
			if (petList.length === 0) {
				console.log('No pet found');
				return res.status(201).json({
					success: false,
					message: 'No pet found',
					petList: petList,
				});
			} else {
				return res.status(200).json({
					success: true,
					message: 'pet list',
					petList: petList,
				});
			}
		} catch (err) {
			console.log('Error in CatalogController.petList: ', err);
			return res.status(500).json({
				success: false,
				message: 'Could not get pet list',
			});
		}
	}
};
