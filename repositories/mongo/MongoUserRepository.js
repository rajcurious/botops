const User = require('../models/mongo/userModel'); // Mongoose model
const UserRepository  = require("./UserRepository")
class MongoUserRepository extends UserRepository {
    async create(user) {
        return await User.create(user);
    }
    async findById(id) {
        return await User.findById(id);
    }
    async update(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return await User.findByIdAndDelete(id);
    }
}

module.exports = MongoUserRepository;
