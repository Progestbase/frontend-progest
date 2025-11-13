import functionsEstoque from "@/functions/cad_estoque";
import functionsMovimentacao from "@/functions/cad_movimentacao";
import functionsEntrada from "@/functions/cad_entradas";
import functionsUsuarioSetor from "@/functions/cad_usuario_setor";
import functionsSetor from "@/functions/cad_setores";
import { setorCookie } from "@/utils/setorCookie";

/**
 * Carrega dados do setor atual para o Vuex assim que a aplicação inicia
 * quando o usuário estiver logado e existir um setor selecionado nos cookies.
 *
 * @param {Object} options
 * @param {import('axios').AxiosInstance} options.axios
 * @param {import('vuex').Store} options.store
 */
export async function initSetorContext({ axios, store }) {
  try {
    const token = store.getters.getUserToken;
    const hasSector = setorCookie.hasSector();
    if (!token || !hasSector) return;

    const setorId = setorCookie.getSectorId();
    if (!setorId) return;

    // Se setorDetails já foi carregado e bate com o cookie, não recarrega detalhes
    if (!store.state.setorDetails || store.state.setorDetails.id != setorId) {
      try {
        await functionsSetor.getSetorDetail(
          { $axios: axios, $store: store },
          setorId
        );
      } catch (e) {
        console.warn(
          "initSetorContext: falha ao carregar detalhes do setor",
          e
        );
      }
    }

    // Contexto genérico esperado pelas funções cad_*.js
    const context = {
      $axios: axios,
      $store: store,
      $toastr: undefined,
      // refs opcionais não utilizados aqui
    };

    // Carregar em paralelo onde possível
    await Promise.all([
      functionsEstoque.listAll(context).catch((e) => {
        console.warn("Erro ao carregar estoque no init:", e);
      }),
      functionsMovimentacao.listAll(context).catch((e) => {
        console.warn("Erro ao carregar movimentações no init:", e);
      }),
      functionsEntrada.listAll(context).catch((e) => {
        console.warn("Erro ao carregar entradas no init:", e);
      }),
      // usuários do setor pode depender de getSetorDetail; executar depois em série caso o detalhe tenha sido carregado agora
    ]);

    // Carregar usuários do setor (rodar em seguida para garantir setor_id)
    try {
      if (functionsUsuarioSetor && functionsUsuarioSetor.listAll) {
        await functionsUsuarioSetor.listAll(context);
      }
    } catch (e) {
      console.warn("Erro ao carregar usuários do setor no init:", e);
    }

    console.log("initSetorContext: dados do setor inicializados");
  } catch (error) {
    console.error("initSetorContext: erro inesperado", error);
  }
}
