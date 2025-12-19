import OpenAI from 'openai';

/**
 * Centralized OpenAI client configuration.
 * Always use this singleton to ensure consistent API key and configuration usage.
 */
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export default openai;
