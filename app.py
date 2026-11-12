from flask import Flask, request, jsonify, send_from_directory, abort
import sqlite3

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # limite de 5 MB por pedido

CATEGORIAS = ["esporte", "educacao", "social", "sustentabilidade"]
OBRIGATORIOS = ["nome", "categoria", "bairro", "local", "horario", "whatsapp"]


def conectar():
    conn = sqlite3.connect("conecta.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def inicio():
    return send_from_directory(".", "index.html")


@app.route("/api/atividades", methods=["GET"])
def listar():
    conn = conectar()
    linhas = conn.execute(
        """SELECT nome, categoria, bairro, local, horario, whatsapp,
                  lat, lon, foto
           FROM atividade ORDER BY id DESC"""
    ).fetchall()
    conn.close()
    return jsonify([dict(l) for l in linhas])


@app.route("/api/atividades", methods=["POST"])
def cadastrar():
    d = request.get_json(silent=True) or {}

    for campo in OBRIGATORIOS:
        if not str(d.get(campo, "")).strip():
            return jsonify({"erro": "Preencha o campo: " + campo}), 400

    if d["categoria"] not in CATEGORIAS:
        return jsonify({"erro": "Categoria inválida"}), 400

    lat, lon, foto = d.get("lat"), d.get("lon"), d.get("foto")
    for numero in (lat, lon):
        if numero is not None and (
            isinstance(numero, bool) or not isinstance(numero, (int, float))
        ):
            return jsonify({"erro": "Localização inválida"}), 400
    if foto is not None and not str(foto).startswith("data:image/"):
        return jsonify({"erro": "Foto inválida"}), 400

    conn = conectar()
    conn.execute(
        """INSERT INTO atividade
           (nome, categoria, bairro, local, horario, whatsapp, lat, lon, foto)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (d["nome"].strip(), d["categoria"], d["bairro"].strip(),
         d["local"].strip(), d["horario"].strip(), str(d["whatsapp"]),
         lat, lon, foto),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True}), 201


# Entrega só os arquivos do site (nunca o banco nem o código Python)
@app.route("/<path:arquivo>")
def arquivos(arquivo):
    if arquivo.endswith((".html", ".css", ".js", ".png", ".svg", ".json")):
        return send_from_directory(".", arquivo)
    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)