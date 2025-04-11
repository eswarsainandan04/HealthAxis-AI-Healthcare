import mysql.connector
import pandas as pd

# Step 1: Connect to MySQL (without specifying a database initially)
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password=""
)

cursor = conn.cursor()

# Step 2: Create the database (if it doesn't exist)
cursor.execute("CREATE DATABASE IF NOT EXISTS health")
cursor.execute("USE health")

# Step 3: Create the table with backticks around the column names containing spaces
create_table_query = """
CREATE TABLE IF NOT EXISTS medicine (
    name VARCHAR(255),
    price VARCHAR(255),
    manufacturer_name VARCHAR(255),
    pack_size_label VARCHAR(255),
    short_composition VARCHAR(255),
    substitute0 VARCHAR(255),
    substitute1 VARCHAR(255),
    sideEffect0 VARCHAR(255),
    sideEffect1 VARCHAR(255),
    sideEffect2 VARCHAR(255),
    use0 VARCHAR(255),
    use1 VARCHAR(255),
    `Chemical Class` VARCHAR(255),
    `Therapeutic Class` VARCHAR(255),
    `Action Class` VARCHAR(255),
    type VARCHAR(255)
)
"""
cursor.execute(create_table_query)

# Step 4: Load the dataset using pandas
df = pd.read_csv('medicines.csv')

# Replace NaN values with None (interpreted as NULL in MySQL)
df = df.where(pd.notnull(df), None)

# Step 5: Insert the data into the table
for index, row in df.iterrows():
    insert_query = """
    INSERT INTO medicine (
        name, price, manufacturer_name, pack_size_label, short_composition,
        substitute0, substitute1, sideEffect0, sideEffect1, sideEffect2,
        use0, use1, `Chemical Class`, `Therapeutic Class`, `Action Class`, type
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)
    """
    cursor.execute(insert_query, tuple(row))

# Commit the transaction
conn.commit()

# Step 6: Close the connection
cursor.close()
conn.close()

print("Data inserted successfully into the database!")
