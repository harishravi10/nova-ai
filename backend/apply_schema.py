import os
import sys
from dotenv import load_dotenv

load_dotenv()

def apply_sql():
    sql_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if not os.path.exists(sql_path):
        print(f"Error: Could not find schema.sql at {sql_path}")
        sys.exit(1)

    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    db_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
    if len(sys.argv) > 1 and sys.argv[1].startswith("postgres"):
        db_url = sys.argv[1]

    if not db_url:
        print("=" * 70)
        print("NOVA AI - Supabase Database Schema")
        print("=" * 70)
        print("schema.sql is ready (210 lines, ~10KB).")
        print("\nTo apply this schema:")
        print("OPTION 1 (Recommended):")
        print("1. Go to your Supabase Project Dashboard -> SQL Editor")
        print("2. Create a 'New query'")
        print("3. Copy and paste the entire contents of backend/schema.sql")
        print("4. Click 'Run'")
        print("\nOPTION 2 (Direct connection):")
        print("python apply_schema.py postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres")
        print("=" * 70)
        return

    try:
        import psycopg2
        print(f"Connecting to database...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        print("Executing schema.sql...")
        cur.execute(sql_content)
        print("Successfully applied schema.sql to PostgreSQL database!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Failed to apply schema via database connection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_sql()
