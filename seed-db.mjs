import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3] || 'felixadm',
});

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    const connection = await pool.getConnection();

    // Limpar dados existentes
    console.log('🗑️  Limpando dados antigos...');
    await connection.query('DELETE FROM installments');
    await connection.query('DELETE FROM sales');
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM clients');

    // Inserir clientes de exemplo
    console.log('👥 Inserindo clientes...');
    const clients = [
      { name: 'Maria Silva', email: 'maria@example.com', phone: '11999999999', address: 'Rua A, 123' },
      { name: 'Ana Costa', email: 'ana@example.com', phone: '11988888888', address: 'Rua B, 456' },
      { name: 'Juliana Santos', email: 'juliana@example.com', phone: '11977777777', address: 'Rua C, 789' },
      { name: 'Fernanda Oliveira', email: 'fernanda@example.com', phone: '11966666666', address: 'Rua D, 101' },
      { name: 'Carla Mendes', email: 'carla@example.com', phone: '11955555555', address: 'Rua E, 202' },
    ];

    const clientIds = [];
    for (const client of clients) {
      const [result] = await connection.query(
        'INSERT INTO clients (name, email, phone, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [client.name, client.email, client.phone, client.address]
      );
      clientIds.push(result.insertId);
    }
    console.log(`✅ ${clientIds.length} clientes inseridos`);

    // Inserir produtos de exemplo
    console.log('💄 Inserindo produtos...');
    const products = [
      { name: 'Manicure Gel', price: '45.00', description: 'Manicure com gel duração 3 semanas' },
      { name: 'Pedicure Gel', price: '50.00', description: 'Pedicure com gel duração 3 semanas' },
      { name: 'Limpeza de Pele', price: '80.00', description: 'Limpeza profunda com extrações' },
      { name: 'Massagem Facial', price: '100.00', description: 'Massagem relaxante 60 minutos' },
      { name: 'Depilação Corpo', price: '120.00', description: 'Depilação completa do corpo' },
      { name: 'Alongamento Cílios', price: '150.00', description: 'Alongamento de cílios fio a fio' },
    ];

    const productIds = [];
    for (const product of products) {
      const [result] = await connection.query(
        'INSERT INTO products (name, price, description, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [product.name, product.price, product.description]
      );
      productIds.push(result.insertId);
    }
    console.log(`✅ ${productIds.length} produtos inseridos`);

    // Inserir vendas de exemplo
    console.log('💰 Inserindo vendas...');
    const sales = [];
    const today = new Date();
    
    // Vendas dos últimos 30 dias
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const product = products.find((p, idx) => productIds[idx] === productId);
      const totalAmount = (parseFloat(product.price) * quantity).toFixed(2);

      sales.push({
        clientId,
        productId,
        quantity,
        totalAmount,
        status: 'completed',
        date,
      });
    }

    const saleIds = [];
    for (const sale of sales) {
      const [result] = await connection.query(
        'INSERT INTO sales (clientId, productId, quantity, totalAmount, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [sale.clientId, sale.productId, sale.quantity, sale.totalAmount, sale.status, sale.date]
      );
      saleIds.push(result.insertId);
    }
    console.log(`✅ ${saleIds.length} vendas inseridas`);

    // Inserir parcelas de exemplo
    console.log('📊 Inserindo parcelas...');
    let installmentCount = 0;
    
    for (let i = 0; i < saleIds.length; i++) {
      const saleId = saleIds[i];
      const sale = sales[i];
      
      // Algumas vendas em 1x, outras em 3x
      const installmentTotal = Math.random() > 0.5 ? 1 : 3;
      const amountPerInstallment = (parseFloat(sale.totalAmount) / installmentTotal).toFixed(2);
      
      for (let j = 1; j <= installmentTotal; j++) {
        const dueDate = new Date(sale.date);
        dueDate.setMonth(dueDate.getMonth() + j);
        
        // Algumas marcadas como pagas, outras pendentes
        const status = Math.random() > 0.4 ? 'paid' : 'pending';
        const paidDate = status === 'paid' ? new Date() : null;

        await connection.query(
          'INSERT INTO installments (saleId, installmentNumber, totalInstallments, amount, status, dueDate, paidDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [saleId, j, installmentTotal, amountPerInstallment, status, dueDate, paidDate]
        );
        installmentCount++;
      }
    }
    console.log(`✅ ${installmentCount} parcelas inseridas`);

    connection.release();
    console.log('\n✨ Seed concluído com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   - ${clientIds.length} clientes`);
    console.log(`   - ${productIds.length} produtos`);
    console.log(`   - ${saleIds.length} vendas`);
    console.log(`   - ${installmentCount} parcelas`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedDatabase();
