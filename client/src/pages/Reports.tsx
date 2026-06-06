import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { data: sales, isLoading: salesLoading } = trpc.sales.list.useQuery();
  const { data: installments, isLoading: installmentsLoading } = trpc.installments.list.useQuery();

  // Calcular dados dos gráficos
  const chartData = useMemo(() => {
    if (!sales || !installments) return null;

    // Vendas por dia (últimos 30 dias)
    const salesByDay: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("pt-BR");
      salesByDay[dateStr] = 0;
    }

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt as any);
      const dateStr = saleDate.toLocaleDateString("pt-BR");
      if (dateStr in salesByDay) {
        salesByDay[dateStr] += parseFloat(sale.totalAmount);
      }
    });

    const lineChartData = Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2)),
    }));

    // Status das parcelas
    const installmentStatus = {
      paid: 0,
      pending: 0,
      overdue: 0,
    };

    const now = new Date();
    installments.forEach((inst) => {
      if (inst.status === "paid") {
        installmentStatus.paid += parseFloat(inst.amount);
      } else {
        const dueDate = new Date(inst.dueDate as any);
        if (dueDate < now) {
          installmentStatus.overdue += parseFloat(inst.amount);
        } else {
          installmentStatus.pending += parseFloat(inst.amount);
        }
      }
    });

    const pieChartData = [
      { name: "Pagas", value: parseFloat(installmentStatus.paid.toFixed(2)) },
      { name: "Pendentes", value: parseFloat(installmentStatus.pending.toFixed(2)) },
      { name: "Vencidas", value: parseFloat(installmentStatus.overdue.toFixed(2)) },
    ];

    // Produtos mais vendidos
    const productSales: Record<string, { count: number; revenue: number }> = {};
    sales.forEach((sale) => {
      const key = `Produto ${sale.productId}`;
      if (!productSales[key]) {
        productSales[key] = { count: 0, revenue: 0 };
      }
      productSales[key].count += sale.quantity;
      productSales[key].revenue += parseFloat(sale.totalAmount);
    });

    const barChartData = Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        vendas: data.count,
        receita: parseFloat(data.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 6);

    return {
      lineChartData,
      pieChartData,
      barChartData,
      installmentStatus,
    };
  }, [sales, installments]);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // Calcular totais
  const totals = useMemo(() => {
    if (!sales || !installments) return null;

    const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const totalInstallments = installments.length;
    const paidInstallments = installments.filter((i) => i.status === "paid").length;
    const overdueInstallments = installments.filter((i) => {
      const dueDate = new Date(i.dueDate as any);
      return i.status === "pending" && dueDate < new Date();
    }).length;

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalInstallments,
      paidInstallments,
      overdueInstallments,
    };
  }, [sales, installments]);

  if (salesLoading || installmentsLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!chartData || !totals) {
    return <div className="p-6 text-center">Nenhum dado disponível</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totals.totalSales.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-500 mt-1">{sales?.length || 0} vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Parcelas Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.paidInstallments}</div>
            <p className="text-xs text-gray-500 mt-1">de {totals.totalInstallments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Parcelas Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totals.overdueInstallments}</div>
            <p className="text-xs text-gray-500 mt-1">atenção!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totals.totalInstallments > 0
                ? ((totals.paidInstallments / totals.totalInstallments) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500 mt-1">de todas as parcelas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Vendas por Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas nos Últimos 30 Dias</CardTitle>
          <CardDescription>Receita diária em reais</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#ec4899"
                dot={false}
                name="Receita (R$)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status de Parcelas */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Parcelas</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: R$ ${value.toLocaleString("pt-BR")}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 6 por receita</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Legend />
                <Bar dataKey="receita" fill="#ec4899" name="Receita (R$)" />
                <Bar dataKey="vendas" fill="#a78bfa" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
