import axios from 'axios';

// Função para adicionar ou atualizar unidade (compatível com o sistema existente)
var ADD_UP = (content, funcao) => {
  const payload = {
    unidades: funcao == "ADD" || funcao == "UP" 
      ? content.modalData 
      : content.unidade_data
  };

  console.log('=== ADD_UP UNIDADES ===');
  console.log('funcao:', funcao);
  console.log('payload:', payload);
  console.log('URL:', funcao == "ADD" ? "/unidades/add" : "/unidades/update");
  console.log('headers:', {
    Authorization: "Bearer " + content.$store.getters.getUserToken
  });

  content.$axios
    .post(
      funcao == "ADD" ? "/unidades/add" : "/unidades/update",
      payload,
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(function (response) {
      console.log('response received:', response.data);
      
      if (response.data.status === "success" || response.data.status === true) {
        listAll(content);
        content.$toastr.success((funcao == "ADD" ? "Cadastrado" : "Atualizado") + " com sucesso");
        
        if (funcao == "ADD") {
          content.modalData.id = response.data.data.id;
          content.$store.commit("setIdDataLoaded", response.data.data.id);
        }
        content.$store.commit("setModalTitle", response.data.data.nome);
        content.$store.commit("setModalFunction", "UP");
        console.log(response.data.data);
        
        // Fechar modal após sucesso
        setTimeout(() => {
          const modalElement = document.getElementById('addUPUnidade');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        }, 100);
      } else if (response.data.status === "error" && response.data.errors) {
        let erros = "";
        for (let erro of Object.values(response.data.errors)) {
          erros += erro + "\n";
        }
        content.$toastr.error(erros);
      } else if (response.data.validacao && response.data.erros) {
        let erros = "";
        for (let erro of Object.values(response.data.erros)) {
          erros += erro + "\n";
        }
        content.$toastr.error(erros);
      } else if (response.data.message) {
        content.$toastr.error(response.data.message);
      } else {
        console.log("Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar"), response);
        content.$toastr.error("Erro ao " + (funcao == "ADD" ? "cadastrar" : "atualizar"));
      }
    })
    .catch(function (error) {
      console.log('error caught:', error);
      
      // Verificar se há detalhes do erro 422 (validação)
      if (error.response && error.response.status === 422) {
        console.log('Erro de validação completo:', error.response);
        console.log('Data do erro:', error.response.data);
        
        let mensagemErro = '';
        
        if (error.response.data.erros) {
          // Armazenar erros para o modal
          content.lastValidationErrors = {};
          
          mensagemErro = "Erros de validação encontrados:\n\n";
          for (let campo in error.response.data.erros) {
            const nomeAmigavel = {
              'codigo_unidade': 'Código da Unidade',
              'nome': 'Nome',
              'descricao': 'Descrição',
              'status': 'Status',
              'tipo': 'Tipo',
              'estoque': 'Controle de Estoque'
            };
            
            const nomeCampo = nomeAmigavel[campo] || campo;
            const erros = error.response.data.erros[campo];
            
            // Armazenar erro formatado para o campo
            content.lastValidationErrors[campo] = [];
            
            for (let erro of erros) {
              let mensagemTraduzida = erro;
              if (erro.includes('has already been taken')) {
                mensagemTraduzida = 'Este código já está sendo usado. Escolha outro.';
              } else if (erro.includes('is required')) {
                mensagemTraduzida = 'Este campo é obrigatório.';
              }
              mensagemErro += `• ${nomeCampo}: ${mensagemTraduzida}\n`;
              content.lastValidationErrors[campo].push(mensagemTraduzida);
            }
          }
        } else if (error.response.data.errors) {
          mensagemErro = "Erros de validação:\n";
          for (let campo in error.response.data.errors) {
            mensagemErro += `- ${campo}: ${error.response.data.errors[campo].join(', ')}\n`;
          }
        } else if (error.response.data.message) {
          mensagemErro = error.response.data.message;
        } else {
          mensagemErro = `Erro de validação (422): ${JSON.stringify(error.response.data)}`;
        }
        
        console.log('Mensagem de erro formatada:', mensagemErro);
        
        if (content.$toastr) {
          content.$toastr.error(mensagemErro);
        } else {
          alert(mensagemErro);
        }
      } else {
        const mensagem = "OPS. Pequena intermitência. Se persistir, realize um novo login.";
        if (content.$toastr) {
          content.$toastr.error(mensagem);
        } else {
          alert(mensagem);
        }
      }
    });
};

