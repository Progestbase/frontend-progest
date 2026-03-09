/**
 * useFeedbackModal — Composable reativo para controlar o FeedbackModal global.
 *
 * API pública (importável em qualquer lugar):
 *   feedback.success(mensagem, título?)
 *   feedback.error(mensagem, título?)
 *   feedback.warning(mensagem, título?)
 *   feedback.info(mensagem, título?)
 *   feedback.validation(erros, mensagem?, título?)
 *   feedback.close()
 *
 * Exemplo de uso em um arquivo JS (cad_*.js):
 *   import { feedback } from "@/components/ui/feedback-modal/use-feedback-modal";
 *   feedback.success("Usuário cadastrado com sucesso!");
 *   feedback.validation(response.data.erros, "Corrija os campos abaixo:");
 */
import { ref } from "vue";

const state = ref({
    isOpen: false,
    type: "info", // success | error | warning | info | validation
    title: "",
    message: "",
    validationErrors: null, // { campo: ["msg1", ...], ... }
});

function open({ type = "info", title = "", message = "", validationErrors = null }) {
    state.value = {
        isOpen: true,
        type,
        title,
        message,
        validationErrors,
    };
}

function close() {
    state.value.isOpen = false;
}

/**
 * Objeto de API global que pode ser importado diretamente
 * ou injetado como globalProperties.$feedback
 */
const feedback = {
    success(message, title = "") {
        open({ type: "success", title, message });
    },
    error(message, title = "") {
        open({ type: "error", title, message });
    },
    warning(message, title = "") {
        open({ type: "warning", title, message });
    },
    info(message, title = "") {
        open({ type: "info", title, message });
    },
    /**
     * Exibe modal de validação com lista de erros.
     * @param {Object} errors - Objeto { campo: ["mensagem", ...] }
     * @param {string} message - Mensagem de contexto (opcional)
     * @param {string} title - Título personalizado (opcional)
     */
    validation(errors, message = "Corrija os seguintes campos:", title = "") {
        open({ type: "validation", title, message, validationErrors: errors });
    },
    close,
};

/**
 * Composable para uso em componentes Vue (acessa state reativo + close)
 */
function useFeedbackModal() {
    return { state, open, close };
}

export { feedback, useFeedbackModal };
