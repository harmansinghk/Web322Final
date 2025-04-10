const bcrypt = require("bcryptjs");
require("dotenv").config();
const mongoose = require("mongoose");

let User;

// Schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

// Initialize DB
function initialize() {
    return new Promise((resolve, reject) => {
        const db = mongoose.createConnection(process.env.MONGODB);

        db.on("error", (err) => reject(err));

        db.once("open", () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

module.exports.initialize = initialize;

// Auto-initialize for serverless (e.g., Vercel)
initialize().catch((err) => {
    console.error("MongoDB initialization failed:", err);
});

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (!User) {
            reject("User model not initialized.");
            return;
        }

        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        bcrypt
            .hash(userData.password, 10)
            .then((hash) => {
                userData.password = hash;

                let newUser = new User(userData);
                newUser.save()
                    .then(() => resolve())
                    .catch((err) => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    });
            })
            .catch((err) => {
                console.error("bcrypt error:", err);
                reject("There was an error encrypting the password");
            });
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (!User) {
            reject("User model not initialized.");
            return;
        }

        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                    return;
                }

                bcrypt.compare(userData.password, users[0].password)
                    .then((result) => {
                        if (!result) {
                            reject(`Incorrect Password for user: ${userData.userName}`);
                            return;
                        }

                        // Maintain login history
                        if (users[0].loginHistory.length === 8) {
                            users[0].loginHistory.pop();
                        }

                        users[0].loginHistory.unshift({
                            dateTime: new Date().toString(),
                            userAgent: userData.userAgent
                        });

                        User.updateOne(
                            { userName: users[0].userName },
                            { $set: { loginHistory: users[0].loginHistory } }
                        )
                            .then(() => resolve(users[0]))
                            .catch((err) => {
                                reject("There was an error verifying the user: " + err);
                            });
                    });
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
};
