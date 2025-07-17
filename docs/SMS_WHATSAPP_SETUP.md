# SMS & WhatsApp Setup Guide for Jeeva SHG Manager

## 🚀 Quick Setup

The reminder system now supports real SMS and WhatsApp messaging. Follow this guide to configure your APIs.

## 📱 SMS Setup (Twilio)

### Step 1: Create Twilio Account
1. Go to [Twilio.com](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your phone number
4. Get free credits for testing

### Step 2: Get Credentials
1. Go to Twilio Console → Dashboard
2. Note your:
   - **Account SID**
   - **Auth Token**
   - **Twilio Phone Number** (for sending SMS)

### Step 3: Configure Environment Variables
Add these to your `.env` file:

```bash
EXPO_PUBLIC_SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts
EXPO_PUBLIC_SMS_ACCOUNT_SID=your_account_sid_here
EXPO_PUBLIC_SMS_AUTH_TOKEN=your_auth_token_here
EXPO_PUBLIC_SMS_FROM_NUMBER=+1234567890
```

### Step 4: Test SMS
1. Go to Reminders → Settings
2. Enable "SMS reminders"
3. Send a test reminder
4. Check your phone for the message

## 💬 WhatsApp Setup (Meta WhatsApp Cloud API)

### Step 1: Create Facebook Business Account
1. Go to [Facebook Business](https://business.facebook.com/)
2. Create a business account
3. Complete business verification

### Step 2: Set Up WhatsApp Business
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new App → Business → WhatsApp
3. Add WhatsApp product to your app

### Step 3: Get API Credentials
1. In WhatsApp → Getting Started
2. Note your:
   - **Phone Number ID** (your WhatsApp business number)
   - **Access Token** (temporary token for testing)
   - **App ID** and **App Secret**

### Step 4: Configure in App
1. Go to Reminders → Settings
2. Enable "WhatsApp reminders"
3. Enter:
   - **API Key**: Your Access Token
   - **From Number**: Your Phone Number ID

### Step 5: Test WhatsApp
1. Send a test reminder
2. Check WhatsApp delivery
3. Monitor notification logs

## 📧 Email Setup (SendGrid)

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for free account
3. Verify your domain or use single sender verification

### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create a new API key with "Mail Send" permissions
3. Copy the API key

### Step 3: Configure Environment Variables
Add to your `.env` file:

```bash
EXPO_PUBLIC_EMAIL_API_URL=https://api.sendgrid.com/v3/mail/send
EXPO_PUBLIC_EMAIL_API_KEY=your_sendgrid_api_key_here
EXPO_PUBLIC_EMAIL_FROM=noreply@jeevatrust.org
```

## 🔧 Alternative SMS Providers

### AWS SNS
```bash
EXPO_PUBLIC_SMS_API_URL=https://sns.us-east-1.amazonaws.com
EXPO_PUBLIC_SMS_ACCOUNT_SID=your_aws_access_key
EXPO_PUBLIC_SMS_AUTH_TOKEN=your_aws_secret_key
```

### MessageBird
```bash
EXPO_PUBLIC_SMS_API_URL=https://rest.messagebird.com/messages
EXPO_PUBLIC_SMS_ACCOUNT_SID=your_messagebird_api_key
```

## 🔧 Alternative WhatsApp Providers

### Twilio WhatsApp
1. Enable WhatsApp in Twilio Console
2. Use Twilio WhatsApp API instead of Meta
3. Update the WhatsApp sending function

### WhatsApp Business API (On-Premises)
For enterprise users with high volume needs.

## 💰 Cost Considerations

### SMS Costs:
- **Twilio**: ~$0.0075 per SMS
- **AWS SNS**: ~$0.00645 per SMS
- **MessageBird**: ~$0.007 per SMS

### WhatsApp Costs:
- **Meta**: 1,000 free conversations/month, then $0.005-$0.009 per conversation
- **Twilio**: ~$0.005 per message

### Email Costs:
- **SendGrid**: 100 free emails/day, then $0.0001 per email
- **AWS SES**: $0.10 per 1,000 emails

## 🛡️ Security Best Practices

### 1. Environment Variables
- Never commit API keys to Git
- Use `.env` files for local development
- Use secure environment variables in production

### 2. API Key Management
- Rotate API keys regularly
- Use least privilege permissions
- Monitor API usage

### 3. Phone Number Validation
- Validate phone numbers before sending
- Handle international formats
- Implement rate limiting

## 📊 Monitoring & Analytics

### Built-in Monitoring:
The app provides:
- Success/failure rates
- Recent message logs
- Real-time statistics
- Error tracking

### External Monitoring:
- Set up alerts for failed messages
- Monitor API usage and costs
- Track delivery rates

## 🧪 Testing

### Development Testing:
1. Use mock mode (no API keys configured)
2. Test with your own phone number
3. Verify message formatting

### Production Testing:
1. Start with small test groups
2. Monitor delivery rates
3. Check notification statistics

## 🚨 Troubleshooting

### Common SMS Issues:
1. **Invalid phone number format**
   - Ensure international format (+91xxxxxxxxxx)
   - Remove spaces and special characters

2. **API authentication failed**
   - Check Account SID and Auth Token
   - Verify Twilio account status

3. **Message not delivered**
   - Check recipient phone number
   - Verify Twilio phone number is active

### Common WhatsApp Issues:
1. **Message not sent**
   - Check Phone Number ID and Access Token
   - Verify WhatsApp Business account status

2. **Template message required**
   - Use pre-approved message templates
   - Avoid promotional content

3. **Rate limiting**
   - Monitor usage in notification statistics
   - Implement message queuing

### Common Email Issues:
1. **Email not sent**
   - Check SendGrid API key
   - Verify sender email domain

2. **Spam filtering**
   - Use proper sender authentication
   - Avoid spam trigger words

## 📋 Configuration Checklist

- [ ] Twilio account created and verified
- [ ] SMS credentials configured in environment
- [ ] WhatsApp Business account set up
- [ ] WhatsApp API credentials configured
- [ ] SendGrid account created
- [ ] Email API key configured
- [ ] Test messages sent successfully
- [ ] Notification statistics working
- [ ] Error handling tested
- [ ] Rate limiting implemented

## 🎯 Next Steps

1. **Start with SMS**: Easiest to set up and test
2. **Add WhatsApp**: Higher engagement rates
3. **Configure Email**: Good for detailed communications
4. **Monitor Performance**: Track delivery rates and costs
5. **Optimize Messages**: A/B test different formats

## 📞 Support

For issues with:
- **Twilio**: Check [Twilio Support](https://support.twilio.com/)
- **WhatsApp**: Check [Meta Developer Support](https://developers.facebook.com/support/)
- **SendGrid**: Check [SendGrid Support](https://support.sendgrid.com/)

For app-specific issues, check the notification logs in the Reminders screen. 