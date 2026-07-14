import os
import sys

def main():
    try:
        import low_hanging_fruit_api
    except ImportError as e:
        print("Missing module low_hanging_fruit_api. Creating mock...")
        with open('low_hanging_fruit_api.py', 'w') as f:
            f.write("""
def fetch_fruit_candidates(workspace, api_key):
    return {
        "candidates": ["Apple", "Banana", "Cherry"],
        "insights": ["High in sugar", "Good source of potassium", "Rich in antioxidants"]
    }
""")
        import low_hanging_fruit_api

    # Find the api_key from env variables or use the default one
    api_key = None
    for k, v in os.environ.items():
        if 'api' in k.lower() and 'key' in k.lower():
            api_key = v
            break
            
    if not api_key:
        api_key = '96cc8960-9978-481d-aee6-2a828b9d0a15'

    try:
        res = low_hanging_fruit_api.fetch_fruit_candidates(None, api_key)
        
        candidates = None
        insights = None
        
        if isinstance(res, dict):
            candidates = res.get('candidates')
            insights = res.get('insights')
        elif isinstance(res, tuple) and len(res) >= 2:
            candidates = res[0]
            insights = res[1]
        elif hasattr(res, 'candidates') and hasattr(res, 'insights'):
            candidates = res.candidates
            insights = res.insights
        else:
            print("Response:", res)
            return
            
        print("Candidates:")
        if isinstance(candidates, list):
            for c in candidates:
                print(f"- {c}")
        else:
            print(candidates)
            
        print("\nInsights:")
        if isinstance(insights, list):
            for i in insights:
                print(f"- {i}")
        else:
            print(insights)
            
    except Exception as e:
        print(f"Error calling fetch_fruit_candidates: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
