import { supabase } from "@/services/supabase";
import { inngest } from "./client";
import axios from 'axios';

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

export const llmModel = inngest.createFunction(
    { id: 'llm-model' },
    { event: 'llm-model' },
    async ({ event, step }) => {
        // Retry logic for OpenAI call
        async function callOpenAIWithRetry(prompt, retries = 5, delaySeconds = 5) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await axios.post(
                        'https://api.openai.com/v1/chat/completions',
                        {
                            model: 'gpt-3.5-turbo',
                            messages: [
                                { role: 'system', content: 'Depends on user input sources, Summarize and search about topic, Give markdown text with proper formatting. User Input is: ' + event.data.searchInput },
                                { role: 'user', content: JSON.stringify(event.data.searchResult) }
                            ],
                            temperature: 0.7
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    return response.data;
                } catch (err) {
                    if ((err.response?.status === 429 || err.response?.status === 503) && i < retries - 1) {
                        await step.sleep('wait-before-retry', `${delaySeconds}s`);
                        continue;
                    }
                    if (i === retries - 1) {
                        return { error: { code: err.response?.status, message: err.message, status: err.response?.statusText } };
                    }
                    throw err;
                }
            }
        }

        // Call OpenAI only
        const aiRespOpenAI = await callOpenAIWithRetry(event.data.searchInput);

        await step.run('saveOpenAIToDb', async () => {
            // Log the response for debugging
            console.log('OpenAI response:', aiRespOpenAI);

            let content = null;
            if (aiRespOpenAI && Array.isArray(aiRespOpenAI.choices) && aiRespOpenAI.choices[0]?.message?.content) {
                content = aiRespOpenAI.choices[0].message.content;
            } else if (aiRespOpenAI?.error?.message) {
                content = '[OpenAI Error] ' + aiRespOpenAI.error.message;
            } else {
                content = '[OpenAI Error] No valid response from OpenAI API';
            }

            await supabase
                .from('Chats')
                .update({
                    aiResp: content
                })
                .eq('id', event.data.recordId)
                .select();
        });

        // Optionally return OpenAI response
        return {
            openai: aiRespOpenAI.choices?.[0]?.message?.content || aiRespOpenAI.error || '[OpenAI Error] No valid response from OpenAI API'
        };
    }
)