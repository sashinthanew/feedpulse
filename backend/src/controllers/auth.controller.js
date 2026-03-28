const jwt = require('jsonwebtoken');

const ADMIN_EMAIL = 'admin@feedpulse.com';
const ADMIN_PASSWORD = 'admin123';

const login = (req, res) => {
  const { email, password } = req.body;
  
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  res.json({ success: true, data: { token } });
};

module.exports = { login };