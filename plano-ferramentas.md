# 📊 PLANO DETALHADO - Ferramentas CS:GO Intel

## 🎯 Visão Geral das Ferramentas

A CS:GO Intel oferece **4 ferramentas principais** para apostadores profissionais, cada uma com função específica e valor único no mercado.

---

## 🏆 1. ANÁLISE DAS PARTIDAS

### **🎯 Propósito:**

Apresentar **todos os jogos de CS do dia** de forma organizada e visualmente atraente, com dados estatísticos detalhados para ajudar apostadores a tomar decisões informadas.

### **📊 Dados Exibidos:**

- **Times envolvidos** (nomes + logos)
- **Campeonato** (liga/torneio)
- **Horário do jogo**
- **Médias estatísticas:**
  - Média de mapas jogados por série
  - Média de kills por mapa
  - Média de rounds por mapa

### **🎮 Feature Especial: Simulação de Jogo**

#### **Como Funciona:**

1. **Botão "Simular Jogo"** ao lado de cada partida
2. **Popup interativo** com:
   - Logos dos times enfrentando
   - Nome do campeonato
   - Indicador do mapa atual
3. **Animação mapa-por-mapa:**
   - Simulação visual de rounds
   - Eventos simulados (kills, bombas, etc.)
   - Duração: ~30-45 segundos por mapa
   - Transições suaves entre mapas

#### **Por que isso agrega valor:**

- **Engajamento:** Interação gamificada
- **Compreensão:** Visualização prática dos dados
- **Diferencial:** Nenhuma plataforma concorrente oferece isso

### **🔧 Implementação Técnica:**

#### **Fonte de Dados:**

```typescript
// BetsAPI - /bet365/upcoming
interface MatchData {
  id: string;
  league: { name: string };
  home: { name: string; logo?: string };
  away: { name: string; logo?: string };
  time: string;
  stats?: {
    avg_maps: number;
    avg_kills_per_map: number;
    avg_rounds_per_map: number;
  };
}
```

#### **Estrutura de Componentes:**

```
MatchList/
├── MatchCard/
│   ├── TeamLogos
│   ├── MatchInfo (league, time)
│   ├── StatsDisplay
│   └── SimulateButton
└── SimulationModal/
    ├── TeamDisplay
    ├── MapProgression
    ├── RoundAnimation
    └── EventTimeline
```

#### **Estado e Lógica:**

```typescript
const [matches, setMatches] = useState<MatchData[]>([]);
const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
const [simulationStep, setSimulationStep] = useState(0);
```

---

## 💎 2. LISTA DE OURO

### **🎯 Propósito:**

**Filtrar e destacar as melhores oportunidades** do dia, facilitando a vida do apostador ao identificar automaticamente os jogos mais relevantes para apostar.

### **🎲 Lógica de Filtragem:**

#### **Critérios de Seleção:**

1. **Top 3 - Maiores Médias de Kills:**

   - Ordena todos os jogos por `avg_kills_per_map`
   - Seleciona os 3 primeiros

2. **Top 3 - Maiores Médias de Rounds:**
   - Ordena todos os jogos por `avg_rounds_per_map`
   - Seleciona os 3 primeiros

#### **Exibição:**

- **Cards destacados** com borda dourada
- **Ícone de coroa** (👑) ou troféu
- **Badge "OURO"** em destaque
- **Ordenação:** Kills primeiro, depois Rounds

### **💡 Valor para o Usuário:**

- **Tempo economizado:** Não precisa analisar todos os jogos
- **Confiança:** Algoritmo identifica oportunidades premium
- **Foco:** Concentra atenção nos jogos que importam

### **🔧 Implementação Técnica:**

#### **Algoritmo de Filtragem:**

```typescript
function getGoldList(matches: MatchData[]): GoldMatch[] {
  const sortedByKills = [...matches].sort(
    (a, b) =>
      (b.stats?.avg_kills_per_map || 0) - (a.stats?.avg_kills_per_map || 0)
  );

  const sortedByRounds = [...matches].sort(
    (a, b) =>
      (b.stats?.avg_rounds_per_map || 0) - (a.stats?.avg_rounds_per_map || 0)
  );

  return [
    ...sortedByKills.slice(0, 3).map((m) => ({ ...m, goldType: "kills" })),
    ...sortedByRounds.slice(0, 3).map((m) => ({ ...m, goldType: "rounds" })),
  ];
}
```

#### **Componente:**

```tsx
<GoldList matches={matches} />
  ├── GoldCard match={match} type={goldType} />
  │   ├── CrownIcon
  │   ├── GoldBadge
  │   ├── MatchInfo
  │   └── HighlightStats
```

---

## 📺 3. DASHBOARD LIVE

### **🎯 Propósito:**

Oferecer **acompanhamento em tempo real** dos jogos que estão acontecendo agora, com interface customizada para máxima usabilidade durante apostas ao vivo.

### **⚡ Dados em Tempo Real:**

