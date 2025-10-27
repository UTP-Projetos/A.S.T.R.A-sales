"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Smartphone, Wifi, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type OnboardingStep = 1 | 2 | 3;

interface ConnectionStatus {
  connected: boolean;
  state?: string;
  message: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Step 1: Verificação inteligente do status da Amanda
  const handleSetupInstance = async () => {
    setLoading(true);
    try {
      console.log("🔍 Verificando status da Amanda...");
      
      // Verificar status da Amanda
      const response = await fetch("/api/evolution/check-amanda");
      const data = await response.json();

      if (response.ok && data.amanda) {
        console.log("📊 Status da Amanda:", {
          configured: data.amanda.configured,
          connected: data.amanda.connected,
          instanceName: data.amanda.instanceName
        });

        if (data.amanda.configured && data.amanda.connected) {
          // Amanda configurada e conectada → Pular para final
          toast.success("Amanda já está configurada e conectada! 🎉", {
            description: "Tudo pronto para usar.",
          });
          setStep(3);
        } else if (data.amanda.configured && !data.amanda.connected) {
          // Amanda configurada mas desconectada → Conectar WhatsApp
          toast.info("Amanda configurada, vamos conectar o WhatsApp", {
            description: "Gerando QR Code para conexão.",
          });
          setStep(2);
        } else {
          // Amanda não configurada → Configurar primeiro
          toast.info("Configurando Amanda...", {
            description: "Criando sua agente de IA.",
          });
          
          const setupResponse = await fetch("/api/evolution/setup-amanda", {
            method: "POST",
          });
          
          if (setupResponse.ok) {
            toast.success("Amanda configurada com sucesso! 🤖", {
              description: "Agora vamos conectar o WhatsApp.",
            });
            setStep(2);
          } else {
            throw new Error("Erro ao configurar Amanda");
          }
        }
      } else {
        throw new Error("Erro ao verificar Amanda");
      }
    } catch (error: any) {
      toast.error("Erro ao verificar Amanda", {
        description: error.message || "Tente novamente.",
      });
      console.error("Erro no setup:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Conexão inteligente do WhatsApp
  const handleGetQRCode = async () => {
    setLoading(true);
    console.log("🔍 Iniciando processo de conexão WhatsApp...");
    
    try {
      const response = await fetch("/api/evolution/get-qr");
      const data = await response.json();

      console.log("📊 Resposta da API:", {
        status: response.status,
        connected: data.connected,
        hasQrCode: !!data.qrCode,
        instanceName: data.instanceName
      });

      if (!response.ok) {
        throw new Error(data.error || "Erro ao obter QR Code");
      }

      // Se já está conectado, pular para o final
      if (data.connected) {
        console.log("✅ WhatsApp já está conectado!");
        toast.success("WhatsApp já está conectado! 🎉");
        setConnectionStatus({
          connected: true,
          message: "WhatsApp conectado com sucesso"
        });
        setStep(3);
        return;
      }

      // Se não tem QR Code, erro
      if (!data.qrCode) {
        console.log("❌ QR Code não foi gerado");
        throw new Error("QR Code não foi gerado pela API");
      }
      
      console.log("✅ QR Code gerado com sucesso");
      setQrCode(data.qrCode);
      toast.success("QR Code gerado! Escaneie com seu WhatsApp Business");

      // Iniciar polling para verificar conexão
      startConnectionPolling();
    } catch (error: any) {
      console.error("❌ Erro ao obter QR Code:", error);
      toast.error(error.message || "Erro ao obter QR Code");
    } finally {
      setLoading(false);
    }
  };

  // Polling inteligente para verificar conexão
  const startConnectionPolling = () => {
    console.log("🔄 Iniciando polling de conexão...");
    let attempts = 0;
    const maxAttempts = 20; // Máximo 1 minuto (20 * 3s)
    
    const interval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Verificando conexão (tentativa ${attempts}/${maxAttempts})...`);
      
      try {
        const response = await fetch("/api/evolution/check-connection");
        const data: ConnectionStatus = await response.json();

        console.log("📊 Status da conexão:", data);
        setConnectionStatus(data);

        if (data.connected) {
          console.log("✅ WhatsApp conectado com sucesso!");
          clearInterval(interval);
          setPollingInterval(null);
          toast.success("WhatsApp conectado com sucesso! 🎉");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 2000);
        } else if (attempts >= maxAttempts) {
          console.log("⏰ Timeout: Polling encerrado");
          clearInterval(interval);
          setPollingInterval(null);
          toast.error("Timeout: Não foi possível conectar o WhatsApp. Tente novamente.");
        }
      } catch (error) {
        console.error("❌ Erro ao verificar conexão:", error);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
          toast.error("Erro ao verificar conexão. Tente novamente.");
        }
      }
    }, 3000); // Verificar a cada 3 segundos

    setPollingInterval(interval);
  };


  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao CRM Caverá! 🎉</h1>
          <p className="text-muted-foreground">
            Vamos configurar sua Amanda em 2 passos simples
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > 1 ? <CheckCircle2 className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </div>
              <span className="text-xs mt-2 font-medium">Configurar</span>
            </div>

            <div className={`w-16 h-0.5 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > 2 ? <CheckCircle2 className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
              </div>
              <span className="text-xs mt-2 font-medium">Conectar</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configurar Instância Amanda
              </CardTitle>
              <CardDescription>
                Vamos preparar sua instância da Amanda para atender seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">O que será configurado:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Instância Evolution API
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Configurações de segurança
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Preparação para conexão WhatsApp
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleSetupInstance} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    Iniciar Configuração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Conecte seu WhatsApp Business
              </CardTitle>
              <CardDescription>
                Escaneie o QR Code com seu WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!qrCode ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={handleGetQRCode} 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      <>
                        Gerar QR Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {/* QR Code Display */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      {qrCode ? (
                        <img 
                          src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                          alt="QR Code WhatsApp"
                          width={280}
                          height={280}
                          className="rounded"
                          style={{ display: 'block' }}
                          onLoad={() => console.log("✅ QR Code carregado com sucesso!")}
                          onError={(e) => console.log("❌ Erro ao carregar QR Code:", e)}
                        />
                      ) : (
                        <div className="w-[280px] h-[280px] bg-gray-100 rounded flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>Gerando QR Code...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Como conectar:</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Abra o <strong>WhatsApp Business</strong> no seu celular</li>
                      <li>Toque em <strong>Mais opções</strong> (⋮) e depois em <strong>Aparelhos conectados</strong></li>
                      <li>Toque em <strong>Conectar um aparelho</strong></li>
                      <li>Aponte seu celular para esta tela para escanear o código</li>
                    </ol>
                  </div>

                  {/* Connection Status */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {pollingInterval ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-muted-foreground">Aguardando conexão...</span>
                      </>
                    ) : connectionStatus?.connected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Conectado!</span>
                      </>
                    ) : null}
                  </div>


                  <Button 
                    onClick={handleGetQRCode} 
                    variant="outline"
                    className="w-full"
                  >
                    Gerar Novo QR Code
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </MainLayout>
  );
}
