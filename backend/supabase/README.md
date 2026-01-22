# Supabase Edge Functions

This directory contains Edge Functions for the FinScope AI application.

## Available Functions

### 1. send-verification-email

This function sends a verification email to users during signup or when email verification is required.

### 2. send-2fa-code

This function sends a two-factor authentication code via email during the login process.

## Setup Requirements

### Environment Variables

The following environment variables need to be set in your Supabase project:

- `RESEND_API_KEY`: API key for the Resend email service
- `SUPABASE_URL`: URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for your Supabase project

### Database Tables

The functions require the following database tables to be created in your Supabase project:

#### 1. email_verification_tokens

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index for faster lookups
CREATE INDEX email_verification_tokens_user_id_idx ON email_verification_tokens(user_id);
CREATE INDEX email_verification_tokens_token_idx ON email_verification_tokens(token);
```

#### 2. two_factor_codes

```sql
CREATE TABLE two_factor_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  used BOOLEAN DEFAULT false
);

-- Add index for faster lookups
CREATE INDEX two_factor_codes_user_id_idx ON two_factor_codes(user_id);
CREATE INDEX two_factor_codes_code_idx ON two_factor_codes(code);
```

## Deployment

To deploy these functions to your Supabase project, use the Supabase CLI:

```bash
supabase functions deploy send-verification-email
supabase functions deploy send-2fa-code
```

## Usage

### send-verification-email

```javascript
// Example usage in frontend code
const { data, error } = await supabase.functions.invoke('send-verification-email', {
  body: {
    email: 'user@example.com',
    userId: 'user-uuid',
    type: 'signup' // or 'verification'
  }
});
```

### send-2fa-code

```javascript
// Example usage in frontend code
const { data, error } = await supabase.functions.invoke('send-2fa-code', {
  body: {
    email: 'user@example.com',
    userId: 'user-uuid',
    ipAddress: request.ip, // User's IP address
    userAgent: request.headers['user-agent'] // User's browser info
  }
});
```