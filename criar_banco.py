import sqlite3

conn = sqlite3.connect("conecta.db")

conn.executescript("""
CREATE TABLE IF NOT EXISTS atividade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    bairro TEXT NOT NULL,
    local TEXT NOT NULL,
    horario TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    lat REAL,
    lon REAL,
    foto TEXT
);
""")

conn.commit()
conn.close()
print("Banco criado com sucesso!")