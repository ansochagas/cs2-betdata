# Migração para PostgreSQL

## Status Atual

✅ Schema atualizado para PostgreSQL
✅ Dependências instaladas (pg)
✅ Variáveis de ambiente configuradas

## Próximos Passos para Completar a Migração

### 1. Configurar Banco PostgreSQL

Escolha uma das opções:

**Opção A: Neon.tech (Recomendado - Gratuito)**

1. Acesse [neon.tech](https://neon.tech)
2. Crie conta gratuita
3. Crie um novo projeto
4. Copie a connection string
5. Atualize `.env.local`:

```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

**Opção B: Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Crie projeto gratuito
3. Vá para Settings > Database
4. Copie a connection string

**Opção C: PostgreSQL Local**

```bash
# Instalar PostgreSQL localmente
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql

# Criar banco
createdb csgo_intel

# Connection string
DATABASE_URL="postgresql://username:password@localhost:5432/csgo_intel"
```

### 2. Executar Migração

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migração
npx prisma migrate dev --name init

# Aplicar ao banco
npx prisma db push
```

### 3. Verificar Funcionamento

```bash
# Testar conexão
npx prisma studio

# Verificar tabelas criadas
npx prisma db pull
```

## Comandos de Migração de Dados (Opcional)

Se houver dados no SQLite que precisam ser migrados:

```bash
# Exportar dados do SQLite
npx prisma db pull --force

# Importar para PostgreSQL
npx prisma db push
```

## Configuração de Produção

Para produção, use variáveis de ambiente:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Troubleshooting

**Erro de permissão no Windows:**

- Execute como administrador
- Ou use WSL/Linux

**Erro de conexão:**

- Verifique se o PostgreSQL está rodando
- Confirme credenciais
- Teste conexão com `psql`

**Erro SSL:**

- Adicione `?sslmode=require` na URL para bancos remotos
