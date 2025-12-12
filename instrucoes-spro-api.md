# 🎮 SPRO AGENCY API - CONFIGURAÇÃO PARA CS:GO SCOUT

## 📋 O QUE É A SPRO AGENCY API?

A **Spro Agency** (BoltOdds) é uma API de apostas esportivas que fornece:

- ✅ **Dados de apostas em tempo real** via WebSocket
- ✅ **Odds atualizadas constantemente**
- ✅ **Múltiplos esportes** (NBA, MLB, CS:GO, etc.)
- ✅ **Múltiplas casas de apostas**
- ✅ **14 dias de teste gratuito**

## 🚀 CONFIGURAÇÃO RÁPIDA

### Passo 1: Pegar sua API Key

1. Vá para: [spro.agency](https://spro.agency) (ou o site que te deram)
2. Faça signup
3. Confirme seu email
4. Copie a API key do email

### Passo 2: Configurar no Projeto

1. Abra o arquivo `.env.local`
2. Adicione esta linha:

```
SPRO_API_KEY=sua_api_key_aqui
```

### Passo 3: Testar a API

Execute o comando:

```bash
cd csgo-intel
node teste-spro-agency-api.js
```

## 📊 O QUE ESPERAR

### Se tiver CS:GO disponível:

```
🎯 CS:GO ENCONTRADO!
✅ Esporte encontrado
✅ Jogos encontrados
🎯 PERFEITA PARA CS:GO SCOUT!
```

### Dados que você terá acesso:

- **Odds em tempo real** de múltiplas casas de apostas
- **Jogos futuros** com probabilidades
- **Atualizações live** durante as partidas
- **Dados históricos** de apostas

## 🎯 PARA CS:GO SCOUT

Esta API será **PERFEITA** porque fornece:

- 📈 **Análise de probabilidades** baseada em odds
- 🎲 **Dados para algoritmos de previsão**
- 💰 **Informações de mercado** de apostas
- 📊 **Tendências de apostas** por time

## 🔧 ESTRUTURA DA API

### WebSocket Connection:

```javascript
wss://spro.agency/api?key=YOUR_TOKEN
```

### Subscription Example:

```javascript
{
  "action": "subscribe",
  "filters": {
    "sports": ["CS:GO", "Counter-Strike"],
    "sportsbooks": ["bet365", "pinnacle"],
    "markets": ["Moneyline", "Spread"]
  }
}
```

### Mensagens que recebe:

- `initial_state` - Estado inicial das odds
- `game_update` - Odds atualizadas
- `line_update` - Linha específica atualizada
- `game_removed` - Jogo finalizado

## ⚠️ IMPORTANTE

- **Teste gratuito de 14 dias**
- **Rate limits**: 12 requests/min por IP
- **WebSocket**: Reconexão automática
- **Filtros obrigatórios**: sports, sportsbooks, markets

## 🎮 PRÓXIMOS PASSOS

1. **Configure sua API key**
2. **Execute o teste**
3. **Se CS:GO estiver disponível** → Integramos no projeto
4. **Se não estiver** → Buscamos alternativa

**BOA SORTE! 🎯**
