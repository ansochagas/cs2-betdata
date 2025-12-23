 "use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  Swords,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface GoldListOpportunity {
  rank: number;
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    tournament: string;
    scheduledAt: string;
  };
  expectedValue: number;
  confidence: number;
  reasoning: string;
  tip?: string;
  deltaFromLine?: number;
  analysis: {
    team1Stats: any;
    team2Stats: any;
  };
}

interface GoldListData {
  date: string;
  categories: {
    overKills: GoldListOpportunity[];
    overRounds: GoldListOpportunity[];
    moneyline: GoldListOpportunity[];
  };
  metadata: {
    totalMatches: number;
    analyzedMatches: number;
    lastUpdate: string;
    dataSource: string;
  };
}

// Funções utilitárias
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "text-green-400 bg-green-500/20";
  if (confidence >= 0.6) return "text-yellow-400 bg-yellow-500/20";
  return "text-red-400 bg-red-500/20";
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 0.8) return "Alta";
  if (confidence >= 0.6) return "Média";
  return "Baixa";
};

export default function GoldListTool() {
  const [data, setData] = useState<GoldListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoldList = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/gold-list");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Erro ao carregar lista de ouro");
      }
    } catch (err: any) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldList();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-4 text-gray-400">Carregando Lista de Ouro...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-4 text-red-400">
          Erro ao carregar
        </h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <button
          onClick={fetchGoldList}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-xl p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                LISTA DE OURO
              </h1>
              <p className="text-gray-400">
                Melhores oportunidades de aposta do dia
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(data.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={16} />
              <span>
                Atualizado:{" "}
                {new Date(data.metadata.lastUpdate).toLocaleTimeString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {data.metadata.totalMatches}
              </div>
              <div className="text-sm text-gray-400">Jogos Hoje</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">
                {data.metadata.analyzedMatches}
              </div>
              <div className="text-sm text-gray-400">Analisados</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {data.categories.overKills.length +
                  data.categories.overRounds.length +
                  data.categories.moneyline.length}
              </div>
              <div className="text-sm text-gray-400">Oportunidades</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid gap-8">
        {/* Over Kills */}
        <CategorySection
          title="OVER KILLS"
          subtitle="Jogos com alta expectativa de kills totais"
          icon={<Swords className="w-6 h-6 text-red-400" />}
          opportunities={data.categories.overKills}
          formatValue={(value) => `${value.toFixed(0)} kills`}
          color="red"
          emptyMessage="Nenhuma oportunidade de Over Kills identificada hoje"
        />

        {/* Over Rounds */}
        <CategorySection
          title="OVER ROUNDS"
          subtitle="Jogos com expectativa de muitos rounds"
          icon={<Target className="w-6 h-6 text-blue-400" />}
          opportunities={data.categories.overRounds}
          formatValue={(value) => `${value.toFixed(1)} rounds`}
          color="blue"
          emptyMessage="Nenhuma oportunidade de Over Rounds identificada hoje"
        />

        {/* Moneyline */}
        <CategorySection
          title="MONEYLINE"
          subtitle="Melhores palpites de vencedor"
          icon={<Trophy className="w-6 h-6 text-yellow-400" />}
          opportunities={data.categories.moneyline}
          formatValue={(value) => ""}
          color="yellow"
          emptyMessage="Nenhuma oportunidade clara de Moneyline identificada hoje"
        />
      </div>

      {/* Footer */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-6 text-center">
        <p className="text-gray-400 text-sm">
            TODOS DIREITOS RESERVADOS À CS2 BETDATA
        </p>
      </div>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  opportunities: GoldListOpportunity[];
  formatValue: (value: number) => string;
  color: "red" | "blue" | "yellow";
  emptyMessage: string;
}

function CategorySection({
  title,
  subtitle,
  icon,
  opportunities,
  formatValue,
  color,
  emptyMessage,
}: CategorySectionProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
        };
      case "blue":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
        };
      case "yellow":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
        };
      default:
        return {
          bg: "bg-zinc-500/10",
          border: "border-zinc-500/30",
          text: "text-zinc-400",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  if (opportunities.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-4">{subtitle}</p>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center border ${colorClasses.border}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.match.id}
            className="bg-zinc-800/50 border border-zinc-600 rounded-lg p-6 hover:border-zinc-500 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getRankIcon(opportunity.rank)}</div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {opportunity.match.homeTeam} vs {opportunity.match.awayTeam}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {opportunity.match.tournament}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(opportunity.match.scheduledAt).toLocaleDateString(
                      "pt-BR"
                    )}{" "}
                    às{" "}
                    {new Date(opportunity.match.scheduledAt).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                {opportunity.expectedValue > 0 && (
                  <div
                    className={`text-2xl font-bold ${colorClasses.text} mb-1`}
                  >
                    {formatValue(opportunity.expectedValue)}
                  </div>
                )}
                {opportunity.tip && (
                  <div className="text-xs text-gray-400">
                    Sugestão: {opportunity.tip}
                    {typeof opportunity.deltaFromLine === "number" &&
                    !Number.isNaN(opportunity.deltaFromLine)
                      ? ` (Δ ${opportunity.deltaFromLine.toFixed(1)})`
                      : ""}
                  </div>
                )}
                <div
                  className={`text-xs px-2 py-1 rounded ${getConfidenceColor(
                    opportunity.confidence
                  )}`}
                >
                  {getConfidenceLabel(opportunity.confidence)} confiança
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>
                  📊{" "}
                  {opportunity.analysis.team1Stats.stats.totalMatches +
                    opportunity.analysis.team2Stats.stats.totalMatches}{" "}
                  jogos analisados
                </span>
              </div>

              <button className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded text-sm transition-colors">
                Ver Análise Completa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

