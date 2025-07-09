# WhatsApp Integration Guide for Jeeva-SHG-RN

## Overview

The reminder system now supports WhatsApp messaging alongside SMS, email, and push notifications. This guide explains how to set up and configure WhatsApp integration for sending payment reminders.

## WhatsApp Integration Options

### 1. **Meta WhatsApp Business Cloud API** (Recommended)
- **Official** Meta/Facebook WhatsApp API
- **Free tier**: 1,000 conversations per month
- **Paid tiers**: Scale as needed
- **Setup**: Requires Facebook Business Account

### 2. **Twilio WhatsApp API**
- Well-documented and reliable
- Pay-per-message pricing
- Easy integration
- Good for small to medium businesses

### 3. **WhatsApp Business API (On-Premises)**
- For large enterprises
- More complex setup
- Higher costs
- Full control over infrastructure

## Setup Instructions

### Option 1: Meta WhatsApp Business Cloud API

#### Step 1: Create Facebook Business Account
1. Go to [Facebook Business](https://business.facebook.com/)
2. Create a business account
3. Complete business verification

#### Step 2: Set Up WhatsApp Business
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new App → Business → WhatsApp
3. Add WhatsApp product to your app

#### Step 3: Get API Credentials
1. In WhatsApp → Getting Started
2. Note your:
   - **Phone Number ID** (your WhatsApp business number)
   - **Access Token** (temporary token for testing)
   - **App ID** and **App Secret**

#### Step 4: Configure in App
1. Open Reminders screen → Settings
2. Enable "WhatsApp reminders"
3. Enter:
   - **API Key**: Your Access Token
   - **From Number**: Your Phone Number ID

#### Step 5: Test Integration
1. Send a test reminder
2. Check WhatsApp delivery
3. Monitor notification logs

### Option 2: Twilio WhatsApp API

#### Step 1: Create Twilio Account
1. Sign up at [Twilio](https://www.twilio.com/)
2. Complete phone verification
3. Get free credits for testing

#### Step 2: Enable WhatsApp
1. Go to Console → Messaging → WhatsApp
2. Request access to WhatsApp
3. Complete sandbox setup for testing

#### Step 3: Get Credentials
1. Note your:
   - **Account SID**
   - **Auth Token**
   - **WhatsApp-enabled phone number**

#### Step 4: Update Code
Uncomment and configure Twilio integration in `reminderService.ts`:

```typescript
// Option 2: Twilio WhatsApp API
const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${settings.whatsAppApiKey}`)}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    From: `whatsapp:${settings.whatsAppFromNumber}`,
    To: `whatsapp:${payload.to}`,
    Body: payload.text.body,
  }),
});
```

## Implementation Details

### Current Implementation Status
✅ **Completed:**
- WhatsApp toggle in settings
- Configuration UI for API key and phone number
- Message formatting and sending logic
- Notification logging and statistics
- Integration with existing reminder system

⚠️ **Mock Implementation:**
- Currently uses mock API calls
- Console logging instead of actual sending
- Ready for real API integration

### Code Locations

1. **Settings Interface**: `src/services/reminderService.ts`
   ```typescript
   enableWhatsApp: boolean;
   whatsAppApiKey?: string;
   whatsAppFromNumber?: string;
   ```

2. **Sending Logic**: `ReminderService.sendWhatsApp()`
3. **UI Configuration**: `src/screens/RemindersScreen.tsx`
4. **Statistics Tracking**: Included in notification logs

### Message Format
WhatsApp messages use the same format as SMS:
```
Dear [Borrower Name], your loan payment of ₹[Amount] is due on [Date] (in [X] days). Please ensure timely payment.
```

## Production Setup

### 1. Replace Mock Implementation
In `src/services/reminderService.ts`, uncomment the actual API integration:

```typescript
// For Meta WhatsApp Cloud API
const response = await fetch(`https://graph.facebook.com/v18.0/${settings.whatsAppFromNumber}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${settings.whatsAppApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});
```

### 2. Environment Variables
Store sensitive credentials securely:
```typescript
// Add to your environment configuration
WHATSAPP_API_KEY=your_access_token
WHATSAPP_FROM_NUMBER=your_phone_number_id
```

### 3. Error Handling
The system includes comprehensive error handling:
- Failed API calls are logged
- Retry logic can be added
- Status tracking in notification logs

### 4. Rate Limiting
Consider implementing rate limiting:
- WhatsApp has message limits
- Meta: 1,000 free conversations/month
- Implement queuing for high-volume scenarios

## User Configuration

### Settings Available:
1. **Enable WhatsApp**: Master toggle
2. **API Key**: Your WhatsApp API token
3. **From Number**: Your WhatsApp business number

### Per-User Settings:
- Uses existing phone number field from borrower profile
- Automatic phone number formatting
- Falls back to other channels if WhatsApp fails

## Compliance & Best Practices

### 1. **Opt-In Requirements**
- WhatsApp requires explicit user consent
- Consider adding opt-in checkbox to borrower profile
- Provide opt-out mechanism

### 2. **Message Guidelines**
- Keep messages concise and clear
- Include business identification
- Avoid spam-like behavior

### 3. **Rate Limits**
- Meta: 1,000 conversations/month (free)
- Twilio: Pay-per-message, no hard limits
- Monitor usage through notification statistics

### 4. **Data Privacy**
- Phone numbers are handled securely
- Messages are logged for audit purposes
- Comply with local data protection laws

## Testing

### 1. **Sandbox Testing**
Most providers offer sandbox environments:
- Test with your own phone number
- Verify message formatting
- Check error handling

### 2. **Production Testing**
- Start with small test groups
- Monitor delivery rates
- Check notification statistics

### 3. **Monitoring**
The app provides built-in monitoring:
- Success/failure rates
- Recent message logs
- Real-time statistics

## Troubleshooting

### Common Issues:

1. **Messages Not Sending**
   - Check API credentials
   - Verify phone number format
   - Check WhatsApp business account status

2. **Rate Limit Errors**
   - Monitor usage in notification statistics
   - Implement message queuing
   - Consider upgrading plan

3. **Phone Number Format**
   - Use international format (+91xxxxxxxxxx)
   - System auto-formats numbers
   - Test with various number formats

4. **API Authentication**
   - Verify access token validity
   - Check token permissions
   - Regenerate if expired

## Cost Considerations

### Meta WhatsApp Cloud API:
- **Free**: 1,000 conversations/month
- **Paid**: $0.005-$0.009 per conversation
- **Business verification**: May require fee

### Twilio WhatsApp:
- **Sandbox**: Free for testing
- **Production**: ~$0.005 per message
- **Setup fee**: Varies by region

### Recommendations:
- Start with free tiers for testing
- Monitor usage through app statistics
- Scale based on actual needs

## Future Enhancements

### Planned Features:
1. **Rich Media Support**: Images, documents
2. **Template Messages**: Pre-approved message templates
3. **Two-Way Communication**: Handle replies
4. **WhatsApp Business Profile**: Enhanced business presence
5. **Chatbot Integration**: Automated responses

### Advanced Features:
1. **Message Scheduling**: Send at optimal times
2. **A/B Testing**: Test different message formats
3. **Analytics Dashboard**: Detailed delivery analytics
4. **Integration with CRM**: Sync with customer records

The WhatsApp integration is now ready for configuration and testing! 🚀 