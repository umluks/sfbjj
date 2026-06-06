# Configura o provedor da AWS, especificando a região onde os recursos serão criados.
provider "aws" {
  region = "us-east-1"
}

# Cria um Grupo de Segurança (Security Group) para a instância EC2.
# Ele atua como um firewall virtual para controlar o tráfego de rede.
resource "aws_security_group" "sfbjj" {
  name        = "sfbjj"
  description = "Permitir acesso HTTP e Internet"

  # Regra de entrada (Ingress): Permite tráfego HTTP na porta 80 de qualquer origem (0.0.0.0/0).
  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regra de entrada (Ingress): Permite tráfego SSH na porta 22 de qualquer origem (0.0.0.0/0).
  # Obs: Para maior segurança em produção, é recomendado restringir o IP de origem.
  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regra de saída (Egress): Permite que a instância acesse qualquer porta e qualquer destino na internet.
  egress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Cria um par de chaves SSH na AWS, permitindo o acesso seguro à instância.
# A chave pública local é lida do arquivo ~/.ssh/id_rsa.pub.
resource "aws_key_pair" "sfbjj" {
  key_name   = "sfbjj-keypar"
  public_key = file("~/.ssh/id_rsa.pub")
}

# Provisiona a instância de máquina virtual (EC2).
resource "aws_instance" "sfbjj" {
  # ID da Imagem de Máquina da Amazon (AMI) que será usada (Ex: Amazon Linux 2023).
  ami           = "ami-00e801948462f718a"
  # Tipo da instância que define a capacidade de CPU e memória. "t3.micro" possui baixo custo.
  instance_type = "t3.micro"
  
  # Associa o Security Group criado acima a esta instância.
  vpc_security_group_ids = [aws_security_group.sfbjj.id]
  
  # Script de inicialização (User Data) executado automaticamente na criação da instância.
  user_data = file("user_data.sh")
  
  # Associa o par de chaves SSH para permitir futuras conexões à instância.
  key_name = aws_key_pair.sfbjj.key_name
  
  # Adiciona uma etiqueta para identificar a instância no painel da AWS.
  tags = {
    Name = "sfbjj"
  }
}