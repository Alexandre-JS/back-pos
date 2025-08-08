import { readFileSync } from 'fs';
import { Connection, createConnection } from 'typeorm';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';

// Função para processar o CSV
function parseCSV(csvContent: string) {
  const lines = csvContent.split('\n');
  const products: Array<{name: string, salePrice: number, stock: number}> = [];
  
  // Pular as primeiras 3 linhas (cabeçalhos e linha vazia)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse manual da linha CSV considerando aspas
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && (j === 0 || line[j-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (j === line.length - 1 || line[j+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
        continue;
      }
      if (!(char === '"' && (inQuotes || j === 0 || line[j-1] === ','))) {
        current += char;
      }
    }
    parts.push(current.trim());
    
    if (parts.length >= 3 && parts[0]) {
      const name = parts[0].trim();
      const priceStr = parts[1]?.trim() || '0';
      const stockStr = parts[2]?.trim() || '0';
      
      // Converter preço (pode estar vazio)
      let price = 0;
      if (priceStr && priceStr !== '') {
        price = parseFloat(priceStr) || 0;
      }
      
      // Converter estoque
      const stock = parseInt(stockStr) || 0;
      
      if (name && name.length > 0) {
        products.push({
          name: name,
          salePrice: price,
          stock: stock
        });
      }
    }
  }
  
  return products;
}

// Função para categorizar produtos automaticamente
function categorizeProduct(productName: string): string {
  const name = productName.toLowerCase();
  
  // Medicamentos por categoria
  if (name.includes('teste') && (name.includes('gravidez') || name.includes('malaria'))) {
    return 'Testes Diagnósticos';
  }
  
  if (name.includes('pilula') || name.includes('contraceptivo') || name.includes('preservativo')) {
    return 'Contracepção';
  }
  
  if (name.includes('vitamina') || name.includes('complexo b') || name.includes('calcio') || 
      name.includes('ferro') || name.includes('magnesio') || name.includes('zinco')) {
    return 'Vitaminas e Minerais';
  }
  
  if (name.includes('paracetamol') || name.includes('ibuprofeno') || name.includes('aspirina') || 
      name.includes('diclofinac') || name.includes('anti-gripe')) {
    return 'Analgésicos e Anti-inflamatórios';
  }
  
  if (name.includes('antibiótico') || name.includes('amoxicilina') || name.includes('ciprofloxacina') || 
      name.includes('azitromicina') || name.includes('penicilina') || name.includes('ceftriaxona')) {
    return 'Antibióticos';
  }
  
  if (name.includes('pomada') || name.includes('creme') || name.includes('gel') || 
      name.includes('dermat') || name.includes('sabonete')) {
    return 'Dermatológicos';
  }
  
  if (name.includes('xarope') || name.includes('suspensao') || name.includes('susp') || 
      name.includes('gotas') || name.includes('solucao')) {
    return 'Líquidos e Suspensões';
  }
  
  if (name.includes('injectavel') || name.includes('inj.') || name.includes('ampola') || 
      name.includes('seringa')) {
    return 'Injetáveis e Material';
  }
  
  if (name.includes('colirio') || name.includes('oft') || name.includes('ocular') || name.includes('auricular')) {
    return 'Oftalmológicos e Otológicos';
  }
  
  if (name.includes('fralda') || name.includes('bebe') || name.includes('pediatrico') || name.includes('crianca')) {
    return 'Pediatria';
  }
  
  if (name.includes('diabetes') || name.includes('pressao') || name.includes('cardiaco') || 
      name.includes('enalapril') || name.includes('metformina') || name.includes('atenolol')) {
    return 'Doenças Crónicas';
  }
  
  if (name.includes('lubrificante') || name.includes('preservativo') || name.includes('kamasutra')) {
    return 'Saúde Sexual';
  }
  
  if (name.includes('algodao') || name.includes('compressa') || name.includes('penso') || 
      name.includes('liga') || name.includes('adesivo')) {
    return 'Material de Penso';
  }
  
  // Categoria padrão
  return 'Medicamentos Gerais';
}

// Categorias da farmácia
const pharmacyCategories = [
  { name: 'Analgésicos e Anti-inflamatórios', description: 'Medicamentos para dor e inflamação' },
  { name: 'Antibióticos', description: 'Medicamentos para infecções bacterianas' },
  { name: 'Vitaminas e Minerais', description: 'Suplementos vitamínicos e minerais' },
  { name: 'Dermatológicos', description: 'Cremes, pomadas e produtos para pele' },
  { name: 'Contracepção', description: 'Métodos contraceptivos e planeamento familiar' },
  { name: 'Líquidos e Suspensões', description: 'Xaropes, suspensões e soluções' },
  { name: 'Injetáveis e Material', description: 'Medicamentos injetáveis e material médico' },
  { name: 'Oftalmológicos e Otológicos', description: 'Colírios e medicamentos para ouvidos' },
  { name: 'Testes Diagnósticos', description: 'Testes de gravidez, malária, etc.' },
  { name: 'Pediatria', description: 'Medicamentos e produtos para crianças' },
  { name: 'Doenças Crónicas', description: 'Medicamentos para diabetes, hipertensão, etc.' },
  { name: 'Saúde Sexual', description: 'Preservativos, lubrificantes e produtos íntimos' },
  { name: 'Material de Penso', description: 'Materiais para curativos e pensos' },
  { name: 'Medicamentos Gerais', description: 'Outros medicamentos diversos' }
];

export async function importPharmacyProducts() {
  try {
    console.log('💊 Iniciando importação de produtos farmacêuticos...');
    
    // Ler o arquivo CSV
    const csvPath = './pharmacy_products.csv'; // Coloque seu arquivo CSV aqui
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Processar CSV
    const rawProducts = parseCSV(csvContent);
    console.log(`📄 ${rawProducts.length} produtos encontrados no CSV`);
    
    // Configuração do banco
    const connection = await createConnection({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [Product, Category],
      synchronize: false,
    });

    console.log('📦 Conectado ao banco de dados');

    const productRepository = connection.getRepository(Product);
    const categoryRepository = connection.getRepository(Category);

    // Limpar dados existentes
    console.log('🗑️ Limpando dados existentes...');
    await productRepository.clear();
    await categoryRepository.clear();

    // Inserir categorias
    console.log('📂 Inserindo categorias farmacêuticas...');
    const createdCategories = await categoryRepository.save(pharmacyCategories);
    console.log(`✅ ${createdCategories.length} categorias inseridas`);

    // Criar mapa de categorias
    const categoryMap = new Map();
    createdCategories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // Processar e categorizar produtos
    console.log('🏷️ Categorizando e inserindo produtos...');
    const productsToInsert = rawProducts.map((product, index) => {
      const category = categorizeProduct(product.name);
      const costPrice = product.salePrice > 0 ? product.salePrice * 0.7 : 0; // Estimar custo como 70% do preço
      
      return {
        name: product.name,
        description: `Produto farmacêutico: ${product.name}`,
        salePrice: product.salePrice,
        costPrice: costPrice,
        category: category,
        categoryId: categoryMap.get(category),
        stock: product.stock,
        minStock: Math.max(1, Math.floor(product.stock * 0.2)), // 20% do estoque como mínimo
        unit: product.name.toLowerCase().includes('kg') ? 'kg' : 
              product.name.toLowerCase().includes('ml') ? 'ml' : 
              product.name.toLowerCase().includes('g') && !product.name.toLowerCase().includes('mg') ? 'g' : 'un',
        barcode: `PH${String(index + 1).padStart(6, '0')}`, // Código interno da farmácia
        active: true
      };
    });

    // Inserir produtos
    const createdProducts = await productRepository.save(productsToInsert);
    console.log(`✅ ${createdProducts.length} produtos inseridos`);

    // Estatísticas finais
    console.log('\n📊 Resumo dos produtos por categoria:');
    const stats = createdProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} produtos`);
    });

    // Estatísticas de preços
    const productsWithPrice = createdProducts.filter(p => p.salePrice > 0);
    const productsWithoutPrice = createdProducts.filter(p => p.salePrice === 0);
    
    console.log(`\n💰 Produtos com preço: ${productsWithPrice.length}`);
    console.log(`⚠️  Produtos sem preço: ${productsWithoutPrice.length}`);
    
    if (productsWithPrice.length > 0) {
      const totalValue = productsWithPrice.reduce((sum, product) => sum + (product.salePrice * product.stock), 0);
      const avgPrice = productsWithPrice.reduce((sum, product) => sum + product.salePrice, 0) / productsWithPrice.length;
      
      console.log(`💵 Valor total em estoque: ${totalValue.toFixed(2)} MT`);
      console.log(`📈 Preço médio: ${avgPrice.toFixed(2)} MT`);
    }

    // Produtos sem estoque
    const outOfStock = createdProducts.filter(p => p.stock === 0);
    console.log(`⚠️  Produtos sem estoque: ${outOfStock.length}`);

    await connection.close();
    console.log('\n🎉 Importação concluída com sucesso!');
    
    if (productsWithoutPrice.length > 0) {
      console.log('\n⚠️  ATENÇÃO: Alguns produtos não têm preço definido.');
      console.log('   Você pode atualizar os preços posteriormente no sistema.');
    }

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  importPharmacyProducts();
}
