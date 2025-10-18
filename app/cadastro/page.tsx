"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, Lock, Phone, Mail, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Schema de validação
const registerSchema = z.object({
  companyName: z
    .string()
    .min(3, "Nome da empresa deve ter no mínimo 3 caracteres")
    .max(100, "Nome da empresa deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  whatsapp: z
    .string()
    .regex(/^[0-9]{10,13}$/, "WhatsApp deve ter entre 10 e 13 dígitos (Ex: 5548999999999)")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres"),
  confirmPassword: z
    .string()
    .min(8, "Confirmação de senha obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            company_name: data.companyName,
            whatsapp: data.whatsapp || null,
          },
        },
      });

      if (authError) {
        console.error("Erro ao criar conta:", authError);
        
        if (authError.message.includes("already registered")) {
          toast.error("E-mail já cadastrado", {
            description: "Este e-mail já possui uma conta. Faça login.",
          });
        } else {
          toast.error("Erro ao criar conta", {
            description: authError.message,
          });
        }
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar conta", {
          description: "Não foi possível criar o usuário.",
        });
        return;
      }

      // 2. Criar registro na tabela Company
      const { error: companyError } = await supabase
        .from("Company")
        .insert({
          name: data.companyName,
          WppPhone: data.whatsapp || null,
          tokenInstance: null, // Será preenchido durante onboarding
          status: "active",
          email: data.email,
          // REMOVIDO: password - usar apenas Supabase Auth
          instanceName: null, // Será preenchido durante onboarding
          whatsappConnected: false,
          webhookConfigured: false,
          onboardingCompleted: false,
        });

      if (companyError) {
        console.error("Erro ao criar empresa:", companyError);
        
        // Se falhar ao criar Company, deletar o usuário Auth criado
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        toast.error("Erro ao registrar empresa", {
          description: "Tente novamente ou entre em contato com o suporte.",
        });
        return;
      }

      // 3. Configurar Amanda automaticamente
      toast.success("Conta criada com sucesso! 🎉", {
        description: "Configurando sua Amanda agora...",
      });

      // 4. Configurar Amanda
      try {
        const amandaResponse = await fetch("/api/evolution/setup-amanda", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (amandaResponse.ok) {
          const amandaData = await amandaResponse.json();
          console.log("Amanda configurada:", amandaData);
          
          toast.success("Amanda configurada! 🤖", {
            description: "Sua agente de IA está pronta. Vamos conectar o WhatsApp.",
          });
        } else {
          console.error("Erro ao configurar Amanda:", await amandaResponse.json());
          toast.warning("Conta criada, mas Amanda não configurada", {
            description: "Você pode configurar manualmente no onboarding.",
          });
        }
      } catch (amandaError) {
        console.error("Erro ao configurar Amanda:", amandaError);
        toast.warning("Conta criada, mas Amanda não configurada", {
          description: "Você pode configurar manualmente no onboarding.",
        });
      }

      // 5. Redirect para onboarding
      setTimeout(() => {
        router.push("/onboarding");
        router.refresh();
      }, 3000);

    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Cadastre sua Empresa
          </CardTitle>
          <CardDescription>
            Crie sua conta e comece a usar o CRM com a Agente Amanda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Nome da Empresa */}
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Nome da Empresa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Ex: Hotel Caverá"
                  className="pl-10"
                  {...register("companyName")}
                  disabled={isLoading}
                />
              </div>
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            {/* Campo E-mail */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Usado para login no sistema
              </p>
            </div>

            {/* Campo WhatsApp (Opcional) */}
            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp da Empresa <span className="text-muted-foreground">(opcional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <PhoneInput
                  id="whatsapp"
                  placeholder="55 48 99999-9999"
                  className="pl-10"
                  onChange={(value) => setValue("whatsapp", value)}
                  disabled={isLoading}
                />
              </div>
              {errors.whatsapp && (
                <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Para integração com a Amanda
              </p>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("password")}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mínimo de 8 caracteres
              </p>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Já tem conta?
                </span>
              </div>
            </div>

            {/* Link para Login */}
            {/* Botão de logout para limpar sessão ativa */}
            <Button
              type="button"
              variant="destructive"
              className="w-full mb-2"
              disabled={isLoading}
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Sessão encerrada com sucesso!");
                router.refresh();
              }}
            >
              Limpar Sessão Ativa
            </Button>

            <Link href="/login">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Fazer Login
              </Button>
            </Link>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 pt-6 border-t text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="/termos" className="text-primary hover:underline">
                Termos de Uso
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
