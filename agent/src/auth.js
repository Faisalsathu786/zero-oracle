const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'zero-oracle-secret-key-change-in-production';
const USERS_FILE = path.join(__dirname, '../../data/users.json');

class AuthService {
  constructor() {
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]');
    }
  }

  _readUsers() {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch {
      return [];
    }
  }

  _writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }

  async signup(email, password, name) {
    const users = this._readUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: users.length + 1,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      analyses: []
    };

    users.push(user);
    this._writeUsers(users);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async login(email, password) {
    const users = this._readUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  getUserById(userId) {
    const users = this._readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  addAnalysis(userId, analysis) {
    const users = this._readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    user.analyses = user.analyses || [];
    user.analyses.unshift({
      id: Date.now(),
      ...analysis,
      timestamp: new Date().toISOString()
    });

    this._writeUsers(users);
    return user.analyses[0];
  }

  getAnalyses(userId) {
    const users = this._readUsers();
    const user = users.find(u => u.id === userId);
    return (user?.analyses || []).slice(0, 50);
  }
}

module.exports = { AuthService };
