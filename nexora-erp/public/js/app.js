import { api } from './api.js';
import { escapar } from './formato.js';
import { telaCrud } from './telaCrud.js';
import { telaVariabilidade } from './telaVariabilidade.js';

const conteudo = document.getElementById('conteudo');
const menu = document.getElementById('menu');
let modulos = [];

/** Recarrega os metadados: é o que faz o menu refletir a variabilidade. */
async function carregarModulos() {
  modulos = await api.modulos();
  const variabilidade = await api.variabilidade();
  document.getElementById('nome-produto').textContent = variabilidade.produtos[variabilidade.linhaAtual].nome;
  desenharMenu();
}

function desenharMenu() {
  const rotaAtual = location.hash.replace('#/', '') || modulos.find((m) => m.disponivel)?.id;
  menu.innerHTML = modulos.map((m) => m.disponivel
    ? `<a href="#/${m.id}" ${m.id === rotaAtual ? 'aria-current="page"' : ''}>${escapar(m.titulo)}</a>`
    : `<a class="indisponivel" title="Tela não incluída no produto contratado">${escapar(m.titulo)}</a>`).join('');
  const linkVar = document.querySelector('.link-variabilidade');
  if (rotaAtual === 'linha-produto') linkVar.setAttribute('aria-current', 'page');
  else linkVar.removeAttribute('aria-current');
}

function rotear() {
  const rota = location.hash.replace('#/', '') || modulos.find((m) => m.disponivel)?.id;
  desenharMenu();

  if (rota === 'linha-produto') {
    telaVariabilidade(conteudo, carregarModulos);
    return;
  }
  const modulo = modulos.find((m) => m.id === rota);
  if (!modulo) {
    conteudo.innerHTML = '<div class="vazio"><b>Tela não encontrada</b>Escolha um módulo no menu ao lado.</div>';
    return;
  }
  if (!modulo.disponivel) {
    conteudo.innerHTML = `<div class="vazio"><b>${escapar(modulo.titulo)} não faz parte do produto contratado</b>
      Habilite a feature "${escapar(modulo.feature)}" na tela Linha de produto.</div>`;
    return;
  }
  telaCrud(modulo, conteudo);
}

window.addEventListener('hashchange', rotear);

carregarModulos()
  .then(rotear)
  .catch((e) => {
    conteudo.innerHTML = `<div class="vazio"><b>Não foi possível iniciar o sistema</b>${escapar(e.message)}</div>`;
  });