- **Placar atual** (rounds ganhos/perdidos)
- **Mapa atual** sendo jogado
- **Time no ataque/defesa**
- **Estatísticas parciais:**
  - Kills atuais
  - Bombas plantadas/defusadas
  - Rounds consecutivos

### **🎨 Interface Customizada:**

- **Layout tipo "placares esportivos":**

  - Times lado a lado
  - Placar centralizado e grande
  - Barra de progresso do mapa
  - Timeline de eventos recentes

- **Elementos visuais:**
  - Cores dinâmicas (baseado no time vencendo)
  - Animações sutis para atualizações
  - Ícones para eventos (💣 bomba, 🔫 kill, etc.)

### **🔄 Atualização em Tempo Real:**

- **Polling a cada 30 segundos** (ou WebSocket futuro)
- **Indicador de "live"** pulsante
- **Última atualização** timestamp
- **Fallback** para dados offline

### **🔧 Implementação Técnica:**

#### **Fonte de Dados:**

```typescript
// BetsAPI - /bet365/inplay
interface LiveMatch {
  id: string;
  status: "live";
  score: { home: number; away: number };
  current_map: string;
  events: LiveEvent[];
  stats: PartialMatchStats;
}
```

#### **Estado Reativo:**

```typescript
const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

// Atualização automática
useEffect(() => {
  const interval = setInterval(fetchLiveData, 30000);
  return () => clearInterval(interval);
}, []);
```

#### **Componentes:**

```
LiveDashboard/
├── LiveMatchCard/
│   ├── TeamScores
│   ├── MapIndicator
│   ├── EventFeed
│   └── LiveBadge
└── LiveStats/
    ├── CurrentMap
    ├── RoundProgress
    └── TeamMomentum
```

---

## 🔮 4. PREVISÕES BÁSICAS (FUTURO)

### **📋 Espaço Reservado:**

- Estrutura preparada para implementação futura
- Componentes base criados mas desabilitados
- Documentação técnica preparada

---

## 🏗️ PLANO DE IMPLEMENTAÇÃO

### **📅 Fases de Desenvolvimento:**

#### **FASE 1: Fundamentos (1-2 semanas)**

1. **Estrutura base do Dashboard**
2. **Conexão com BetsAPI** (upcoming/inplay)
3. **Modelos de dados** padronizados
4. **Layout responsivo** base

#### **FASE 2: Análise de Partidas (1 semana)**

1. **Lista completa de jogos do dia**
2. **Exibição de estatísticas básicas**
3. **Interface de filtros**
4. **Responsividade mobile**

#### **FASE 3: Lista de Ouro (3-4 dias)**

1. **Algoritmo de filtragem**
2. **Cards premium** com destaques
3. **Ordenação inteligente**
4. **Integração com Análise**

#### **FASE 4: Dashboard LIVE (1 semana)**

1. **Interface de placar ao vivo**
2. **Sistema de polling** em tempo real
3. **Animações e transições**
4. **Fallback para offline**

#### **FASE 5: Simulação (1-2 semanas)**

1. **Modal de simulação**
2. **Animação mapa-por-mapa**
3. **Eventos simulados**
4. **Controles de velocidade**

### **🛠️ Tecnologias e Integrações:**

#### **APIs Externas:**

- **BetsAPI:** Dados de partidas e estatísticas
- **PandaScore:** Logos e informações adicionais de times
- **Futuro:** HLTV para dados complementares

#### **Cache e Performance:**

- **Redis** para cache de dados da API
- **ISR/SSR** para páginas estáticas
- **Service Worker** para offline

#### **UI/UX Avançado:**

- **Framer Motion** para animações
- **Chart.js/Recharts** para gráficos
- **Custom hooks** para dados em tempo real

---

## 🎯 CONSIDERAÇÕES ESTRATÉGICAS

### **📚 Didática e Usabilidade:**

- **Tooltips explicativos** em todas as métricas
- **Glossário integrado** para termos técnicos
- **Tutoriais contextuais** na primeira visita
- **Interface intuitiva** sem curva de aprendizado

### **📱 Mobile-First:**

- **Cards otimizados** para touch
- **Scroll horizontal** para listas longas
- **Botões de ação** bem dimensionados
- **Performance** em conexões móveis

### **🔒 Segurança e Performance:**

- **Rate limiting** nas APIs
- **Cache inteligente** para reduzir chamadas
- **Error boundaries** para falhas graciosas
- **Loading states** em todas as operações

### **📊 Analytics e Métricas:**

- **Tracking de uso** por ferramenta
- **A/B testing** para otimizações
- **Feedback loops** dos usuários
- **Performance monitoring**

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Revisar APIs disponíveis** e testar endpoints
2. **Criar protótipos** das interfaces principais
3. **Definir arquitetura** de dados e cache
4. **Implementar Dashboard base** com navegação
5. **Começar com Análise de Partidas** (mais simples)

**Preparado para começar a implementação seguindo este plano detalhado?**
