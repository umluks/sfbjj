document.addEventListener("DOMContentLoaded", function () {
  const menuHTML = `
<nav class="navbar navbar-expand-lg bg-dark border-bottom border-body" id="menu-principal" data-bs-theme="dark">
   <div class="container">
      <a class="navbar-brand" href="index.html">Sagrada Familia BJJ</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01"
         aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
         <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor01">
         <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
               <a class="nav-link" aria-current="page" href="historia.html">Historia</a>
            </li>
            <li class="nav-item">
               <a class="nav-link" aria-current="page" href="registre.html">Registre-se</a>
            </li>
            <li class="nav-item">
               <a class="nav-link" href="alunos.html">Alunos</a>
            </li>
            <li class="nav-item">
               <a class="nav-link" aria-current="page" href="horarios.html">Horários</a>
            </li>
            <li class="nav-item dropdown">
               <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                  aria-expanded="false">
                  Regras
               </a>
               <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="sistema-graduacao.html">Sistema de Graduação</a></li>
                  <li><a class="dropdown-item" href="pontuacao.html">Pontuação</a></li>
                  <li>
                     <hr class="dropdown-divider">
                  </li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
               </ul>
            </li>
         </ul>
         <form class="d-flex" role="search">
            <input class="form-control me-2" type="buscar" placeholder="O que você procura?" aria-label="Buscar">
            <button class="btn btn-outline-light" type="submit">Buscar</button>
         </form>
      </div>
   </div>
</nav>
`;
  document.getElementById("menu-principal").innerHTML = menuHTML;
});
