import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import User from '../models/User.js'

export const register = async (req, res) => {
    try {
      const {email, password} = new User(req.body);
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = new User({
        email: email, 
        password: passwordHash
      });
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
  
export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) { 
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ id: user._id} , process.env.JWT_SECRET);
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};