import sqlite3

conn = sqlite3.connect("conecta.db")
conn.execute("PRAGMA foreign_keys = ON")

# Cadastrar uma instituição
cur = conn.execute(
    "INSERT INTO instituicao (nome, contato) VALUES (?, ?)",
    ("Associação Esporte Vivo", "contato@exemplo.com"),
)
id_inst = cur.lastrowid

# Cadastrar uma atividade dessa instituição
conn.execute(
    """INSERT INTO atividade
       (titulo, descricao, bairro, categoria, data_hora, local, id_instituicao)
       VALUES (?, ?, ?, ?, ?, ?, ?)""",
    ("Aula de futsal", "Aulas gratuitas para jovens", "Meireles",
     "Esporte", "2026-11-20 18:00", "Quadra do bairro", id_inst),
)
conn.commit()

# Buscar atividades por bairro
bairro = "Meireles"
for linha in conn.execute(
    "SELECT titulo, categoria, data_hora FROM atividade WHERE bairro = ?",
    (bairro,),
):
    print(linha)

conn.close()
