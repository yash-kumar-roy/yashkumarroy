from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.twiml.messaging_response import MessagingResponse
import pandas as pd
from sqlalchemy import create_engine

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create SQLAlchemy engine
engine = create_engine("mysql+pymysql://root:1234@localhost/inventory_management")

# Read table into DataFrame (cached for performance)
df = None

def load_inventory_data():
    global df
    try:
        df = pd.read_sql("SELECT * FROM first_table", engine)
        # Ensure no NaN values and lowercase for matching
        df.iloc[:, 0] = df.iloc[:, 0].fillna("").astype(str).str.lower()
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

# Load data on startup
load_inventory_data()

@app.route("/api/inventory", methods=["GET"])
def get_all_inventory():
    """API endpoint to get all inventory data"""
    if df is None or df.empty:
        if not load_inventory_data():
            return jsonify({"error": "Database connection failed"}), 500
    
    try:
        inventory_list = []
        for index, row in df.iterrows():
            inventory_list.append({
                "product_name": row.iloc[0],
                "inventory": row.iloc[1]
            })
        
        return jsonify(inventory_list)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/search", methods=["POST"])
def search_product():
    """API endpoint to search for a specific product"""
    if df is None or df.empty:
        if not load_inventory_data():
            return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.get_json()
        product_name = data.get("product_name", "").strip().lower()
        
        if not product_name:
            return jsonify({"error": "Product name is required"}), 400
        
        # Search for match in Column A (first column)
        matched_row = df[df.iloc[:, 0] == product_name]
        
        if not matched_row.empty:
            result = matched_row.iloc[0, 1]  # Get value from Column B
            return jsonify({
                "found": True,
                "product_name": product_name,
                "inventory": result
            })
        else:
            return jsonify({
                "found": False,
                "product_name": product_name,
                "message": "Product not found"
            })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/refresh", methods=["POST"])
def refresh_inventory():
    """API endpoint to refresh inventory data from database"""
    if load_inventory_data():
        return jsonify({"message": "Inventory data refreshed successfully"})
    else:
        return jsonify({"error": "Failed to refresh inventory data"}), 500

# Original WhatsApp endpoint (unchanged)
@app.route("/demo-reply", methods=["POST"])
def reply():
    if df is None or df.empty:
        load_inventory_data()
    
    incoming_msg = request.form.get("Body", "").strip().lower()
    print("Received:", incoming_msg)

    resp = MessagingResponse()

    # Search for match in Column A (first column)
    matched_row = df[df.iloc[:, 0] == incoming_msg]

    if not matched_row.empty:
        result = matched_row.iloc[0, 1]  # Get value from Column B
        reply_msg = f"✅ Inventory for '{incoming_msg}': {result}"
    else:
        reply_msg = "❌ Product not found. Please try another product code."

    resp.message(reply_msg)
    return str(resp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)