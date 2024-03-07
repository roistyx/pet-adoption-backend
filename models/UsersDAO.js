// injectDB injects this connection to the database
const { ObjectId } = require('mongodb');

let userCollection;

module.exports = class UsersDao {
	static async injectDB(connection) {
		if (!connection) return;

		try {
			userCollection = await connection.collection('users');
			console.log('Connected to MongoDB users');
		} catch (err) {
			console.log(
				`Unable to establish a collection handle in usersDAO: ${err}`
			);
		}
	}
	static async getUserById(UserId) {
		console.log('UserId', UserId);
		// return await collection.findOne({ _id: new ObjectId(UserId) });
		// return console.log('UserId', UserId);

		try {
			const userObject = await userCollection.findOne({
				_id: new ObjectId(UserId),
			});
			console.log('userObject', userObject);
			return userObject;
		} catch (err) {
			console.log('Error in getUserById: ', err);
			return { error: err };
		}
		return;
	}

	static async createUser(userData) {
		userData.created_at = new Date();
		userData.login_attempts = 0;

		// if (await this.getUserByUsername(userData.username)) return {};
		return await userCollection.insertOne({ ...userData });
	}

	static async adminInit() {
		let isAdminInit = '';
		console.log('Hello world');
		const user = process.env.ADMIN_EMAIL;
		const password = process.env.ADMIN_PASSWORD;

		// isAdminInit = await this.getUserByUsername(user);
		console.log('isAdminInit', isAdminInit);
		// if (isAdminInit) return;

		const userData = {
			username: user,
			password: password,
			role: 'admin',
			created_at: new Date(),
			login_attempts: 0,
		};
		console.log('Admin created', userData);
		return await userCollection.insertOne({ ...userData });
	}

	static async getUserByUsername(username) {
		const userObject = await userCollection.findOne({ username });
		// console.log('userObject', userObject);
		return userObject;
	}

	static async updateUserById(UserId, userData) {
		try {
			const updateResponse = await userCollection.updateOne(
				{ _id: new ObjectId(UserId) },
				{ $set: { ...userData } }
			);
			return updateResponse;
		} catch (err) {
			console.log('Error in updateUserById: ', err);
			return { error: err };
		}
	}

	static async savePet(userId, petId) {
		// console.log('userId', userId);
		// console.log('petId', petId);
		try {
			// const updateResponse = await userCollection.updateOne(
			// 	{ _id: new ObjectId(userId) },
			// 	{ $push: { pets: petId } }
			// );
			const result = await userCollection.findOneAndUpdate(
				{ _id: new ObjectId(userId) },
				{ $push: { pets: petId } },
				{ returnOriginal: false }
			);
			const pets = await this.getUserById(new ObjectId(userId));
			console.log('Original result?', result);

			return pets;
		} catch (err) {
			console.log('Error in savePet: ', err);
			return { error: err };
		}
	}

	static async updateUserById(UserId, userData) {
		try {
			const updateResponse = await userCollection.updateOne(
				{ _id: new ObjectId(UserId) },
				{ $set: { ...userData } }
			);
			return updateResponse;
		} catch (err) {
			console.log('Error in updateUserById: ', err);
			return { error: err };
		}
	}

	static async deletePet(userId, petId) {
		console.log('userId', userId);
		console.log('petId', petId);
		try {
			// const updateResponse = await userCollection.updateOne(
			// 	{ _id: new ObjectId(userId) },
			// 	{ $push: { pets: petId } }
			// );
			const result = await userCollection.findOneAndUpdate(
				{ _id: new ObjectId(userId) },
				{ $pull: { pets: petId } },
				{ returnOriginal: false }
			);
			// return console.log('result', result.value.pets);
			return result.value.pets;
			return updateResponse;
		} catch (err) {
			console.log('Error in savePet: ', err);
			return { error: err };
		}
	}

	static async getPetSavedList(userId, petId) {
		console.log('userId', userId);
		console.log('petId', petId);
		try {
		} catch (err) {
			console.log('Error in savePet: ', err);
			return { error: err };
		}
	}

	static async unSavePets(userId, petId) {
		console.log('userId', userId);
		console.log('petId', petId);
		try {
			const isExist = await userCollection.findOne({
				_id: new ObjectId(userId),
				pets: petId,
			});
			if (!isExist) return console.log('Nothing to unsave');
			const updatedPetList = await userCollection.findOneAndUpdate(
				{ _id: new ObjectId(userId) },
				{ $pull: { pets: petId } },
				{ returnOriginal: false }
			);
			console.log('updatedPetList', updatedPetList);
			return updatedPetList;
		} catch (err) {
			console.log('Error in deleteSavedPet: ', err);
			return { error: err };
		}
	}
};
