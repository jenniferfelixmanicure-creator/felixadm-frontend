import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Sales() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    productId: "",
    quantity: "1",
    totalAmount: "",
    status: "pending",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: sales = [] } = trpc.sales.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  const createMutation = trpc.sales.create.useMutation({
    onSuccess: () => {
      utils.sales.list.invalidate();
      setFormData({ clientId: "", productId: "", quantity: "1", totalAmount: "", status: "pending", notes: "" });
      setIsOpen(false);
      toast.success("Venda registrada!");
    },
  });

  const updateMutation = trpc.sales.update.useMutation({
    onSuccess: () => {
      utils.sales.list.invalidate();
      setFormData({ clientId: "", productId: "", quantity: "1", totalAmount: "", status: "pending", notes: "" });
      setEditingId(null);
      setIsOpen(false);
      toast.success("Venda atualizada!");
    },
  });

  const deleteMutation = trpc.sales.delete.useMutation({
    onSuccess: () => {
      utils.sales.list.invalidate();
      toast.success("Venda removida!");
    },
  });

  const handleSubmit = () => {
    if (!formData.clientId || !formData.productId || !formData.totalAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        clientId: parseInt(formData.clientId),
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        totalAmount: formData.totalAmount,
        status: formData.status as any,
        notes: formData.notes,
      });
    } else {
      createMutation.mutate({
        clientId: parseInt(formData.clientId),
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        totalAmount: formData.totalAmount,
        status: formData.status as any,
        notes: formData.notes,
      });
    }
  };

  const handleEdit = (sale: any) => {
    setFormData({
      clientId: sale.clientId.toString(),
      productId: sale.productId.toString(),
      quantity: sale.quantity.toString(),
      totalAmount: sale.totalAmount.toString(),
      status: sale.status,
      notes: sale.notes || "",
    });
    setEditingId(sale.id);
    setIsOpen(true);
  };

  const handleNew = () => {
    setFormData({ clientId: "", productId: "", quantity: "1", totalAmount: "", status: "pending", notes: "" });
    setEditingId(null);
    setIsOpen(true);
  };

  const getClientName = (id: number) => clients.find((c: any) => c.id === id)?.name || "Cliente";
  const getProductName = (id: number) => products.find((p: any) => p.id === id)?.name || "Produto";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} Venda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Quantidade"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />

              <Input
                placeholder="Valor Total *"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              />

              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Notas"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <Button onClick={handleSubmit} className="w-full">
                {editingId ? "Atualizar" : "Registrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sales.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma venda registrada. Clique em "Nova Venda" para começar.
            </CardContent>
          </Card>
        ) : (
          sales.map((sale: any) => (
            <Card key={sale.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{getClientName(sale.clientId)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getProductName(sale.productId)}</p>
                    <p className="text-sm font-semibold text-pink-600 mt-1">R$ {parseFloat(sale.totalAmount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Qtd: {sale.quantity} | Status: {sale.status === "pending" ? "Pendente" : sale.status === "completed" ? "Concluída" : "Cancelada"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sale)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(sale.id)}
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
