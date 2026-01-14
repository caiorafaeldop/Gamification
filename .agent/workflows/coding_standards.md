---
description: Padrões de codificação - DRY, KISS e YAGNI
---

# Padrões de Codificação do Projeto

Aplique SEMPRE estes princípios ao desenvolver código neste projeto:

## DRY (Don't Repeat Yourself)
- **Não duplique código**: Se a mesma lógica aparece em mais de um lugar, extraia para uma função/componente reutilizável
- **Reutilize código existente**: Antes de criar algo novo, verifique se já existe algo similar no projeto
- **Centralize configurações**: Constantes, tipos e configurações devem estar em arquivos dedicados

## KISS (Keep It Simple, Stupid)
- **Simplicidade primeiro**: Prefira soluções simples e diretas
- **Código legível**: Nomes claros, funções pequenas, estrutura óbvia
- **Evite over-engineering**: Não crie abstrações desnecessárias
- **Uma responsabilidade**: Cada função/componente deve fazer apenas uma coisa

## YAGNI (You Ain't Gonna Need It)
- **Implemente apenas o necessário**: Não adicione funcionalidades "para o futuro"
- **Sem código especulativo**: Se não é requisito agora, não implemente
- **Remova código morto**: Delete código comentado ou não utilizado

## ⚠️ Proteção do Banco de Dados
- **NUNCA apague o banco de dados**: Sob nenhuma circunstância delete ou resete o banco de dados
- **Preserve os dados**: Ao fazer migrações, sempre preserve os dados existentes
- **Cuidado com comandos destrutivos**: Evite `prisma migrate reset`, `DROP DATABASE`, ou qualquer comando que possa destruir dados

## Checklist antes de cada mudança
1. [ ] Existe código similar que posso reutilizar? (DRY)
2. [ ] Esta é a solução mais simples possível? (KISS)
3. [ ] Estou implementando apenas o que foi pedido? (YAGNI)
