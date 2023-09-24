interface JsonValidator {
    required: boolean;
    type: string;
}

interface JsonValidatorResponse {
    valid: boolean;
    missing?: string[];
    invalid?: string[];
}

const validateJsonBody = (body: any, schema: { [key: string]: JsonValidator }) => {
    const missing = [];
    const invalid = [];
    for (const key in schema) {
        const value = body[key];
        const validator = schema[key];

        if (!value && validator.required) {
            missing.push(key);
            continue;
        } else if (validator.type === 'array' && !Array.isArray(value)) {
            invalid.push(key);
            continue;
        } else if (typeof value !== validator.type) {
            invalid.push(key);
            continue;
        }
    }

    return {
        valid: missing.length === 0 && invalid.length === 0,
        missing: missing.length > 0 ? missing : undefined,
        invalid: invalid.length > 0 ? invalid : undefined
    } as JsonValidatorResponse;
};

export { validateJsonBody, JsonValidatorResponse, JsonValidator };