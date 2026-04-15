import validator from "validator";

export const validateRegister = ( username, email, password ) => {
    if (!username || username.length < 3) {
        return "Username must be at least 3 characters";
    }

    if (!validator.isEmail(email)) {
        return "Invalid email format";
    }

    if (!password || password.length < 6) {
        return "Password must be at least 6 characters";
    }

    return null;
};
