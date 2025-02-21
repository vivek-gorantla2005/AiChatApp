from flask import Flask, request, jsonify
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from flask_cors import CORS

nltk.download('vader_lexicon')
nltk.download('punkt')

app = Flask(__name__)
CORS(app)

s_analyzer = SentimentIntensityAnalyzer()

def calculate_progress(chat_messages, goal):
    progress = 0.0
    goal = goal.lower()

    for msg in chat_messages:
        text = msg["text"].lower()
        
        if goal in text or any(word.startswith(goal) for word in text.split()):
            scores = s_analyzer.polarity_scores(msg["text"])

            if scores['compound'] > 0.15:  
                progress += max(0, scores['compound']) * 15 
                
                if "than" in text or "over" in text:
                    progress += 2.5

            elif scores['compound'] < -0.2:  
                deduction = abs(scores['compound']) * 10 
                progress -= min(deduction, progress)  
                
                if any(word in text for word in ["failed", "stuck", "problem", "issue", "can't"]):
                    progress -= 5  

    base_mentions = sum(1 for msg in chat_messages if goal in msg["text"].lower())
    progress += min(base_mentions * 1.5, 15)  

    return round(max(progress, 0), 2)  

@app.route("/track_progress/", methods=["POST"])
def track_progress():
    try:
        data = request.get_json()
        messages = data.get("messages", [])
        goal = data.get("goal", "")

        if not messages or not goal:
            return jsonify({"error": "Missing messages or goal"}), 400

        progress = calculate_progress(messages, goal)

        return jsonify({
            "goal": goal,
            "progress": progress
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port = 5001,debug=True)
