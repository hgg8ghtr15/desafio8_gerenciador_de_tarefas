# Escolha uma versão do Node
FROM node:24.14.1

# Cria o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# 3. GERA O CLIENT DO PRISMA
RUN npx prisma generate

# Expõe a porta que a aplicação usa (ex: 3000)
EXPOSE 3333

# Comando para rodar a aplicação
CMD ["npm", "start"]