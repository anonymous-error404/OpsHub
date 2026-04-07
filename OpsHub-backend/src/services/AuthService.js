const crypto =
    require("crypto");

const jwt =
    require("jsonwebtoken");

const userService =
    require("./UserService");

function sha256(text) {

    return crypto
        .createHash("sha256")
        .update(text)
        .digest("hex");

}

async function login(

    email,
    password

) {

    const user =
        await userService
            .findByEmail(email);

    if (!user) {

        throw new Error(
            "Invalid credentials"
        );

    }

    // hash incoming password

    const hashed =
        sha256(password);

    if (hashed !== user.password) {

        throw new Error(
            "Invalid credentials"
        );

    }

    const token =
        jwt.sign(

            {

                id: user.id,
                email: user.email

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "1d"

            }

        );

    return {

        token,
        user

    };

}

module.exports = {

    login

};