// Função para listar todas as unidades
var listAll = (content, url = null) => {
  content.$store.commit("setisSearching", true);
  content.$axios
    .post(
      url == null ? "/unidades/list" : url,
      {
        filters: content.$store.state.searchFilters
      },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(response => {
      content.$store.commit("setListUnidadesGerais", response.data);
      console.log("setListUnidadesGerais", response.data.data);
      content.$store.commit("setisSearching", false);
    })
    .catch(error => {
      console.error(error);
      content.$toastr.error("OPS! \nEstamos com algum problema, tente novamente mais tarde.");
    });
};

// Função para buscar dados de uma unidade específica
var listData = content => {
  const abaDados = document.querySelector("#aba_dados");
  if (abaDados) abaDados.click();
  content.$axios
    .post(
      "/unidades/listData",
      { id: content.idData },
      {
        headers: {
          Authorization: "Bearer " + content.$store.getters.getUserToken
        }
      }
    )
    .then(response => {
      content.$store.commit("setIdDataLoaded", content.idData);
      content.$store.commit("setModalData", response.data.data);
      if (content.callback) content.callback(); 
    })
    .catch(error => {
      console.error(error);
      content.$toastr.error("OPS. Pequena intermitência. Se persistir, realize um novo login.");
    });
};

// Funções modernas para uso direto (sem dependências do Vue 2)
export const criarUnidade = async (dadosUnidade) => {
  try {
    const response = await fetch('/api/unidades/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ unidades: dadosUnidade })
    });
    
    const result = await response.json();
    
    if (result.status) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        errors: result.erros || null,
        message: result.message || 'Erro ao criar unidade'
      };
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, message: 'Erro de conexão com o servidor' };
  }
};

export const listarUnidades = async (filters = null, paginate = false, axiosInstance = null) => {
  try {
    // Se não tiver axios instance, usar fetch como fallback
    if (!axiosInstance) {
      const body = {};
      if (filters) body.filters = filters;
      if (paginate) body.paginate = paginate;
      
      const response = await fetch('/api/unidades/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.status) {
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || 'Erro ao listar unidades' };
      }
    } else {
      // Usar axios instance do Vue
      const body = {};
      if (filters) body.filters = filters;
      if (paginate) body.paginate = paginate;
      
      const response = await axiosInstance.post('/unidades/list', body, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.status) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message || 'Erro ao listar unidades' };
      }
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, message: 'Erro de conexão com o servidor' };
  }
};

export const buscarUnidadePorId = async (id) => {
  try {
    console.log('=== buscarUnidadePorId iniciado para ID:', id);
    
    const result = await axios.post('unidades/listData', { id }).then(response => {
      console.log('Response recebido:', response.data);
      return response.data;
    }).catch(error => {
      console.error('Erro axios:', error);
      throw error;
    });
    
    if (result.status) {
      console.log('Unidade encontrada:', result.data);
      return { success: true, data: result.data };
    } else {
      console.log('Erro no status:', result.message);
      return { success: false, message: result.message || 'Erro ao buscar unidade' };
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, message: 'Erro de conexão com o servidor' };
  }
};

export const atualizarUnidade = async (dadosUnidade) => {
  try {
    const result = await axios.post('unidades/update', { unidades: dadosUnidade }).then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erro axios:', error);
      throw error;
    });
    
    if (result.status) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        errors: result.erros || null,
        message: result.message || 'Erro ao atualizar unidade'
      };
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, message: 'Erro de conexão com o servidor' };
  }
};

export const excluirUnidade = async (id) => {
  try {
    const result = await axios.post(`unidades/delete/${id}`).then(response => {
      return response.data;
    }).catch(error => {
      console.error('Erro axios:', error);
      throw error;
    });
    
    if (result.status) {
      return { success: true, message: result.message };
    } else {
      return { 
        success: false, 
        message: result.message || 'Erro ao excluir unidade',
        references: result.references || null
      };
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, message: 'Erro de conexão com o servidor' };
  }
};

var exportFunctions = {
  ADD_UP: ADD_UP,
  listAll: listAll,
  listData: listData,
  criarUnidade: criarUnidade,
  listarUnidades: listarUnidades,
  buscarUnidadePorId: buscarUnidadePorId,
  atualizarUnidade: atualizarUnidade,
  excluirUnidade: excluirUnidade
};

export default exportFunctions;