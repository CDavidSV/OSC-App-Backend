
/**
 * Generate a random auth code
 * @param length 
 */
const generateAuthCode = (length: number) => {
    let code = "";
    for (let i = 0; i < length; i++) {
        const random = Math.floor(Math.random() * 10);
        code += random.toString();
    }

    return code;
};

export default generateAuthCode;