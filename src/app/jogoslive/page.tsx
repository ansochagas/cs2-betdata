"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, Play, Clock, Trophy, Users } from "lucide-react";

interface LiveMatch {
  id: string;
  time: string;
  league: {
    name: string;
    id: string;
  };
  home: {
    name: string;
    id: string;
  };
  away: {
    name: string;
    id: string;
  };
  status: string;
  scores?: {
    home: number;
    away: number;
  };
  timer?: string;
}

interface APIResponse {
  success: boolean;
  data: LiveMatch[];
  totalLiveMatches: number;
  csgoSportIds: number[];
  testedSports: any[];
  metadata: {
    csgoLiveMatchesFound: number;
    sportIdsTested: number;
    workingSportIds: number;
    recommendations: string[];
  };
}

export default function JogosLivePage() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Buscar jogos ao vivo
  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/live-matches");
      const data: APIResponse = await response.json();

      if (data.success) {
        setLiveMatches(data.data);
        setLastUpdate(new Date());
        console.log(
          `🎮 Encontrados ${data.totalLiveMatches} jogos CS:GO ao vivo`
        );
      } else {
        setError(
          data.metadata?.recommendations?.[0] ||
            "Nenhum jogo ao vivo encontrado"
        );
      }
    } catch (err: any) {
      setError("Erro ao carregar jogos ao vivo");
      console.error("Erro ao buscar jogos ao vivo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    fetchLiveMatches();

    const interval = setInterval(() => {
      fetchLiveMatches();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getTeamLogo = (teamName: string) => {
    const logoMap: { [key: string]: string } = {
      FURIA: "/logos/furia.png",
      Fluxo: "/logos/fluxo.png",
      "Ninjas In Pyjamas": "/logos/nip.png",
      "FaZe Clan": "/logos/faze.png",
      "Natus Vincere": "/logos/navi.png",
      "G2 Esports": "/logos/g2.png",
      "Team Vitality": "/logos/vitality.png",
      Astralis: "/logos/astralis.png",
      MIBR: "/logos/mibr.png",
      // Adicionar mais conforme necessário
    };

    return logoMap[teamName] || "/icons/counterstrike.svg";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "live":
      case "1":
        return "bg-red-500";
      case "scheduled":
      case "0":
        return "bg-blue-500";
      case "finished":
      case "2":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "live":
      case "1":
        return "AO VIVO";
      case "scheduled":
      case "0":
        return "AGENDADO";
      case "finished":
      case "2":
        return "FINALIZADO";
      default:
        return "DESCONHECIDO";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-orange-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Play className="text-red-400" size={40} />
                Jogos Ao Vivo
              </h1>
              <p className="text-red-100 text-lg">
                Acompanhe jogos de CS:GO em tempo real
              </p>
            </div>

            <button
              onClick={fetchLiveMatches}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>

          <div className="mt-4 text-sm text-red-200">
            Última atualização: {lastUpdate.toLocaleString("pt-BR")}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && liveMatches.length === 0 && (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Buscando jogos ao vivo...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="text-red-400 font-semibold">Atenção</h3>
            </div>
            <p className="text-red-200">{error}</p>
            <div className="mt-4 p-4 bg-black/30 rounded text-sm">
              <p className="text-gray-300 mb-2">
                💡 <strong>Dica:</strong>
              </p>
              <ul className="text-gray-400 space-y-1">
                <li>
                  • Jogos ao vivo aparecem automaticamente quando disponíveis
                </li>
                <li>• A página atualiza automaticamente a cada 30 segundos</li>
                <li>• Clique em "Atualizar" para forçar uma nova busca</li>
              </ul>
            </div>
          </div>
        )}

        {/* Lista de Jogos Ao Vivo */}
        <div className="space-y-6">
          {liveMatches.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Trophy className="text-red-400" />
                Jogos Encontrados ({liveMatches.length})
              </h2>
              <p className="text-gray-400">
                Jogos de CS:GO detectados automaticamente
              </p>
            </div>
          )}

          {liveMatches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300"
            >
              {/* Status Bar */}
              <div className={`h-2 ${getStatusColor(match.status)}`}></div>

              <div className="p-6">
                {/* Header do Jogo */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(
                        match.status
                      )}`}
                    >
                      {getStatusText(match.status)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {match.league.name}
                    </div>
                  </div>

                  {match.timer && (
                    <div className="flex items-center gap-2 text-red-400 font-mono">
                      <Clock size={16} />
                      {match.timer}
                    </div>
                  )}
                </div>

                {/* Times e Placar */}
                <div className="grid grid-cols-3 gap-4 items-center mb-6">
                  {/* Time Casa */}
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Image
                        src={getTeamLogo(match.home.name)}
                        alt={match.home.name}
                        width={60}
                        height={60}
                        className="rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{match.home.name}</h3>
                        <div className="text-3xl font-mono font-bold text-red-400 mt-1">
                          {match.scores?.home || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500 mb-2">
                      VS
                    </div>
                    {match.status === "1" && (
                      <div className="text-red-500 animate-pulse">
                        <Play size={24} className="mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Time Visitante */}
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Image
                        src={getTeamLogo(match.away.name)}
                        alt={match.away.name}
                        width={60}
                        height={60}
                        className="rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{match.away.name}</h3>
                        <div className="text-3xl font-mono font-bold text-red-400 mt-1">
                          {match.scores?.away || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="border-t border-gray-800 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-300">
                        {formatTime(match.time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-gray-300">{match.league.name}</span>
                    </div>
                  </div>
                </div>

                {/* Placeholder para Estatísticas Detalhadas */}
                {match.status === "1" && (
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                      <Trophy size={16} />
                      Estatísticas em Tempo Real
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-gray-400 mb-1">Kills Líder</p>
                        <p className="text-white font-semibold">Em breve</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800 rounded">
                        <p className="text-gray-400 mb-1">Rounds</p>
                        <p className="text-white font-semibold">
                          {match.scores
                            ? `${match.scores.home + match.scores.away}`
                            : "0"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      🔄 Estatísticas detalhadas disponíveis em breve com API
                      premium
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quando não há jogos */}
        {liveMatches.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Nenhum jogo ao vivo no momento
            </h3>
            <p className="text-gray-400 mb-6">
              Não há jogos de CS:GO acontecendo agora. Volte mais tarde ou
              durante os horários de torneios.
            </p>
            <button
              onClick={fetchLiveMatches}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Verificar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
