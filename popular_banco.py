import sqlite3

exemplos = [
    ("Escolinha de kitesurf", "esporte", "Serviluz", "Praia do Serviluz", "Sábados, 8h–11h", "85999990001", -3.7075, -38.479),
    ("Futsal para jovens", "esporte", "Bom Jardim", "Quadra da associação", "Terças e quintas, 18h", "85999990002", -3.785, -38.61),
    ("Curso de informática básica", "educacao", "Mondubim", "Centro Comunitário da Vila", "Sábados, 14h–16h", "85999990003", -3.8, -38.58),
    ("Plantão pedagógico", "educacao", "Jangurussu", "Biblioteca comunitária", "Segundas a quartas, 14h", "85999990004", -3.81, -38.51),
    ("Reforço escolar", "educacao", "Pirambu", "Igreja São Pedro (salão)", "Quartas, 15h–17h", "85999990005", -3.708, -38.555),
    ("Atendimento a famílias", "social", "Barra do Ceará", "Associação de moradores", "Sextas, 9h–12h", "85999990006", -3.697, -38.585),
    ("Oficina de preservação da praia", "sustentabilidade", "Praia do Futuro", "Barraca de apoio, Praia do Futuro", "Domingos, 7h–9h", "85999990007", -3.743, -38.457),
    ("Horta comunitária", "sustentabilidade", "Messejana", "Terreno da associação", "Sábados, 7h–10h", "85999990008", -3.83, -38.485),
]

conn = sqlite3.connect("conecta.db")
total = conn.execute("SELECT COUNT(*) FROM atividade").fetchone()[0]

if total == 0:
    conn.executemany(
        """INSERT INTO atividade
           (nome, categoria, bairro, local, horario, whatsapp, lat, lon)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        exemplos,
    )
    conn.commit()
    print("Atividades de exemplo adicionadas!")
else:
    print("O banco já tem atividades. Nada foi adicionado.")

conn.close()