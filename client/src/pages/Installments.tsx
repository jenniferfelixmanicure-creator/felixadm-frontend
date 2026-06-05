import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Installments() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    saleId: "",
    installmentNumber: "1",
    totalInstallments: "1",
    amount: "",
    dueDate: "",
    status: "pending",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: installments = [] } = trpc.installments.list.useQuery();
  const { data: sales = [] } = trpc.sales.list.useQuery();

  const createMutation = trpc.installments.create.useMutation({
    onSuccess: () => {
      utils.installments.list.invalidate();
      setFormData({ saleId: "", installmentNumber: "1", totalInstallments: "1", amount: "", dueDate: "", status: "pending", notes: "" });
      setIsOpen(false);
      toast.success("Parcela criada!");
    },
  });

  const updateMutation = trpc.installments.update.useMutation({
    onSuccess: () => {
      utils.installments.list.invalidate();
      setFormData({ saleId: "", installmentNumber: "1", totalInstallments: "1", amount: "", dueDate: "", status: "pending", notes: "" });
      setEditingId(null);
      setIsOpen(false);
      toast.success("Parcela atualizada!");
    },
  });

  const deleteMutation = trpc.installments.delete.useMutation({
    onSuccess: () => {
      utils.installments.list.invalidate();
      toast.success("Parcela removida!");
    },
  });

  const handleSubmit = () => {
    if (!formData.saleId || !formData.amount || !formData.dueDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        status: formData.status as any,
        paidDate: formData.status === "paid" ? new Date() : undefined,
        notes: formData.notes,
      });
    } else {
      createMutation.mutate({
        saleId: parseInt(formData.saleId),
        installmentNumber: parseInt(formData.installmentNumber),
        totalInstallments: parseInt(formData.totalInstallments),
        amount: formData.amount,
        dueDate: new Date(formData.dueDate),
        status: formData.status as any,
        notes: formData.notes,
      });
    }
  };

  const handleMarkAsPaid = (installment: any) => {
    updateMutation.mutate({
      id: installment.id,
      status: "paid",
      paidDate: new Date(),
    });
  };

  const handleEdit = (installment: any) => {
    setFormData({
      saleId: installment.saleId.toString(),
      installmentNumber: installment.installmentNumber.toString(),
      totalInstallments: installment.totalInstallments.toString(),
      amount: installment.amount.toString(),
      dueDate: new Date(installment.dueDate).toISOString().split("T")[0],
      status: installment.status,
      notes: installment.notes || "",
    });
    setEditingId(installment.id);
    setIsOpen(true);
  };

  const handleNew = () => {
    setFormData({ saleId: "", installmentNumber: "1", totalInstallments: "1", amount: "", dueDate: "", status: "pending", notes: "" });
    setEditingId(null);
    setIsOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "overdue":
        return "Vencido";
      default:
        return "Pendente";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const pendingCount = installments.filter((i: any) => i.status === "pending").length;
  const paidCount = installments.filter((i: any) => i.status === "paid").length;
  const overdueCount = installments.filter((i: any) => i.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parcelas</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Parcela
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} Parcela</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={formData.saleId} onValueChange={(value) => setFormData({ ...formData, saleId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma venda" />
                </SelectTrigger>
                <SelectContent>
                  {sales.map((sale: any) => (
                    <SelectItem key={sale.id} value={sale.id.toString()}>
                      Venda #{sale.id} - R$ {parseFloat(sale.totalAmount).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Número da Parcela"
                type="number"
                min="1"
                value={formData.installmentNumber}
                onChange={(e) => setFormData({ ...formData, installmentNumber: e.target.value })}
              />

              <Input
                placeholder="Total de Parcelas"
                type="number"
                min="1"
                value={formData.totalInstallments}
                onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
              />

              <Input
                placeholder="Valor *"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />

              <Input
                placeholder="Data de Vencimento *"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />

              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <Button onClick={handleSubmit} className="w-full">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {installments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma parcela registrada. Clique em "Nova Parcela" para começar.
            </CardContent>
          </Card>
        ) : (
          installments.map((installment: any) => (
            <Card key={installment.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(installment.status)}
                      <CardTitle className="text-lg">
                        Parcela {installment.installmentNumber}/{installment.totalInstallments}
                      </CardTitle>
                    </div>
                    <p className="text-sm font-semibold text-pink-600">R$ {parseFloat(installment.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vencimento: {formatDate(installment.dueDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Status: {getStatusLabel(installment.status)}
                    </p>
                    {installment.paidDate && (
                      <p className="text-xs text-green-600 mt-1">
                        Pago em: {formatDate(installment.paidDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {installment.status !== "paid" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPaid(installment)}
                        className="text-green-600"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(installment)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(installment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
