import { api } from './api.js';
import { escapar, paraTexto, paraInput, corDoStatus } from './formato.js';

/**
 * CORE ASSET do front-end: monta uma tela CRUD completa a partir dos
 * metadados de um módulo. As oito telas do projeto usam este mesmo código;
 * o que muda entre elas é apenas a descrição declarada em src/modulos/.
 */
export function telaCrud(modulo, conteudo) {
  let editandoId = null;
  let busca = '';
  const rotulosReferencia = {}; // { campo: { id: rótulo } }

  const camposEditaveis = modulo.campos.filter((c) => !c.somenteLeitura);
  const camposListados = modulo.campos.filter((c) => c.listar);

  conteudo.innerHTML = `
    <header class="topo">
      <div>
        <h1>${escapar(modulo.titulo)}</h1>
        <p class="sub">${escapar(modulo.subtitulo)}</p>
      </div>
      <form class="busca" id="form-busca">
        <input type="search" id="campo-busca" placeholder="Buscar em ${escapar(modulo.titulo.toLowerCase())}"
               aria-label="Buscar ${escapar(modulo.titulo)}">
        <button class="secundario" type="submit">Buscar</button>
      </form>
    </header>

    <div id="area-aviso" aria-live="polite"></div>

    <section class="painel">
      <div class="painel-cabecalho">
        <h2 id="titulo-form">Novo registro</h2>
        <span class="responsavel">Tela de ${escapar(modulo.responsavel)}</span>
      </div>
      <div class="painel-corpo">
        <form id="form-registro">
          <div class="grade">${camposEditaveis.map(montarCampo).join('')}</div>
          <div class="acoes-form">
            <button class="primario" type="submit" id="btn-salvar">Cadastrar</button>
            <button class="secundario" type="button" id="btn-cancelar" hidden>Cancelar edição</button>
          </div>
        </form>
      </div>
    </section>

    <section class="painel">
      <div class="painel-cabecalho">
        <h2>Registros cadastrados</h2>
        <span class="contagem" id="contagem"></span>
      </div>
      <div id="area-lista"><div class="vazio">Carregando…</div></div>
    </section>`;

  const form = conteudo.querySelector('#form-registro');
  const areaAviso = conteudo.querySelector('#area-aviso');
  const areaLista = conteudo.querySelector('#area-lista');

  function montarCampo(campo) {
    const id = `campo-${campo.nome}`;
    const obrigatorio = campo.obrigatorio ? 'required' : '';
    const ajuda = campo.ajuda ? `<span class="ajuda">${escapar(campo.ajuda)}</span>` : '';
    let controle;

    switch (campo.tipo) {
      case 'selecao':
        controle = `<select id="${id}" ${obrigatorio}>
            <option value="">Selecione…</option>
            ${(campo.opcoes || []).map((o) => `<option value="${escapar(o)}">${escapar(o.replace(/_/g, ' ').toLowerCase())}</option>`).join('')}
          </select>`;
        break;
      case 'referencia':
        controle = `<select id="${id}" data-referencia="${escapar(campo.referencia.modulo)}"
            data-rotulo="${escapar(campo.referencia.rotulo)}" ${obrigatorio}>
            <option value="">Carregando…</option></select>`;
        break;
      case 'booleano':
        return `<div class="campo caixa-check">
            <input type="checkbox" id="${id}"><label for="${id}">${escapar(campo.rotulo)}</label>${ajuda}
          </div>`;
      case 'textolongo':
        controle = `<textarea id="${id}" ${obrigatorio} placeholder="${escapar(campo.placeholder || '')}"></textarea>`;
        break;
      default: {
        const tipoHtml = { email: 'email', numero: 'number', moeda: 'number', data: 'date', datahora: 'datetime-local', telefone: 'tel' }[campo.tipo] || 'text';
        const passo = campo.tipo === 'moeda' ? 'step="0.01"' : campo.tipo === 'numero' ? 'step="any"' : '';
        controle = `<input type="${tipoHtml}" id="${id}" ${passo} ${obrigatorio} placeholder="${escapar(campo.placeholder || '')}">`;
      }
    }
    return `<div class="campo ${campo.largo ? 'largo' : ''}">
        <label for="${id}">${escapar(campo.rotulo)}</label>${controle}${ajuda}
      </div>`;
  }

  function avisar(texto, tipo) {
    areaAviso.innerHTML = `<div class="aviso ${tipo}">${escapar(texto)}</div>`;
    if (tipo === 'sucesso') setTimeout(() => { areaAviso.innerHTML = ''; }, 3500);
  }

  /** Preenche os <select> dos campos que apontam para outras telas. */
  async function carregarReferencias() {
    for (const campo of camposEditaveis.filter((c) => c.tipo === 'referencia')) {
      const select = conteudo.querySelector(`#campo-${campo.nome}`);
      try {
        const opcoes = await api.opcoes(campo.referencia.modulo, campo.referencia.rotulo);
        rotulosReferencia[campo.nome] = Object.fromEntries(opcoes.map((o) => [o.id, o.rotulo]));
        select.innerHTML = `<option value="">Selecione…</option>` +
          opcoes.map((o) => `<option value="${escapar(o.id)}">${escapar(o.rotulo)}</option>`).join('');
      } catch {
        select.innerHTML = '<option value="">Indisponível</option>';
      }
    }
  }

  function celula(campo, registro) {
    const texto = escapar(paraTexto(campo, registro[campo.nome], rotulosReferencia));
    if (campo.tipo === 'selecao' && /status|situacao|tipo/.test(campo.nome)) {
      return `<span class="etiqueta ${corDoStatus(registro[campo.nome])}">${texto}</span>`;
    }
    if (modulo.id === 'estoque' && campo.nome === 'quantidade'
        && Number(registro.quantidade) < Number(registro.estoque_minimo)) {
      return `<span class="etiqueta erro">${texto} · abaixo do mínimo</span>`;
    }
    return texto;
  }

  async function carregarLista() {
    try {
      const registros = await api.listar(modulo.id, busca);
      conteudo.querySelector('#contagem').textContent =
        `${registros.length} ${registros.length === 1 ? 'registro' : 'registros'}`;
      if (registros.length === 0) {
        areaLista.innerHTML = busca
          ? '<div class="vazio"><b>Nada encontrado</b>Ajuste a busca ou cadastre um registro novo.</div>'
          : '<div class="vazio"><b>Nenhum registro cadastrado</b>Use o formulário acima para cadastrar o primeiro.</div>';
        return;
      }
      const alinhamento = (c) => (['moeda', 'numero'].includes(c.tipo) ? ' class="numero"' : '');
      areaLista.innerHTML = `<table>
        <thead><tr>${camposListados.map((c) => `<th${alinhamento(c)}>${escapar(c.rotulo)}</th>`).join('')}<th></th></tr></thead>
        <tbody>${registros.map((r) => `
          <tr>
            ${camposListados.map((c) => `<td${alinhamento(c)}>${celula(c, r)}</td>`).join('')}
            <td><div class="linha-acoes">
              <button class="secundario" data-editar="${escapar(r.id)}">Editar</button>
              <button class="perigo" data-excluir="${escapar(r.id)}">Excluir</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>`;
    } catch (e) {
      areaLista.innerHTML = `<div class="vazio"><b>Não foi possível carregar a lista</b>${escapar(e.message)}</div>`;
    }
  }

  function lerFormulario() {
    const dados = {};
    for (const campo of camposEditaveis) {
      const elemento = conteudo.querySelector(`#campo-${campo.nome}`);
      dados[campo.nome] = campo.tipo === 'booleano' ? elemento.checked : elemento.value;
    }
    return dados;
  }

  function preencherFormulario(registro) {
    for (const campo of camposEditaveis) {
      const elemento = conteudo.querySelector(`#campo-${campo.nome}`);
      if (campo.tipo === 'booleano') elemento.checked = Number(registro[campo.nome]) === 1;
      else elemento.value = paraInput(campo, registro[campo.nome]);
    }
    editandoId = registro.id;
    conteudo.querySelector('#titulo-form').textContent = `Editando ${registro.id}`;
    conteudo.querySelector('#btn-salvar').textContent = 'Salvar alterações';
    conteudo.querySelector('#btn-cancelar').hidden = false;
    conteudo.querySelector(`#campo-${camposEditaveis[0].nome}`).focus();
  }

  function limparFormulario() {
    form.reset();
    editandoId = null;
    conteudo.querySelector('#titulo-form').textContent = 'Novo registro';
    conteudo.querySelector('#btn-salvar').textContent = 'Cadastrar';
    conteudo.querySelector('#btn-cancelar').hidden = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const dados = lerFormulario();
      if (editandoId) await api.atualizar(modulo.id, editandoId, dados);
      else await api.criar(modulo.id, dados);
      avisar(editandoId ? 'Registro atualizado.' : 'Registro cadastrado.', 'sucesso');
      limparFormulario();
      carregarLista();
    } catch (erro) {
      avisar(erro.message, 'erro');
    }
  });

  conteudo.querySelector('#btn-cancelar').addEventListener('click', limparFormulario);

  conteudo.querySelector('#form-busca').addEventListener('submit', (e) => {
    e.preventDefault();
    busca = conteudo.querySelector('#campo-busca').value.trim();
    carregarLista();
  });

  areaLista.addEventListener('click', async (e) => {
    const editar = e.target.closest('[data-editar]');
    const excluir = e.target.closest('[data-excluir]');
    try {
      if (editar) {
        preencherFormulario(await api.buscar(modulo.id, editar.dataset.editar));
      } else if (excluir) {
        if (!confirm(`Excluir o registro ${excluir.dataset.excluir}? Essa ação não pode ser desfeita.`)) return;
        await api.excluir(modulo.id, excluir.dataset.excluir);
        if (editandoId === excluir.dataset.excluir) limparFormulario();
        avisar('Registro excluído.', 'sucesso');
        carregarLista();
      }
    } catch (erro) {
      avisar(erro.message, 'erro');
    }
  });

  carregarReferencias().then(carregarLista);
}
