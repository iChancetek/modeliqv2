from openai import OpenAI
import os

# Initialize OpenAI Client
# Assumes OPENAI_API_KEY is in environment variables
client = OpenAI()

def generate_data_insights(profile: dict) -> str:
    """
    Uses OpenAI to analyze the data profile and generate insights.
    """
    try:
        prompt = f"""
        You are an expert Data Scientist. Analyze the following dataset profile and provide:
        - 3 key insights about correlations, distributions, or anomalies.
        - 1 critical warning about data quality (e.g., high missing values, skew).
        
        Format the output as a bulleted list. Keep it concise/executive summary style.
        
        Dataset Profile:
        {str(profile)[:4000]} 
        """
        # Truncate profile to avoid token limits if necessary, though 5.2 has large context.
        
        response = client.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": "You are a helpful Data Science Assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_completion_tokens=1000,
        )
        content = response.choices[0].message.content
        return content.strip()
    except Exception as e:
        print(f"Error generating insights: {e}")
        return "- Unable to generate insights due to an error.\n- Please check your API key."
