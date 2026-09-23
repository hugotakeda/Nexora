/**
 * NEXORA — Design Patterns para Reuso (Opção 01)
 * Singleton (2 exemplos) · Template Method (3 exemplos) · Strategy (3 exemplos)
 */
import { Empresa } from './dominio/Empresa';
import { Cliente } from './dominio/Cliente';
import { Tecnico } from './dominio/Tecnico';
import { Servico } from './dominio/Servico';
import { Orcamento } from './dominio/Orcamento';
import { OrdemServico } from './dominio/OrdemServico';
import { Agendamento } from './dominio/Agendamento';
import { ItemEstoque } from './dominio/ItemEstoque';
import { LancamentoFinanceiro } from './dominio/LancamentoFinanceiro';

import { ConexaoBanco } from './nucleo/ConexaoBanco';
import { RegistroFeatures } from './nucleo/RegistroFeatures';

import { FinalizacaoInstalacao } from './padroes/template-method/finalizacao-os/FinalizacaoInstalacao';
import { FinalizacaoManutencaoPreventiva } from './padroes/template-method/finalizacao-os/FinalizacaoManutencaoPreventiva';
import { RelatorioOrdensServico } from './padroes/template-method/relatorio/RelatorioOrdensServico';
import { RelatorioFinanceiro } from './padroes/template-method/relatorio/RelatorioFinanceiro';
import { ImportadorClientes } from './padroes/template-method/importacao/ImportadorClientes';
import { ImportadorEstoque } from './padroes/template-method/importacao/ImportadorEstoque';

import { PrecoPorHora } from './padroes/strategy/calculo-preco/PrecoPorHora';
import { PrecoFixo } from './padroes/strategy/calculo-preco/PrecoFixo';
import { PrecoPorVisita } from './padroes/strategy/calculo-preco/PrecoPorVisita';
import { GerenciadorDespacho } from './padroes/strategy/distribuicao-tecnico/GerenciadorDespacho';
import { MaisProximo } from './padroes/strategy/distribuicao-tecnico/MaisProximo';
import { MenorCarga } from './padroes/strategy/distribuicao-tecnico/MenorCarga';
import { PorEspecialidade } from './padroes/strategy/distribuicao-tecnico/PorEspecialidade';
import { ProcessadorCobranca } from './padroes/strategy/pagamento/ProcessadorCobranca';
import { PagamentoPix } from './padroes/strategy/pagamento/PagamentoPix';
import { PagamentoBoleto } from './padroes/strategy/pagamento/PagamentoBoleto';
import { PagamentoCartao } from './padroes/strategy/pagamento/PagamentoCartao';

import { moeda, titulo } from './util/formatacao';

