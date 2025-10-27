"use client";

import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  Bell, 
  Shield, 
  Save,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar dados do usuário
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Buscar dados da empresa
  const { data: company } = useQuery({
    queryKey: ["company", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data } = await supabase
        .from("Company")
        .select("*")
        .eq("email", user.email)
        .single();
      return data;
    },
    enabled: !!user?.email,
  });

  const handleSavePreferences = async () => {
    setSaving(true);
    // Simular salvamento (implementar depois)
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Preferências salvas com sucesso!");
    setSaving(false);
  };

  return (
    <MainLayout>
      <div className="flex-1 space-y-6 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as preferências da sua conta e sistema
          </p>
        </div>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize como o sistema aparece para você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setTheme("light")}
                  disabled={!mounted}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Claro
                  {mounted && theme === "light" && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setTheme("dark")}
                  disabled={!mounted}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Escuro
                  {mounted && theme === "dark" && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setTheme("system")}
                  disabled={!mounted}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Sistema
                  {mounted && theme === "system" && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {mounted && theme === "system" 
                  ? "Seguindo as preferências do sistema operacional" 
                  : mounted && theme === "dark"
                  ? "Tema escuro ativo"
                  : "Tema claro ativo"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email não pode ser alterado
              </p>
            </div>
            {company && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={(company as any)?.name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={(company as any)?.WppPhone || "Não configurado"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novas mensagens</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificação quando um cliente enviar mensagem
                </p>
              </div>
              <Button variant="outline" size="sm">
                Em breve
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novos agendamentos</Label>
                <p className="text-sm text-muted-foreground">
                  Ser notificado quando houver um novo agendamento
                </p>
              </div>
              <Button variant="outline" size="sm">
                Em breve
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Status da A.S.T.R.A</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas sobre problemas com a agente de IA
                </p>
              </div>
              <Button variant="outline" size="sm">
                Em breve
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Mantenha sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alterar senha</Label>
                <p className="text-sm text-muted-foreground">
                  Trocar a senha da sua conta
                </p>
              </div>
              <Button variant="outline" size="sm">
                Em breve
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sessões ativas</Label>
                <p className="text-sm text-muted-foreground">
                  Ver dispositivos conectados à sua conta
                </p>
              </div>
              <Button variant="outline" size="sm">
                Em breve
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botão de salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSavePreferences} disabled={saving}>
            {saving ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar preferências
              </>
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
