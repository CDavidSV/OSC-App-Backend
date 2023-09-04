# OSC App Backend

## env structure

Required parameters for the env file
```
MONGO_URI=

ACCESS_TOKEN_KEY=
REFRESH_TOKEN_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Error Codes

- 1001: Missing required parameters, check any missing parameters in the request body.
- 1002: Invalid phone number provided, provide a valid phone number.
- 1003: Error sending OTP code via SMS, check the phone number and try again.
- 1004: Invalid phone number or verification time frame expired, retry login.
- 1005: Invalid OTP code provided, check the code and try again.
- 1006: Error generating tokens, retry request.
- 1007: User has already been registered, try logging in.
- 1008: Error registering user in the database, retry request.
- 1009: No refresh token provided, provide a refresh token.
- 1010: Invalid refresh token provided, provide a valid refresh token.
- 1011: Error revoking refresh token, retry request.
- 1012: Error generating new access token, retry request.