require('dotenv').config()
const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT a partir de un UID.
 * @param {string} uid - UID utilizado para generar el token.
 * @returns {Promise<string>} - Token JWT generado.
 * @throws {Error} - Si el parámetro UID no es válido o si no se puede generar el token.
 */
async function generateJWT(uid: String) {
    if (!uid || typeof uid !== 'string') {
        throw new Error('ERROR: El parámetro "uid" es requerido y debe ser una cadena de caracteres.');
    }

    try {
        const payload = { uid };
        const token = await generateToken(payload);
        return token;
    } catch (error) {
        console.error('Error al generar el token:', error);
        throw new Error('ERROR: No se pudo generar el token.');
    }
}

/**
 * Genera el token utilizando el payload y las opciones especificadas.
 * @param {object} payload - Objeto de datos a incluir en el token.
 * @returns {Promise<string>} - Token JWT generado.
 * @throws {Error} - Si no se puede generar el token debido a un error interno o una configuración incorrecta.
 */
type payloadProps = {
    uid: String;
}
async function generateToken(payload: payloadProps) {
    try {
        const token = jwt.sign(payload, process.env.SECRET_OR_PRIVATE_KEY, {
            expiresIn: '24h'
        });
        
        return token;
    } catch (error) {
        console.error('Error al generar el token:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('ERROR: Error al generar el token. Verifica la clave secreta o los parámetros del token.');
        } else {
            throw new Error('ERROR: No se pudo generar el token debido a un error interno.');
        }
    }
}

module.exports = {
    generateJWT
};
