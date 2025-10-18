"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MainLayout } from "@/components/main-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2, Save, LogOut, Key, Building2, LinkIcon } from "lucide-react";
import type { Company } from "@/types/database";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  whatsapp: z
    .string()
    .regex(/^[0-9]{10,13}$/, "WhatsApp deve ter entre 10 e 13 dígitos (Ex: 5548999999999)")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ConfiguracoesPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: company, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user?.email) throw new Error("Sessão inválida");
      const { data, error } = await supabase
        .from("Company")
        .select("*")
        .eq("email", user.email)
        .single();
      if (error) throw error;
      return data as Company;
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (company) {
      setValue("name", company.name || "");
      setValue("email", company.email || "");
      setValue("whatsapp", company.WppPhone || "");
    }
  }, [company, setValue]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!company) throw new Error("Empresa não encontrada");
      const { error } = await supabase
        .from("Company")
        .update({
          name: data.name,
          email: data.email || null,
          WppPhone: data.whatsapp || null,
        })
        .eq("id", company.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (err: any) => {
      toast.error("Erro ao salvar", { description: err?.message || "Tente novamente" });
    },
  });

  const onSubmit = (data: FormData) => updateMutation.mutate(data);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie os dados da sua empresa</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Dados da Empresa
              </CardTitle>
              <CardDescription>Informações básicas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none">Nome da Empresa *</label>
                  <Input id="name" placeholder="Ex: Hotel Caverá" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">E-mail</label>
                  <Input id="email" type="email" placeholder="contato@empresa.com" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="text-sm font-medium leading-none">WhatsApp (Opcional)</label>
                  <PhoneInput id="whatsapp" placeholder="55 48 99999-9999" defaultValue={company?.WppPhone || ""} onChange={(value) => setValue("whatsapp", value)} />
                  {errors.whatsapp && (
                    <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" /> Conexão WhatsApp
              </CardTitle>
              <CardDescription>Informações de integração</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Token da Instância</p>
                <Input value={company?.tokenInstance || "—"} readOnly />
                <p className="text-xs text-muted-foreground">Configuração feita pelo suporte (Evolution Manager)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" /> Segurança
              </CardTitle>
              <CardDescription>Gerencie sua sessão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" disabled>
                <Key className="mr-2 h-4 w-4" /> Alterar Senha
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saindo...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
