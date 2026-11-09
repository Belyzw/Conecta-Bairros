import sqlite3

conn = sqlite3.connect("conecta.db")
conn.execute("PRAGMA foreign_keys = ON")

conn.executescript("""
CREATE TABLE IF NOT EXISTS instituicao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    contato TEXT
);

CREATE TABLE IF NOT EXISTS atividade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    bairro TEXT NOT NULL,
    categoria TEXT,
    data_hora TEXT,
    local TEXT,
    id_instituicao INTEGER,
    FOREIGN KEY (id_instituicao) REFERENCES instituicao(id)
);

CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);
""")

conn.commit()
conn.close()
print("Banco criado com sucesso!")
