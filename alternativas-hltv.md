# 🔍 ALTERNATIVAS PARA ACESSAR DADOS HLTV

## ❌ HLTV API no RapidAPI - NÃO ENCONTRADA

O usuário tentou buscar "hltv" no RapidAPI e não encontrou a API mencionada no guia. Isso indica que:

### **Possíveis Razões:**

1. **API removida** do RapidAPI
2. **Nome mudou** ou foi rebrandada
3. **Provider encerrou** o serviço
4. **Mudança de política** da HLTV

---

## 🔄 ALTERNATIVAS VIÁVEIS PARA CS:GO SCOUT

### **🥇 ALTERNATIVA 1: Web Scraping Direto (RECOMENDADO)**

#### **Por que é viável:**

- ✅ **Acesso gratuito** a 100% dos dados
- ✅ **Dados em tempo real** sempre atualizados
- ✅ **Controle total** sobre extração
- ✅ **Não depende** de terceiros

#### **Como implementar:**

```typescript
// src/lib/scrapers/hltvScraper.ts
import axios from "axios";
import * as cheerio from "cheerio";

export class HLTVScraper {
  private baseUrl = "https://www.hltv.org";

  async getTeamStats(teamId: number) {
    const url = `${this.baseUrl}/team/${teamId}/team-name`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extrair estatísticas da página
    const stats = {
      mapsPlayed: $(".stats-table .maps-played").text(),
      winRate: $(".stats-table .win-rate").text(),
      avgKills: $(".stats-table .avg-kills").text(),
      // ... outros dados
    };

    return stats;
  }

  async getRecentMatches() {
    const url = `${this.baseUrl}/matches`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const matches = $(".match-table tr")
      .map((i, el) => ({
        team1: $(el).find(".team1").text(),
        team2: $(el).find(".team2").text(),
        event: $(el).find(".event").text(),
        time: $(el).find(".time").text(),
      }))
      .get();

    return matches;
  }
}
```

#### **Vantagens do Web Scraping:**

- **Gratuito** (apenas custos de servidor)
- **Dados completos** (tudo que está no site)
- **Atualização imediata** (dados frescos)
- **Independência** (não depende de APIs)

#### **Desafios:**

- ⚠️ **Rate limiting** (cuidado para não ser bloqueado)
- ⚠️ **Manutenção** (se layout mudar, código quebra)
- ⚠️ **Legal** (verificar termos de uso)

---

### **🥈 ALTERNATIVA 2: Esports APIs Especializadas**

#### **A. SportRadar CS:GO API**

```
- ✅ Dados completos de esports
- ✅ Estatísticas avançadas de CS:GO
- ✅ Cobertura global de torneios
- ✅ Dados históricos
- ❌ Custo: $500+/mês
- 🔗 Verificar: https://sportradar.com/
```

#### **B. The Odds API (com dados CS:GO)**

```
- ✅ Odds em tempo real
- ✅ Dados de apostas CS:GO
- ✅ Estatísticas básicas
- ❌ Foco principal em odds, não estatísticas
- 💰 Custo: $50-200/mês
```

#### **C. EsportsData API**

```
- ✅ Dados de múltiplos esports
- ✅ Estatísticas de CS:GO
- ✅ Torneios e resultados
- 💰 Custo: $99-299/mês
- 🔗 Verificar: https://esportsdata.com/
```

---

### **🥉 ALTERNATIVA 3: Dados Abertos + Crowdsourcing**

#### **A. HLTV RSS Feeds**

```xml
<!-- https://www.hltv.org/rss/news -->
<rss>
  <channel>
    <item>
      <title>FURIA vs NAVI - ESL Pro League</title>
      <link>https://www.hltv.org/matches/...</link>
      <pubDate>2024-01-15</pubDate>
    </item>
  </channel>
</rss>
```

#### **B. Dados de Torneios Abertos**

- **Liquipedia** (dados wiki estruturados)
- **EsportsEarnings** (prêmios e estatísticas)
- **Steam Web API** (dados básicos de jogadores)

---

## 🎯 ESTRATÉGIA RECOMENDADA PARA CS:GO SCOUT

### **FASE 1: Web Scraping HLTV (Imediato)**

```
✅ Gratuito e completo
✅ Dados reais imediatos
✅ Controle total
⏰ 3-4 dias para implementar
```

### **FASE 2: APIs Complementares (Opcional)**

