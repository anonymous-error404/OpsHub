const CryptoJS =
    require("crypto-js");

require("dotenv").config();

const key =
    process.env.ENCRYPTION_KEY;

function encrypt(text) {

    return CryptoJS.AES
        .encrypt(text, key)
        .toString();

}

function decrypt(text) {

    const bytes =
        CryptoJS.AES.decrypt(
            text,
            key
        );

    return bytes.toString(
        CryptoJS.enc.Utf8
    );

}

module.exports = {

    encrypt,
    decrypt

};