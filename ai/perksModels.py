from flask import Flask, request, jsonify
from transformers import pipeline
from collections import defaultdict

sentiment_model = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
intent_model = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

app = Flask(__name__)

BADGE_CATEGORIES = {
    "Social Butterfly": "engaging with multiple users",
    "Positive Vibes": "maintaining positivity and happy conversations",
    "Consistent Chatter": "chatting regularly without breaks",
    "Focused Learner": "discussing self-improvement topics",
    "Motivator": "encouraging and supporting others"
}

SENTIMENT_MAPPING = {
    "LABEL_0": "NEGATIVE",
    "LABEL_1": "NEUTRAL",
    "LABEL_2": "POSITIVE"
}

@app.route("/analyze_chat", methods=["POST"])
def analyze_chat():
    data = request.json
    conversations = data.get("conversations", []) 

    if not conversations:
        return jsonify({"error": "Conversations list cannot be empty"}), 400

    user_data = defaultdict(lambda: {"sentiments": [], "intents": defaultdict(int)})

    for chat in conversations:
        user = chat.get("user", "Unknown User")
        message = chat.get("message", "")

        if not message:
            continue

        sentiment_result = sentiment_model(message)
        sentiment = SENTIMENT_MAPPING.get(sentiment_result[0]["label"], "UNKNOWN")
        user_data[user]["sentiments"].append(sentiment)

        intent_result = intent_model(message, list(BADGE_CATEGORIES.keys()), multi_label=True)
        for i, score in enumerate(intent_result["scores"]):
            if score > 0.6:
                user_data[user]["intents"][intent_result["labels"][i]] += 1

    final_results = {}
    
    for user, data in user_data.items():
        sentiment_counts = defaultdict(int)
        for sentiment in data["sentiments"]:
            sentiment_counts[sentiment] += 1

        dominant_sentiment = max(sentiment_counts, key=sentiment_counts.get, default="NEUTRAL")
        assigned_badges = []

        if len(data["sentiments"]) >= 5: 
            assigned_badges.append("Consistent Chatter")

        for badge, count in data["intents"].items():
            if count >= 3: 
                assigned_badges.append(badge)

        final_results[user] = {
            "dominant_sentiment": dominant_sentiment,
            "assigned_badges": assigned_badges
        }

    return jsonify(final_results)

if __name__ == "__main__":
    app.run(debug=True)
