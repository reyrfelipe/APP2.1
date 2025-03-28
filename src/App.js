import { useState, useEffect } from "react";
import { ref, set, push, onValue } from "firebase/database";
import database from "./firebase.js";
import { remove, child } from "firebase/database";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const anioActual = new Date().getFullYear();
const personas = ["Felipe", "Fran"];
const categorias = [
  "Supermercado",
  "Lupo",
  "Auto",
  "Salud",
  "Luz",
  "Agua",
  "Gas",
  "Parafina",
  "Otro",
];
const categoriasDistribucion = [
  { nombre: "Gastos Básicos", porcentaje: 0.5 },
  { nombre: "Ahorros", porcentaje: 0.15 },
  { nombre: "Futuro", porcentaje: 0.1 },
  { nombre: "Gustos personales", porcentaje: 0.1 },
  { nombre: "Imprevistos", porcentaje: 0.1 },
  { nombre: "Regalos", porcentaje: 0.05 },
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#8dd1e1",
  "#d0ed57",
];

const inputStyle = {
  padding: "8px",
  margin: "5px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "100%",
};

const buttonStyle = {
  padding: "10px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  width: "100%",
  marginTop: "10px",
};

const sectionStyle = {
  margin: "20px 0",
  padding: "15px",
  background: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  overflowX: "auto",
  display: "block",
};

const thtdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};
export default function App() {
  const [mes, setMes] = useState(meses[new Date().getMonth()]);
  const [anio, setAnio] = useState(anioActual);

  const [dataPorPeriodo, setDataPorPeriodo] = useState(() => {
    const guardado = localStorage.getItem("finanzas-datos");
    return guardado ? JSON.parse(guardado) : {};
  });

  const [montoIngreso, setMontoIngreso] = useState("");
  const [personaIngreso, setPersonaIngreso] = useState(personas[0]);
  const [montoGasto, setMontoGasto] = useState("");
  const [categoriaGasto, setCategoriaGasto] = useState(categorias[0]);
  const [personaGasto, setPersonaGasto] = useState(personas[0]);
  const [categoriaAsignada, setCategoriaAsignada] = useState(
    categoriasDistribucion[0].nombre
  );

  const key = `${mes}-${anio}`;
  const ingresos = dataPorPeriodo[key]?.ingresos || [];
  const gastos = dataPorPeriodo[key]?.gastos || [];

  useEffect(() => {
    const datosRef = ref(database, `finanzas/${anio}/${mes}`);
    onValue(datosRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDataPorPeriodo((prev) => ({
        ...prev,
        [`${mes}-${anio}`]: {
          ingresos: data.ingresos ? Object.values(data.ingresos) : [],
          gastos: data.gastos ? Object.values(data.gastos) : [],
        },
      }));
    });
  }, [mes, anio]);

  const totalIngresos = ingresos.reduce((acc, i) => acc + i.monto, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);

  const agregarIngreso = () => {
    if (!montoIngreso) return;
    const ingresoRef = ref(database, `finanzas/${anio}/${mes}/ingresos`);
    const nuevoIngreso = {
      monto: parseInt(montoIngreso),
      persona: personaIngreso,
    };
    push(ingresoRef, nuevoIngreso);
    setMontoIngreso("");
  };

  const eliminarIngreso = (idx) => {
    const ingresoRef = ref(database, `finanzas/${anio}/${mes}/ingresos`);
    onValue(
      ingresoRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const keys = Object.keys(data);
        const keyAEliminar = keys[idx];
        if (keyAEliminar) {
          const refAEliminar = child(ingresoRef, keyAEliminar);
          remove(refAEliminar);
        }
      },
      { onlyOnce: true }
    );
  };

  const agregarGasto = () => {
    if (!montoGasto) return;
    const gastoRef = ref(database, `finanzas/${anio}/${mes}/gastos`);
    const nuevoGasto = {
      monto: parseInt(montoGasto),
      categoria: categoriaGasto,
      persona: personaGasto,
      categoriaAsignada,
    };
    push(gastoRef, nuevoGasto);
    setMontoGasto("");
  };

  const eliminarGasto = (idx) => {
    const gastoRef = ref(database, `finanzas/${anio}/${mes}/gastos`);
    onValue(
      gastoRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const keys = Object.keys(data);
        const keyAEliminar = keys[idx];
        if (keyAEliminar) {
          const refAEliminar = child(gastoRef, keyAEliminar);
          remove(refAEliminar);
        }
      },
      { onlyOnce: true }
    );
  };

  const dataDistribucion = categoriasDistribucion.map((cat) => {
    const total = totalIngresos * cat.porcentaje;
    const gastado = gastos
      .filter((g) => g.categoriaAsignada === cat.nombre)
      .reduce((acc, g) => acc + g.monto, 0);

    return { ...cat, total, gastado, saldo: total - gastado };
  });
  return (
    <div
      style={{
        padding: 20,
        maxWidth: 600,
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>📒 Finanzas Familiares</h2>

      <div style={sectionStyle}>
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          style={inputStyle}
        >
          {meses.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          style={inputStyle}
        />

        <h3>Agregar Ingreso</h3>
        <input
          type="number"
          value={montoIngreso}
          onChange={(e) => setMontoIngreso(e.target.value)}
          placeholder="Monto"
          style={inputStyle}
        />
        <select
          value={personaIngreso}
          onChange={(e) => setPersonaIngreso(e.target.value)}
          style={inputStyle}
        >
          {personas.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button onClick={agregarIngreso} style={buttonStyle}>
          Agregar Ingreso
        </button>

        <p>💰 Total: ${totalIngresos.toLocaleString()}</p>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtdStyle}>Monto</th>
              <th style={thtdStyle}>Persona</th>
              <th style={thtdStyle}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((i, idx) => (
              <tr key={idx}>
                <td style={thtdStyle}>${i.monto.toLocaleString()}</td>
                <td style={thtdStyle}>{i.persona}</td>
                <td style={thtdStyle}>
                  <button
                    onClick={() => eliminarIngreso(idx)}
                    style={{ ...buttonStyle, background: "#e74c3c" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <h3>Agregar Gasto</h3>
        <input
          type="number"
          value={montoGasto}
          onChange={(e) => setMontoGasto(e.target.value)}
          placeholder="Monto"
          style={inputStyle}
        />
        <select
          value={categoriaGasto}
          onChange={(e) => setCategoriaGasto(e.target.value)}
          style={inputStyle}
        >
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={personaGasto}
          onChange={(e) => setPersonaGasto(e.target.value)}
          style={inputStyle}
        >
          {personas.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select
          value={categoriaAsignada}
          onChange={(e) => setCategoriaAsignada(e.target.value)}
          style={inputStyle}
        >
          {categoriasDistribucion.map((c) => (
            <option key={c.nombre}>{c.nombre}</option>
          ))}
        </select>
        <button onClick={agregarGasto} style={buttonStyle}>
          Agregar Gasto
        </button>

        <p>📉 Total: ${totalGastos.toLocaleString()}</p>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtdStyle}>Monto</th>
              <th style={thtdStyle}>Categoría</th>
              <th style={thtdStyle}>Persona</th>
              <th style={thtdStyle}>Asignada</th>
              <th style={thtdStyle}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g, idx) => (
              <tr key={idx}>
                <td style={thtdStyle}>${g.monto.toLocaleString()}</td>
                <td style={thtdStyle}>{g.categoria}</td>
                <td style={thtdStyle}>{g.persona}</td>
                <td style={thtdStyle}>{g.categoriaAsignada}</td>
                <td style={thtdStyle}>
                  <button
                    onClick={() => eliminarGasto(idx)}
                    style={{ ...buttonStyle, background: "#e74c3c" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={sectionStyle}>
        <h3>Distribución Mensual</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtdStyle}>Categoría</th>
              <th style={thtdStyle}>%</th>
              <th style={thtdStyle}>Asignado</th>
              <th style={thtdStyle}>Gastado</th>
              <th style={thtdStyle}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {dataDistribucion.map((cat, idx) => (
              <tr key={idx}>
                <td style={thtdStyle}>{cat.nombre}</td>
                <td style={thtdStyle}>{(cat.porcentaje * 100).toFixed(0)}%</td>
                <td style={thtdStyle}>${cat.total.toLocaleString()}</td>
                <td style={thtdStyle}>${cat.gastado.toLocaleString()}</td>
                <td
                  style={{
                    ...thtdStyle,
                    color: cat.saldo < 0 ? "red" : "green",
                  }}
                >
                  ${cat.saldo.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", overflowX: "auto", marginTop: "30px" }}>
        <h3>📊 Gráficos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataDistribucion}>
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Asignado" />
            <Bar dataKey="gastado" fill="#82ca9d" name="Gastado" />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataDistribucion.filter((d) => d.gastado > 0)}
              dataKey="gastado"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {dataDistribucion.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => {
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.json_to_sheet(ingresos),
              "Ingresos"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.json_to_sheet(gastos),
              "Gastos"
            );
            XLSX.utils.book_append_sheet(
              wb,
              XLSX.utils.json_to_sheet(dataDistribucion),
              "Distribución"
            );
            XLSX.writeFile(wb, `Finanzas_${mes}_${anio}.xlsx`);
          }}
          style={buttonStyle}
        >
          📤 Exportar a Excel
        </button>
      </div>
    </div>
  );
}
