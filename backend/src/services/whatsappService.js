const axios = require('axios');
const ApiError = require('../utils/ApiError');
const ERRORS = require('../utils/errors');

// Meta WhatsApp API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_API_KEY;

/**
 * Send a WhatsApp message via Meta's WhatsApp Business API
 * @param {string} phoneNumber - Recipient phone number in E.164 format (e.g., +91...)
 * @param {string} messageBody - Plain text message content
 * @returns {Promise<{success: boolean, messageId: string, error?: string}>}
 */
exports.sendMessage = async (phoneNumber, messageBody) => {
  try {
    // Validate inputs
    if (!phoneNumber || !messageBody) {
      throw new ApiError(400, {
        code: 'WHATSAPP_INVALID_INPUT',
        message: 'Phone number and message body are required',
      });
    }

    // Validate phone format (E.164)
    if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      throw new ApiError(400, {
        code: 'WHATSAPP_INVALID_PHONE',
        message: `Invalid phone number format. Expected E.164 format (e.g., +91...). Received: ${phoneNumber}`,
      });
    }

    // Check if API credentials are configured
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      throw new ApiError(500, {
        code: 'WHATSAPP_CONFIG_MISSING',
        message: 'WhatsApp API credentials not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_API_KEY in .env',
      });
    }

    // Prepare API request payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'text',
      text: {
        body: messageBody,
      },
    };

    // Send request to Meta WhatsApp API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Extract message ID from response
    const messageId = response.data?.messages?.[0]?.id;
    if (!messageId) {
      console.error('WhatsApp API response missing message ID:', response.data);
      throw new ApiError(500, {
        code: 'WHATSAPP_RESPONSE_ERROR',
        message: 'WhatsApp API response did not contain message ID',
      });
    }

    return {
      success: true,
      messageId,
      timestamp: new Date(),
    };
  } catch (error) {
    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Common WhatsApp API errors
      let errorCode = 'WHATSAPP_API_ERROR';
      let errorMessage = data?.message || 'Unknown WhatsApp API error';

      if (status === 400) {
        errorCode = 'WHATSAPP_BAD_REQUEST';
      } else if (status === 401 || status === 403) {
        errorCode = 'WHATSAPP_AUTH_ERROR';
        errorMessage = 'WhatsApp API authentication failed. Check your credentials.';
      } else if (status === 429) {
        errorCode = 'WHATSAPP_RATE_LIMITED';
        errorMessage = 'WhatsApp API rate limit exceeded. Please try again later.';
      }

      console.error(`WhatsApp API Error [${status}]:`, {
        errorCode,
        errorMessage,
        details: data,
      });

      return {
        success: false,
        error: errorMessage,
        errorCode,
        statusCode: status,
      };
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('WhatsApp API request timeout:', error.message);
      return {
        success: false,
        error: 'WhatsApp API request timeout. Please try again later.',
        errorCode: 'WHATSAPP_TIMEOUT',
      };
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Network error connecting to WhatsApp API:', error.message);
      return {
        success: false,
        error: 'Network error. Could not connect to WhatsApp service.',
        errorCode: 'WHATSAPP_NETWORK_ERROR',
      };
    }

    // Handle custom API errors
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.details?.code || 'WHATSAPP_ERROR',
      };
    }

    // Generic error handling
    console.error('Unexpected error in whatsappService.sendMessage:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while sending WhatsApp message',
      errorCode: 'WHATSAPP_UNKNOWN_ERROR',
    };
  }
};

/**
 * Check delivery status of a sent message
 * @param {string} messageId - Meta WhatsApp message ID
 * @returns {Promise<{status: string, timestamp: string}>}
 */
exports.checkDeliveryStatus = async (messageId) => {
  try {
    if (!messageId || !ACCESS_TOKEN) {
      throw new ApiError(400, {
        code: 'WHATSAPP_INVALID_INPUT',
        message: 'Message ID and API credentials are required',
      });
    }

    const response = await axios.get(
      `${WHATSAPP_API_URL}/${messageId}`,
      {
        params: {
          fields: 'status,timestamp',
          access_token: ACCESS_TOKEN,
        },
        timeout: 10000,
      }
    );

    return {
      status: response.data?.status || 'UNKNOWN',
      timestamp: response.data?.timestamp,
    };
  } catch (error) {
    console.error('Error checking WhatsApp delivery status:', error.message);
    return {
      status: 'ERROR',
      error: error.message,
    };
  }
};

/**
 * Validate WhatsApp phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean}
 */
exports.isValidPhoneNumber = (phoneNumber) => {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
};

/**
 * Format phone number to E.164 format if needed
 * @param {string} phone - Phone number (can be with or without country code)
 * @param {string} countryCode - Default country code if not present (e.g., 'IN' for India)
 * @returns {string|null} - Formatted phone in E.164 format or null if invalid
 */
exports.formatPhoneNumber = (phone, countryCode = 'IN') => {
  if (!phone) return null;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If it already starts with 91 (India), or has been provided a country code
  let formatted = cleaned;

  // Handle India numbers specifically
  if (countryCode === 'IN' || countryCode === '+91') {
    // Remove leading 91 if present and add it back with +
    if (formatted.startsWith('91')) {
      formatted = formatted.substring(2);
    }
    formatted = `91${formatted}`;
  }

  // Validate length for Indian numbers (should be 10 digits after country code)
  if (formatted.startsWith('91') && formatted.length !== 12) {
    return null;
  }

  // Add + prefix
  return `+${formatted}`;
};
