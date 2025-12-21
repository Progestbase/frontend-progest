# ==========================================
# Makefile para Frontend Progest (Vue.js)
# ==========================================

# O alvo 'deploy' automatiza o processo de atualização e reinicialização do ambiente Docker.
deploy: docker-down docker-up

# Passo 1: Derruba os contêineres existentes
docker-down:
	@echo "--- 1/2: Derrubando os contêineres Docker Compose atuais..."
	docker-compose down

# Passo 2: Constrói as imagens e levanta os serviços
docker-up:
	@echo "--- 2/2: Construindo e subindo os serviços Docker Compose..."
	docker-compose up -d --build

# Alvo opcional para limpar completamente o ambiente
clean:
	@echo "--- Limpando contêineres, imagens e volumes..."
	docker-compose down -v --rmi all

# Logs do container
logs:
	docker-compose logs -f progest-web

# Alvo de ajuda
help:
	@echo "Comandos disponíveis (make):"
	@echo "  make deploy : Derruba e sobe containers (com build)"
	@echo "  make clean  : Remove tudo (containers, imagens, volumes)"
	@echo "  make logs   : Mostra logs do container Web"
	@echo "  make help   : Mostra esta mensagem"

.PHONY: deploy docker-down docker-up clean logs help
