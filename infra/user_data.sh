#!/bin/bash
# A linha acima (shebang) indica que o script deve ser interpretado pelo bash.

# Eleva os privilégios para o usuário root para ter permissão de instalar pacotes.
sudo su

# Atualiza todos os pacotes instalados no sistema operacional.
yum update -y

# Instala o Docker no servidor (-y confirma automaticamente durante a instalação).
yum install -y docker

# Inicia o daemon/serviço do Docker para que ele possa executar contêineres.
service docker start

# Adiciona o usuário padrão 'ec2-user' ao grupo 'docker'.
# Isso permite rodar comandos do Docker sem precisar de permissões 'sudo'.
usermod -a -G docker ec2-user

# Baixa a imagem e executa a aplicação em um contêiner Docker.
# -d: Roda em background (segundo plano).
# -p 8080:80: Mapeia a porta 8080 da instância EC2 (host) para a porta 80 do contêiner.
# --name sfbjj: Dá o nome "sfbjj" para o contêiner criado.
docker run -d -p 8080:80 --name sfbjj umluks/sfbjj-app:1.0.0
