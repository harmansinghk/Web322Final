const bcrypt = require("bcryptjs");
require("dotenv").config();
const mongoose = require("mongoose");

let User;
let dbConnection;

const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }]
});

// Lazy initialization 
async function ensureInitialized() {
    if (User) return;

    if (!dbConnection) {
        dbConnection = await mongoose.createConnection(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    User = dbConnection.model("users", userSchema);
}

// Init for local development
module.exports.initialize = () => {
    return ensureInitialized();
};

module.exports.registerUser = async function (userData) {
    try {
        await ensureInitialized();

        if (userData.password !== userData.password2) {
            throw "Passwords do not match";
        }

        const hash = await bcrypt.hash(userData.password, 10);
        userData.password = hash;

        const newUser = new User(userData);
        await newUser.save();
    } catch (err) {
        if (err.code === 11000) {
            throw "User Name already taken";
        } else if (typeof err === "string") {
            throw err;
        } else {
            console.error("registerUser error:", err);
            throw "There was an error creating the user.";
        }
    }
};

module.exports.checkUser = async function (userData) {
    try {
        await ensureInitialized();

        const users = await User.find({ userName: userData.userName });
        if (users.length === 0) throw `Unable to find user: ${userData.userName}`;

        const match = await bcrypt.compare(userData.password, users[0].password);
        if (!match) throw `Incorrect Password for user: ${userData.userName}`;

        // update login history
        if (users[0].loginHistory.length === 8) users[0].loginHistory.pop();

        users[0].loginHistory.unshift({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
        });

        await User.updateOne(
            { userName: users[0].userName },
            { $set: { loginHistory: users[0].loginHistory } }
        );

        return users[0];
    } catch (err) {
        if (typeof err === "string") throw err;
        throw "There was an error verifying the user: " + err;
    }
};
