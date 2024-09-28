const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/GenerateToken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    // if user already exists
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // creating new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // generating jwt token
    const token = generateToken({
      email: newUser.email,
      name: newUser.name,
    });

    // sending jwt token in the response cookies
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error occured during signup, please try again later" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // checking if user exists or not
    const existingUser = await User.findOne({ email });

    // if exists and password matches the hash
    if (
      existingUser &&
      (await bcrypt.compare(password, existingUser.password))
    ) {
      // generating jwt token
      const token = generateToken({
        email: existingUser.email,
        name: existingUser.name,
      });

      // sending jwt token in the response cookies
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      return res.status(200).json({ message: "Logged in successfully", token });
    }

    res.clearCookie("token");
    return res.status(404).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Some error occured while logging in, please try again later",
    });
  }
};
