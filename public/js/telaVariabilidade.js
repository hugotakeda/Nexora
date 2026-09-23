import { api } from './api.js';
import { escapar } from './formato.js';

/**
 * Tela "Linha de produto" — exemplo de como a variabilidade foi planejada.
 *
 * Mostra os quatro produtos derivados do núcleo NEXORA, quais telas cada um
 * entrega e permite ligar/desligar features opcionais. A escolha é gravada no
 * banco e o menu do sistema muda na hora: é a variabilidade resolvida em
 * tempo de execução, não em tempo de compilação.
 */
export function telaVariabilidade(conteudo, aoMudar) {
  conteudo.innerHTML = '<div class="vazio">Carregando a configuração do produto…</div>';

  async function desenhar() {
    const v = await api.variabilidade();
    const telas = v.telasPorFeature;

    conteudo.innerHTML = `
      <header class="topo">
        <div>
          <h1>Linha de produto</h1>
          <p class="sub">O NEXORA é uma linha de produtos: um núcleo comum e pontos de variação por cliente.</p>
        </div>
      </header>

      <div id="area-aviso" aria-live="polite"></div>

      <section class="painel">
        <div class="painel-cabecalho">
          <h2>Produto contratado</h2>
          <span class="responsavel">Trocar o produto redefine as telas liberadas</span>
        </div>
        <div class="painel-corpo">
          <div class="produtos">
            ${Object.entries(v.produtos).map(([sigla, p]) => `
              <button class="produto" data-linha="${sigla}" aria-pressed="${sigla === v.linhaAtual}">
                <b>${escapar(p.nome)}</b>
                <span>${escapar(p.publico)}</span>
                <span class="telas">${p.opcionais.length
                  ? `Núcleo + ${p.opcionais.map((f) => escapar(telas[f] ?? f)).join(', ')}`
                  : 'Somente o núcleo'}</span>
              </button>`).join('')}
          </div>
        </div>
      </section>

      <section class="painel">
        <div class="painel-cabecalho">
          <h2>Núcleo obrigatório</h2>
          <span class="responsavel">Presente em todos os produtos</span>
        </div>
        <div class="painel-corpo">
          <div class="lista-features">
            ${v.obrigatorias.map((f) => `
              <div class="feature">
                <div><b>${escapar(telas[f] ?? f)}</b><span>feature <code>${escapar(f)}</code></span></div>
                <span class="etiqueta ok">sempre ativa</span>
              </div>`).join('')}
          </div>
        </div>
      </section>

      <section class="painel">
        <div class="painel-cabecalho">
          <h2>Pontos de variação</h2>
          <span class="responsavel">Ajuste fino por empresa</span>
        </div>
        <div class="painel-corpo">
          <div class="lista-features">
            ${v.opcionais.map((f) => `
              <div class="feature">
                <div><b>${escapar(telas[f] ?? f)}</b><span>feature <code>${escapar(f)}</code></span></div>
                <label class="caixa-check">
                  <input type="checkbox" data-feature="${escapar(f)}" ${v.ativas.includes(f) ? 'checked' : ''}>
                  ${v.ativas.includes(f) ? 'Habilitada' : 'Desabilitada'}
                </label>
              </div>`).join('')}
          </div>
        </div>
      </section>`;

    const aviso = conteudo.querySelector('#area-aviso');
    const mostrar = (texto, tipo) => {
      aviso.innerHTML = `<div class="aviso ${tipo}">${escapar(texto)}</div>`;
      if (tipo === 'sucesso') setTimeout(() => { aviso.innerHTML = ''; }, 3500);
    };

    conteudo.querySelectorAll('[data-linha]').forEach((botao) => {
      botao.addEventListener('click', async () => {
        try {
          await api.trocarLinha(botao.dataset.linha);
          mostrar(`Produto alterado para ${v.produtos[botao.dataset.linha].nome}. O menu foi atualizado.`, 'sucesso');
          await aoMudar();
          await desenhar();
        } catch (e) { mostrar(e.message, 'erro'); }
      });
    });

    conteudo.querySelectorAll('[data-feature]').forEach((caixa) => {
      caixa.addEventListener('change', async () => {
        try {
          await api.definirFeature(caixa.dataset.feature, caixa.checked);
          mostrar(`Feature "${caixa.dataset.feature}" ${caixa.checked ? 'habilitada' : 'desabilitada'}.`, 'sucesso');
          await aoMudar();
          await desenhar();
        } catch (e) {
          caixa.checked = !caixa.checked;
          mostrar(e.message, 'erro');
        }
      });
    });
  }

  desenhar();
}
