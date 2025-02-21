from flask import Flask, request, jsonify
from flask_cors import CORS  
from transformers import pipeline
import spacy
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from datetime import datetime

app = Flask(__name__)
CORS(app) 

summarizer = pipeline('summarization', model="facebook/bart-large-cnn")
nlp = spacy.load('en_core_web_sm')
nltk.download('vader_lexicon')
s_analyzer = SentimentIntensityAnalyzer()

def generate_summary(chat_text):
    try:
        if not chat_text.strip():
            return "No meaningful content to summarize."
        summary = summarizer(
            chat_text, max_length=100, min_length=30, do_sample=True, temperature=0.7, top_k=51, num_beams=4, early_stopping=True
        )[0]["summary_text"]
        
        return summary
    except Exception as e:
        return f"Summarization Error: {str(e)}"

def extract_entities(summary_text):
    doc = nlp(summary_text)
    allowed_entity_types = {"PERSON", "ORG", "LOC", "GPE", "EVENT", "WORK_OF_ART"}
    entities = set()

    for ent in doc.ents:
        if ent.label_ in allowed_entity_types:
            entities.add(ent.text)

    for chunk in doc.noun_chunks:
        words = chunk.text.split()
        if 1 <= len(words) <= 3:
            cleaned_chunk = " ".join([token.text for token in chunk if token.pos_ not in ["DET", "PRON"]])
            if cleaned_chunk:
                entities.add(cleaned_chunk)

    return sorted(entities) if entities else ["Nothing Important"]

def analyze_sentiment(text):
    score = s_analyzer.polarity_scores(text)["compound"]
    if score > 0.3:
        return "Optimistic & Motivated"
    elif score < -0.3:
        return "Negative"
    else:
        return "Neutral"

def generate_mood_timeline():
    return [
        "9:00 AM: Morning Standup (Energetic)",
        "12:30 PM: Project Brainstorming (Focused)",
        "3:00 PM: Weekend Plans Discussion (Casual)",
        "8:00 PM: Personal Development Talks (Reflective)"
    ]

def format_journal(summary, key_topics, mood):  
    date = datetime.now().strftime("%A, %B %d, %Y")
    
    journal = f"""
    Today's Journal ({date})
    Summary: {summary}
    Mood: {mood}
    Key Topics Discussed: {", ".join(key_topics)}
    AI Suggestions: Consider setting a reminder for the project discussion next week. 
    Also, explore some fun activities for the weekend to relax.
    Mood & Discussion Timeline:
    {"\n".join(generate_mood_timeline())}
    Your Notes:
    """
    return journal

@app.route("/Gen_Summary/", methods=["POST"])
def process_chat():
    try:
        data = request.get_json()
        chat_messages = data.get("messages", "")
        
        summary = generate_summary(chat_messages)
        key_entities = extract_entities(summary)
        mood = analyze_sentiment(chat_messages)

        journal_output = format_journal(summary, key_entities, mood)

        return jsonify({
            "journal": journal_output
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port = 5002,debug=True)
