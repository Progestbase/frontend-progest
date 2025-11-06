/**
 * Utilidades para gerenciar cookies de setor
 */

const SETOR_COOKIE_NAME = "progest_setor_id";
const SETOR_NOME_COOKIE_NAME = "progest_setor_nome";

export const setorCookie = {
  /**
   * Salvar ID do setor nos cookies
   * @param {number} setorId - ID do setor
   * @param {string} setorNome - Nome do setor (opcional)
   */
  setSector(setorId, setorNome = "") {
    if (setorId) {
      document.cookie = `${SETOR_COOKIE_NAME}=${setorId}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 7 dias
      if (setorNome) {
        document.cookie = `${SETOR_NOME_COOKIE_NAME}=${encodeURIComponent(
          setorNome
        )}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
    }
  },

  /**
   * Obter ID do setor dos cookies
   * @returns {string|null} - ID do setor ou null
   */
  getSectorId() {
    const name = `${SETOR_COOKIE_NAME}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return null;
  },

  /**
   * Obter nome do setor dos cookies
   * @returns {string|null} - Nome do setor ou null
   */
  getSectorName() {
    const name = `${SETOR_NOME_COOKIE_NAME}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return decodeURIComponent(cookie.substring(name.length));
      }
    }
    return null;
  },

  /**
   * Limpar cookies de setor
   */
  clearSector() {
    document.cookie = `${SETOR_COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${SETOR_NOME_COOKIE_NAME}=; path=/; max-age=0`;
  },

  /**
   * Verificar se setor está definido nos cookies
   * @returns {boolean}
   */
  hasSector() {
    return !!this.getSectorId();
  },
};