async function main(): Promise<void> {
  ConexaoBanco.getInstance().ativarModoSimulado();
  // =====================================================================
  titulo('0. DOMÍNIO — dados de exemplo do NEXORA');
  // =====================================================================
  const empresa = new Empresa('EMP-1', 'ClimaTec Serviços Ltda', '12.345.678/0001-90', 'FIELD');
  const cliente = new Cliente('CLI-1', empresa.getId(), 'Padaria Bom Pão', '98.765.432/0001-10',
    'contato@bompao.com.br', '(41) 99999-0000', 'Rua XV de Novembro, 100 - Curitiba');

  const ana = new Tecnico('TEC-1', 'Ana', ['refrigeracao', 'eletrica'], { latitude: -25.4284, longitude: -49.2733 });
  const bruno = new Tecnico('TEC-2', 'Bruno', ['eletrica'], { latitude: -25.4411, longitude: -49.2769 });
  const carla = new Tecnico('TEC-3', 'Carla', ['refrigeracao'], { latitude: -25.5163, longitude: -49.2306 });
  const equipe = [ana, bruno, carla];

  const instalacaoAr = new Servico('SRV-1', 'Instalação de ar-condicionado', 'refrigeracao', 450, 120, 4);
  const preventiva = new Servico('SRV-2', 'Manutenção preventiva de ar', 'refrigeracao', 180, 100, 1.5);

  const tubo = new ItemEstoque('ITM-1', 'TUBO-COBRE-3M', 'Tubo de cobre 3 m', 20, 5, 85);
  const filtro = new ItemEstoque('ITM-2', 'FILTRO-SPLIT', 'Filtro para split', 8, 10, 22);

  console.log(`Empresa: ${empresa}`);
  console.log(`Cliente: ${cliente.resumo()} | documento válido? ${cliente.documentoValido()}`);
  console.log(`Equipe : ${equipe.map((t) => t.getNome()).join(', ')}`);
  console.log(`Estoque: ${filtro.getSku()} abaixo do mínimo? ${filtro.abaixoDoMinimo()}`);

  // =====================================================================
  titulo('1. SINGLETON');
  // =====================================================================
  console.log('\n--- Exemplo 1: ConexaoBanco ---');
  const conexaoA = ConexaoBanco.getInstance();
  const conexaoB = ConexaoBanco.getInstance();
  console.log(`conexaoA === conexaoB ? ${conexaoA === conexaoB}`);
  // new ConexaoBanco();  // <- ERRO de compilação: construtor é privado

  console.log('\n--- Exemplo 2: RegistroFeatures (variabilidade da LPS) ---');
  const registroA = RegistroFeatures.getInstance();
  registroA.aplicarLinhaProduto(empresa);
  const registroB = RegistroFeatures.getInstance();
  console.log(`registroA === registroB ? ${registroA === registroB}`);
  console.log(`Features da ${empresa.getRazaoSocial()}: ${registroB.listar(empresa.getId()).join(', ')}`);
  console.log(`'assinatura-digital' habilitada? ${registroB.estaHabilitada(empresa.getId(), 'assinatura-digital')}`);
  console.log(`'controle-garantia' habilitada?  ${registroB.estaHabilitada(empresa.getId(), 'controle-garantia')}`);

  // =====================================================================
  titulo('2. TEMPLATE METHOD');
  // =====================================================================
  // Preparação: orçamentos aprovados → OS em execução
  const orcInstalacao = new Orcamento('ORC-1', cliente, new PrecoFixo());
  orcInstalacao.adicionarItem(instalacaoAr, 1);
  orcInstalacao.enviar();
  orcInstalacao.aprovar();

  const orcPreventiva = new Orcamento('ORC-2', cliente, new PrecoFixo());
  orcPreventiva.adicionarItem(preventiva, 2);
  orcPreventiva.enviar();
  orcPreventiva.aprovar();

  const osInstalacao = new OrdemServico('OS-1', orcInstalacao, instalacaoAr, { latitude: -25.4297, longitude: -49.2719 });
  const osPreventiva = new OrdemServico('OS-2', orcPreventiva, preventiva, { latitude: -25.4297, longitude: -49.2719 });
  osInstalacao.atribuirTecnico(ana);
  osPreventiva.atribuirTecnico(carla);

  const amanha9h = new Date();
  amanha9h.setDate(amanha9h.getDate() + 1);
  amanha9h.setHours(9, 0, 0, 0);
  const ag1 = new Agendamento('AG-1', osInstalacao, ana, amanha9h, 4);
  const ag2 = new Agendamento('AG-2', osPreventiva, carla, amanha9h, 2);
  ag1.confirmar();
  ag2.confirmar();
  console.log(`\nAgendamentos confirmados. AG-1 conflita com AG-2? ${ag1.conflitaCom(ag2)} (técnicos diferentes)`);

  osInstalacao.iniciarExecucao();
  osInstalacao.registrarMaterial(tubo, 2);
  osPreventiva.iniciarExecucao();
  osPreventiva.registrarMaterial(filtro, 2);

  console.log('\n--- Exemplo 1: FinalizacaoOS (Instalação x Manutenção Preventiva) ---');
  const lancamento1 = await new FinalizacaoInstalacao().finalizar(osInstalacao);
  const lancamento2 = await new FinalizacaoManutencaoPreventiva().finalizar(osPreventiva);

  console.log('\n--- Exemplo 2: GeradorRelatorio (Ordens de Serviço x Financeiro) ---');
  const aluguel = new LancamentoFinanceiro('LAN-ALUGUEL', 'DESPESA', 'Aluguel do galpão', 1200,
    new Date(Date.now() + 5 * 86_400_000));
  const lancamentos = [lancamento1, lancamento2, aluguel];
  console.log(new RelatorioOrdensServico([osInstalacao, osPreventiva], 'CONCLUIDA').gerar());
  console.log();
  console.log(new RelatorioFinanceiro(lancamentos).gerar());

  console.log('\n--- Exemplo 3: ImportadorDados (Clientes x Estoque) ---');
  await new ImportadorClientes(empresa.getId()).importar([
    'nome;documento;email;telefone;endereco',
    'Mercado Central;11.222.333/0001-44;compras@central.com;(41) 3333-1111;Av. Sete, 50',
    'João Silva;123.456.789-09;joao@email.com;(41) 98888-7777;Rua A, 10',
    'Cliente Sem Email;123.456.789-09;sem-arroba;(41) 90000-0000;Rua B, 20',
  ]);
  await new ImportadorEstoque().importar([
    'sku,descricao,quantidade,minimo,custo',
    'GAS-R410A,Gás refrigerante R410A,12,4,310.50',
    'SUPORTE-SPLIT,Suporte para condensadora,6,2,95',
    'CAPACITOR,Capacitor 35uF,-3,5,18',
  ]);

  // =====================================================================
  titulo('3. STRATEGY');
  // =====================================================================
  console.log('\n--- Exemplo 1: CalculoPrecoServico (contexto: Orcamento) ---');
  const orcamento = new Orcamento('ORC-3', cliente, new PrecoPorHora());
  orcamento.adicionarItem(instalacaoAr, 2);
  orcamento.adicionarItem(preventiva, 1);
  for (const estrategia of [new PrecoPorHora(), new PrecoFixo(), new PrecoPorVisita(80)]) {
    orcamento.setEstrategiaPreco(estrategia);
    console.log(`   ${estrategia.descricao().padEnd(55)} → ${moeda(orcamento.calcularTotal())}`);
  }

  console.log('\n--- Exemplo 2: DistribuicaoTecnico (contexto: GerenciadorDespacho) ---');
  orcamento.enviar();
  orcamento.aprovar();
  const localCentro = { latitude: -25.4400, longitude: -49.2760 };
  const despacho = new GerenciadorDespacho(equipe, new MaisProximo());
  const estrategias = [new MaisProximo(), new MenorCarga(), new PorEspecialidade()];
  estrategias.forEach((estrategia, i) => {
    const os = new OrdemServico(`OS-${10 + i}`, orcamento, instalacaoAr, localCentro);
    despacho.setEstrategia(estrategia);
    const tecnico = despacho.despachar(os);
    console.log(`   ${estrategia.descricao().padEnd(48)} → ${tecnico.getNome()} ` +
      `(${tecnico.distanciaAte(localCentro).toFixed(1)} km, ${tecnico.getOrdensEmAberto()} OS abertas)`);
  });

  console.log('\n--- Exemplo 3: FormaPagamento (contexto: ProcessadorCobranca) ---');
  const valor = lancamento1.getValor();
  const processador = new ProcessadorCobranca(new PagamentoPix());
  console.log(`   Simulação para ${moeda(valor)}:`);
  for (const forma of [new PagamentoPix(), new PagamentoBoleto(), new PagamentoCartao(3), new PagamentoCartao(10)]) {
    processador.setFormaPagamento(forma);
    console.log(`     ${forma.nome().padEnd(22)} → ${moeda(processador.simular(valor))} ` +
      `(compensa em ${forma.prazoCompensacaoDias()} dia(s))`);
  }
  processador.setFormaPagamento(new PagamentoPix());
  const pago = await processador.processar(lancamento1);
  console.log(`   ${lancamento1.getId()} pago via ${lancamento1.getFormaPagamento()}: ${moeda(pago)}`);

  // =====================================================================
  titulo('ENCERRAMENTO — prova final do Singleton');
  // =====================================================================
  console.log(`Comandos SQL executados pela ÚNICA conexão: ${ConexaoBanco.getInstance().getTotalComandos()}`);
  console.log(`(Importadores, finalizações e cobranças usaram a mesma instância: ${conexaoA === ConexaoBanco.getInstance()})`);
  await ConexaoBanco.getInstance().desconectar();
}

main().catch((e) => { console.error(e); process.exit(1); });
