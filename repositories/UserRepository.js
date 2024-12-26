// Repository interface
class UserRepository {
    async create(user) {
        throw new Error("Method not implemented");
    }
    async findById(id) {
        throw new Error("Method not implemented");
    }
    async update(id, data) {
        throw new Error("Method not implemented");
    }
    async delete(id) {
        throw new Error("Method not implemented");
    }
}

module.exports = UserRepository;
