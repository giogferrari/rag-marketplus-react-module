import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import type { ItemData } from './interface/ItemData';
import { Routes, Route, NavLink } from 'react-router-dom';
import Select from 'react-select';
import React from 'react';

// Placeholder for item icon
const ItemIcon = () => <span className="item-icon" role="img" aria-label="Espada">🗡️</span>;
// Placeholder for shop badge
const ShopBadge = () => <span className="shop-badge" role="img" aria-label="Loja">🛒</span>;

const SLOTS_OPTIONS = [0, 1, 2, 3, 4].map(n => ({ value: n.toString(), label: `${n} slots` }));

function MainHeader() {
  return (
    <header className="main-header">
      <div className="header-logo">RT</div>
      <nav className="header-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
          Mercado
        </NavLink>
        <NavLink to="/calculadora" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
          Calculadora
        </NavLink>
      </nav>
    </header>
  );
}

function MainPage() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<ItemData[]>([]);
  const [allItems, setAllItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtributos, setSelectedAtributos] = useState<{ value: string; label: string }[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<{ value: string; label: string } | null>(null);
  const [atributosOptions, setAtributosOptions] = useState<{ value: string; label: string }[]>([]);
  const [atributosLoading, setAtributosLoading] = useState(false);
  const [atributosError, setAtributosError] = useState<string | null>(null);

  const API_URL = 'http://localhost:8080/api/market/items';
  const ATRIBUTOS_URL = 'http://localhost:8080/api/market/opts';

  useEffect(() => {
    setAtributosLoading(true);
    setAtributosError(null);
    axios.get(ATRIBUTOS_URL)
      .then(res => {
        if (Array.isArray(res.data)) {
          setAtributosOptions(res.data.map((attr: string) => ({ value: attr, label: attr })));
        } else {
          setAtributosOptions([]);
        }
      })
      .catch(() => setAtributosError('Erro ao carregar atributos'))
      .finally(() => setAtributosLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') {
      return;
    }

    setIsLoading(true);
    setSearchTerm(input);

    const requestUrl = `${API_URL}?item_name=${encodeURIComponent(input)}`;
    try {
      const response = await axios.get(requestUrl);
      setData(response.data || []);
      setAllItems(response.data || []);
    } catch (error) {
      setData([]);
      setAllItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setSearchTerm('');
    setData([]);
    setAllItems([]);
  };

  // Handler for react-select multi-select
  const handleAtributosChange = (selected: any) => {
    setSelectedAtributos(selected || []);
  };

  // Handler for react-select single-select
  const handleSlotsChange = (selected: any) => {
    setSelectedSlots(selected);
  };

  // Filtering logic for Filtrar button
  const handleFiltrar = () => {
    let filtered = allItems;
    // Filter by atributos
    if (selectedAtributos.length > 0) {
      const selectedPrefixes = selectedAtributos.map(opt => opt.value.replace(/\d+/g, 'X').replace(/X+/, ''));
      filtered = filtered.filter(item => {
        if (!Array.isArray(item.opts)) return false;
        // For each selected atributo, at least one item.opts must match the prefix (ignoring the number)
        return selectedPrefixes.every(prefix =>
          item.opts.some((opt: string) => {
            // Remove the number from opt for comparison
            const optPrefix = opt.replace(/\d+/g, 'X').replace(/X+/, '');
            return optPrefix === prefix;
          })
        );
      });
    }
    // Filter by slots
    if (selectedSlots && selectedSlots.value !== '') {
      filtered = filtered.filter(item => String(item.slot ?? 0) === selectedSlots.value);
    }
    setData(filtered);
  };

  const handleLimparFiltros = () => {
    setSelectedAtributos([]);
    setSelectedSlots(null);
    setData(allItems);
  };

  return (
    <div className="container">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Digite o nome do item abaixo:"
        />
        <button className="search-btn" type="submit" onClick={handleSubmit}>
          <span role="img" aria-label="Pesquisar">🔍</span> Pesquisar
        </button>
      </div>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={e => { e.preventDefault(); }}>
        <div className="filter-group">
          <label className="filter-label" htmlFor="atributos">Atributos</label>
          <Select
            id="atributos"
            isMulti
            options={atributosOptions}
            value={selectedAtributos}
            onChange={handleAtributosChange}
            placeholder={atributosLoading ? 'Carregando...' : atributosError ? atributosError : 'Selecione atributos...'}
            isLoading={atributosLoading}
            isDisabled={atributosLoading || !!atributosError}
            classNamePrefix="react-select"
            styles={{
              menu: (base) => ({ ...base, zIndex: 20 }),
              control: (base) => ({ ...base, minHeight: 38, borderRadius: 7 }),
              option: (base, state) => ({
                ...base,
                color: '#15344a',
                backgroundColor: state.isSelected
                  ? '#e6f0fa'
                  : state.isFocused
                  ? '#f0f6fb'
                  : '#fff',
                fontWeight: state.isSelected ? 700 : 500,
              }),
              multiValue: (base) => ({ ...base, backgroundColor: '#e6f0fa', color: '#15344a' }),
              multiValueLabel: (base) => ({ ...base, color: '#15344a' }),
              multiValueRemove: (base) => ({ ...base, color: '#15344a', ':hover': { backgroundColor: '#bfc9d8', color: '#15344a' } }),
            }}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label" htmlFor="slots">Slots</label>
          <Select
            id="slots"
            isMulti={false}
            options={SLOTS_OPTIONS}
            value={selectedSlots}
            onChange={handleSlotsChange}
            placeholder="Selecione"
            classNamePrefix="react-select"
            styles={{
              menu: (base) => ({ ...base, zIndex: 20 }),
              control: (base) => ({ ...base, minHeight: 38, borderRadius: 7 }),
              option: (base, state) => ({
                ...base,
                color: '#15344a',
                backgroundColor: state.isSelected
                  ? '#e6f0fa'
                  : state.isFocused
                  ? '#f0f6fb'
                  : '#fff',
                fontWeight: state.isSelected ? 700 : 500,
              }),
            }}
          />
        </div>
        <button className="filter-btn" type="button" onClick={handleFiltrar}>Filtrar</button>
        <button className="filter-btn" type="button" style={{ marginLeft: 8, background: '#bfc9d8', color: '#15344a' }} onClick={handleLimparFiltros}>Limpar filtros</button>
      </form>

      {/* Table Header */}
      <div className="table-header">
        <span>ITEM</span>
        <span>QTDE</span>
        <span>PREÇO</span>
        <span>LOJA</span>
      </div>

      {/* Loader */}
      {isLoading && <div className="loader">Loading...</div>}

      {/* No Results */}
      {!isLoading && searchTerm && data.length === 0 && (
        <div className="no-results">No items found for "{searchTerm}"</div>
      )}

      {/* Item Rows */}
      {data.map((item: any, idx) => (
        <div className={`item-row${idx === 0 ? ' highlight' : ''}`} key={`${item.id}-${idx}`}>
          {/* ITEM column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ItemIcon />
              <span className="item-name">{item.name || 'Espada Veterana'} [{item.slot ?? 0}]</span>
              <span className="item-id">(id: {item.id ?? '1188'})</span>
              {item.isPremium && <span className="badge">Assinante RT+</span>}
            </div>
            <div className="bonus-section">
              <div style={{ fontWeight: 'bold' }}>Bônus Aleatórios:</div>
              {((item.opts as string[] ?? []).length > 0) ? (
                (item.opts as string[] ?? []).map((opt: string, i: number) => <div key={i}>{opt}</div>)
              ) : (
                <div>Nenhum bônus</div>
              )}
            </div>
            {Array.isArray(item.cards) && item.cards.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {item.cards
                  .filter((card: any) => card && typeof card.card_name === 'string' && card.card_name.trim() !== '')
                  .map((card: any, idx: number) => (
                    <span key={`${card.card_id ?? 'noid'}-${idx}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#fff',
                      border: '2px solid #a00',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: '0.98em',
                      color: '#15344a',
                      fontWeight: 500
                    }}>
                      <span role="img" aria-label="Card" style={{ marginRight: 4, fontSize: '1.1em' }}>🃏</span> {card.card_name}
                    </span>
                  ))}
              </div>
            )}
          </div>
          {/* QTDE column */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity ?? 1}</div>
          {/* PREÇO column */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className={idx === 0 ? 'price-green' : 'price-blue'}>
              {item.price ? item.price.toLocaleString('pt-BR') : (idx === 0 ? '1.000.000' : '149.998')}
            </span>
          </div>
          {/* LOJA column */}
          <div>
            <div className="shop-info">
              <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                <ShopBadge />{item.shopName || (idx === 0 ? 'FFFFFFFF' : 'Ze Do Comercio')}
              </div>
              <div style={{ fontSize: '0.98em' }}>
                <span style={{ fontWeight: 'bold' }}>Vendedor:</span> {item.seller || (idx === 0 ? 'njordxl discord' : 'zedocomercio')}
              </div>
              <div style={{ fontSize: '0.98em' }}>
                <span style={{ fontWeight: 'bold' }}>Localização:</span> {item.location || (idx === 0 ? '@market 176/296' : '@market 263/163')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalculadoraPage() {
  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#0e7ad1', fontSize: '2.2rem', fontWeight: 700 }}>Calculadora</h1>
    </div>
  );
}

export default function App() {
  return (
    <>
      <MainHeader />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/calculadora" element={<CalculadoraPage />} />
      </Routes>
    </>
  );
}