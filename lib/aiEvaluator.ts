import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function evaluateWithAI(htmlContent: string, ruleDescription: string): Promise<{ passed: boolean; reasoning: string }> {
  const prompt = `
    You are an accessibility expert. Evaluate the following HTML snippet against this rule:
    "${ruleDescription}"
    
    HTML:
    ${htmlContent.substring(0, 3000)}
    
    Respond in JSON: { "passed": boolean, "reasoning": "explanation" }
  `;
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(response.choices[0].message.content);
}