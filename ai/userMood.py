from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

sentiment_analyzer = pipeline("sentiment-analysis")
mood_data = [] 

@app.route("/analyze/", methods=["POST"])
def analyze_chat():
    data = request.json
    message = data.get("message")
    timestamp = data.get("timestamp")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    result = sentiment_analyzer(message)[0]
    sentiment = result["label"]
    score = result["score"]

    mood_data.append({
        "timestamp": timestamp,
        "message": message,  
        "sentiment": sentiment,
        "score": score
    })

    return jsonify({"timestamp": timestamp, "message": message, "sentiment": sentiment, "score": score})

@app.route("/mood-trends/", methods=["GET"])
def mood_trends():
    return jsonify(mood_data)

if __name__ == "__main__":
    app.run(debug=True)
