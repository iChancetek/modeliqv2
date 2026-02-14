import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, context } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Instantiate OpenAI client lazily to avoid build-time errors if env var is missing
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OpenAI API Key is missing");
            return NextResponse.json(
                { error: 'OpenAI API Configuration Missing' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        const systemPrompt = `You are an expert Python data science assistant. 
    Your task is to generate Python code based on the user's request. 
    The code will be executed in a browser-based Pyodide environment.
    
    Context:
    - Libraries available: pandas, numpy, scikit-learn, matplotlib.
    - If the user asks to load data, assume 'df' is the variable name if they uploaded a CSV (passed in context).
    - Return ONLY the Python code. No markdown backticks, no explanations.
    - If plotting, use 'plt.show()' but note that Pyodide handles it automatically if configured correctly.
    
    User Context: ${context || 'No specific context provided.'}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // or gpt-3.5-turbo if preferred
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 500,
        });

        const code = response.choices[0].message.content?.replace(/```python|```/g, '').trim();

        return NextResponse.json({ code });
    } catch (error: any) {
        console.error('GenAI Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate code' },
            { status: 500 }
        );
    }
}
