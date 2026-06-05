import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", photoUrl: "", photoKey: "" });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: products = [] } = trpc.products.list.useQuery();
  const uploadPhotoMutation = trpc.products.uploadPhoto.useMutation();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setFormData({ name: "", description: "", price: "", photoUrl: "", photoKey: "" });
      setPhotoPreview(null);
      setIsOpen(false);
      toast.success("Produto adicionado!");
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setFormData({ name: "", description: "", price: "", photoUrl: "", photoKey: "" });
      setPhotoPreview(null);
      setEditingId(null);
      setIsOpen(false);
      toast.success("Produto atualizado!");
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Produto removido!");
    },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      
      if (editingId) {
        try {
          const result = await uploadPhotoMutation.mutateAsync({
            productId: editingId,
            base64: base64.split(",")[1],
            filename: `product-${editingId}-${Date.now()}.jpg`,
          });
          setFormData({ ...formData, photoUrl: result.url, photoKey: result.key });
          toast.success("Foto enviada!");
        } catch (error) {
          toast.error("Erro ao enviar foto");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product: any) => {
    setFormData(product);
    setPhotoPreview(product.photoUrl || null);
    setEditingId(product.id);
    setIsOpen(true);
  };

  const handleNew = () => {
    setFormData({ name: "", description: "", price: "", photoUrl: "", photoKey: "" });
    setPhotoPreview(null);
    setEditingId(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Novo"} Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Preço *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <Textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {photoPreview ? (
                  <div className="space-y-2">
                    <img src={photoPreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <span className="text-sm text-blue-600">Trocar foto</span>
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clique para adicionar foto</span>
                  </label>
                )}
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingId ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {products.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
            </CardContent>
          </Card>
        ) : (
          products.map((product: any) => (
            <Card key={product.id}>
              {product.photoUrl && (
                <img src={product.photoUrl} alt={product.name} className="w-full h-40 object-cover" />
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm font-semibold text-pink-600">R$ {parseFloat(product.price).toFixed(2)}</p>
                    {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(product.id)}
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
