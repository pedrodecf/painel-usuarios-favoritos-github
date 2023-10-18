import { GithubUser } from "./githubuser.js"

export class Favoritos {
  constructor(root) {
    this.root = document.querySelector(root)
    this.carregarDados()
  }

  carregarDados() {
    this.entradas =
      JSON.parse(localStorage.getItem("@github2-favorites:")) || []
  }

  salvar() {
    localStorage.setItem("@github2-favorites:", JSON.stringify(this.entradas))
  }

  async add(username) {
    try {
      const userDuplicado = this.entradas.find(
        (entrada) => entrada.login === username
      )

      if (userDuplicado) {
        throw new Error("Usuário já cadastrado!")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!")
      }

      this.entradas = [user, ...this.entradas]
      this.atualizar()
      this.salvar()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(item) {
    const entradasFiltradas = this.entradas.filter(
      (entrada) => entrada.login !== item.login
    )

    this.entradas = entradasFiltradas
    this.atualizar()
    this.salvar()
  }
}

export class VisualizarFavoritos extends Favoritos {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")
    this.usuarios = []
    this.atualizar()
    this.onadd()
  }

  onadd() {
    const addButon = this.root.querySelector("#search button")
    addButon.onclick = () => {
      const { value } = this.root.querySelector("#search input")

      this.add(value)
    }
  }

  atualizar() {
    this.removerTodasTr()

    this.entradas.forEach((item) => {
      const row = this.criarRow()

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${item.login}.png`
      row.querySelector(
        ".user img"
      ).alt = `Imagem do perfil do Github do usuário '${item.login}'`
      row.querySelector(".user a").href = `https://github.com/${item.login}`
      row.querySelector(".user p").textContent = item.name
      row.querySelector(".user span").textContent = `/${item.login}`
      row.querySelector(".repositories").textContent = item.public_repos
      row.querySelector(".followers").textContent = item.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja remover esse usuário?")
        if (isOk) {
          this.delete(item)
        }
      }

      this.tbody.append(row)
    })

    this.toggleMsgNenhumFavorito()
  }

  criarRow() {
    const trClassUsuario = document.createElement("tr")
    trClassUsuario.classList.add("usuario")

    trClassUsuario.innerHTML = `
            <tr class="usuario">
              <td class="user">
                <img
                  src="https://github.com/pedrodecf.png"
                  alt="Imagem do perfil do Github do usuário 'pedrodecf'"
                />
                <a href="https://github.com/pedrodecf" target="_blank">
                  <p>Pedro de Freitas</p>
                  <span>/pedrodecf</span>
                </a>
              </td>
              <td class="repositories">4</td>
              <td class="followers">1</td>
              <td><button class="remove">Remover</button></td>
            </tr>
      `

    return trClassUsuario
  }

  criarMsgNenhumFavorito() {
    const trClassNenhumFavorito = document.createElement("tr")
    trClassNenhumFavorito.classList.add("nehum-favorito")

    trClassNenhumFavorito.innerHTML = `
            <tr id="favorito">
              <td colspan="4">
                <div class="no-favorite">
                  <img
                    class="star-no-favorites"
                    src="assets/images/no-favorite-star.svg"
                    alt="Uma estrela com um rosto"
                  />
                  <p class="text-no-favorites">Nenhum favorito ainda</p>
                </div>
              </td>
            </tr>
      `

    return trClassNenhumFavorito
  }

  removerTodasTr() {
    this.tbody.innerHTML = ""
  }

  toggleMsgNenhumFavorito() {
    const noFavorite = this.criarMsgNenhumFavorito()
    if (this.tbody.childElementCount === 0) {
      this.tbody.append(noFavorite)
    }
  }
}
