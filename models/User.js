const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

class User {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('users');
  }

  async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async findByEmail(email) {
    return this.collection.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username) {
    return this.collection.findOne({ username });
  }

  async findByEmailOrUsername(email, username) {
    return this.collection.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });
  }

  async findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  async updateById(id, updateData) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result;
  }

  async deleteById(id) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async findAll(filter = {}, options = {}) {
    return this.collection.find(filter, options).toArray();
  }
}

module.exports = User;