```
✅ SportRadar para dados premium
✅ The Odds para probabilidades
✅ Backup para web scraping
```

### **FASE 3: Sistema Híbrido**

```
✅ Web scraping como principal
✅ APIs como backup/suplemento
✅ Cache inteligente
✅ Fallback robusto
```

---

## 📋 PLANO DE IMPLEMENTAÇÃO - WEB SCRAPING

### **Dia 1: Setup e Estrutura**

```bash
npm install axios cheerio puppeteer
# cheerio: parsing HTML
# puppeteer: browser automation (anti-bot)
```

### **Dia 2: Scraper Básico**

```typescript
// src/lib/scrapers/hltvScraper.ts
export class HLTVScraper {
  async getTeamStats(teamName: string) {
    // Lógica de scraping
  }

  async getMatches() {
    // Lógica de scraping
  }
}
```

### **Dia 3: Integração com Sistema**

```typescript
// src/app/api/matches/stats/route.ts
const scraper = new HLTVScraper();

export async function GET(request) {
  try {
    // Tentar scraping primeiro
    const data = await scraper.getTeamStats(teamName);
    return { data, source: "HLTV_SCRAPING" };
  } catch (error) {
    // Fallback para dados mockados
    return getMockStats(teamName);
  }
}
```

### **Dia 4: Otimizações**

```typescript
// Cache + Rate limiting
const CACHE_DURATION = 30 * 60 * 1000; // 30min
const REQUEST_DELAY = 2000; // 2s entre requests

// Anti-bot measures
const useProxy = true;
const rotateUserAgents = true;
```

---

## ⚖️ COMPARATIVO DE OPÇÕES

| Método           | Custo | Dados      | Manutenção | Legal | Velocidade |
| ---------------- | ----- | ---------- | ---------- | ----- | ---------- |
| **Web Scraping** | $0    | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⚠️    | ⭐⭐⭐⭐⭐ |
| **SportRadar**   | $$$$  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅    | ⭐⭐⭐⭐   |
| **The Odds**     | $$$   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ✅    | ⭐⭐⭐⭐⭐ |
| **EsportsData**  | $$$   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ✅    | ⭐⭐⭐⭐   |

---

## 🎯 DECISÃO ESTRATÉGICA

### **Para CS:GO Scout:**

#### **✅ RECOMENDAÇÃO: Web Scraping HLTV**

**Razões:**

1. **Dados completos** da fonte oficial
2. **Custo zero** (apenas infraestrutura)
3. **Independência** total
4. **Atualização imediata**
5. **Escalabilidade** ilimitada

#### **📋 Plano de Contingência:**

1. **Web Scraping** como principal
2. **SportRadar API** como backup premium
3. **Dados mockados** como último recurso

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### **1. Implementar Web Scraping HLTV**

```bash
# Instalar dependências
npm install axios cheerio puppeteer

# Criar scraper básico
# Testar com times específicos
# Integrar com sistema atual
```

### **2. Testar e Otimizar**

```typescript
// Testes iniciais
const scraper = new HLTVScraper();
const furiaStats = await scraper.getTeamStats("FURIA");
console.log(furiaStats); // Deve retornar dados reais
```

### **3. Implementar Cache e Rate Limiting**

```typescript
// Evitar bloqueios
// Cache inteligente
// Delay entre requests
// Rotação de proxies (se necessário)
```

---

## 💡 CONSIDERAÇÕES IMPORTANTES

### **Legal/Ético:**

- ✅ **Dados públicos** (site aberto)
- ⚠️ **Termos de uso** da HLTV
- ✅ **Não comercial** (dados para apostas pessoais)
- ⚠️ **Rate limiting** respeitoso

### **Técnico:**

- ✅ **Puppeteer** para anti-bot
- ✅ **Cheerio** para parsing rápido
- ✅ **Cache Redis** para performance
- ✅ **Fallback system** robusto

---

## 🎉 CONCLUSÃO

**Como a API HLTV não está disponível no RapidAPI, o Web Scraping é a melhor alternativa!**

- ✅ **Dados reais** da fonte oficial
- ✅ **Custo zero** adicional
- ✅ **Implementação factível** (3-4 dias)
- ✅ **Manutenível** e escalável

**Vantagem:** Acesso direto a TODOS os dados que a HLTV possui, sem intermediários!

**Vamos implementar o web scraping da HLTV?** 🚀
