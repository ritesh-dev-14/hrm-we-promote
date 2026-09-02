-- Add the status reported by Meta after a recipient reads a message.
ALTER TYPE "WhatsappMessageStatus" ADD VALUE IF NOT EXISTS 'READ';