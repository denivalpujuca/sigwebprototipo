export interface Vehicle {
  id: number;
  nome: string;
  placa: string;
  chassi: string;
  volume: number;
  marca: string;
  modelo: string;
  tipo: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'INATIVO';
}

export const vehicles: Vehicle[] = [
  { id: 106, nome: "SCANIA R 420A6X4", placa: "OEH8629", chassi: "9BSR6X400C3699158", volume: 21000, marca: "CATERPILLAR", modelo: "140B", tipo: "Caminhão Traçado", status: "DISPONIVEL" },
  { id: 112, nome: "MERCEDES BENZ AXOR 3344", placa: "PXI1A22", chassi: "9BSR6X411B2238472", volume: 18000, marca: "VOLVO", modelo: "FMX 460", tipo: "Basculante", status: "MANUTENCAO" },
  { id: 94, nome: "VOLKSWAGEN CONSTELLATION 24.280", placa: "QOE9481", chassi: "9BSR6X499A1122847", volume: 15000, marca: "FORD", modelo: "CARGO 2428", tipo: "Tanque Pipa", status: "INATIVO" },
  { id: 201, nome: "IVECO TECTOR 240E28", placa: "RKY5F11", chassi: "9BSR6X400L9938812", volume: 12500, marca: "SCANIA", modelo: "P310", tipo: "Carga Geral", status: "DISPONIVEL" },
  { id: 107, nome: "VOLVO FH 440", placa: "OEH8630", chassi: "9BSR6X400C3699159", volume: 20000, marca: "VOLVO", modelo: "FH 440", tipo: "Caminhão", status: "DISPONIVEL" },
  { id: 108, nome: "MERCEDES AXOR", placa: "OEH8631", chassi: "9BSR6X400C3699160", volume: 18000, marca: "MERCEDES", modelo: "AXOR 1844", tipo: "Caminhão", status: "MANUTENCAO" },
  { id: 109, nome: "FORD CARGO", placa: "OEH8632", chassi: "9BSR6X400C3699161", volume: 15000, marca: "FORD", modelo: "Cargo 2629", tipo: "Caminhão", status: "DISPONIVEL" },
  { id: 110, nome: "IVECO STRALIS", placa: "OEH8633", chassi: "9BSR6X400C3699162", volume: 19000, marca: "IVECO", modelo: "Stralis AS440", tipo: "Caminhão", status: "DISPONIVEL" },
  { id: 111, nome: "DAF CF85", placa: "OEH8634", chassi: "9BSR6X400C3699163", volume: 20500, marca: "DAF", modelo: "CF85 410", tipo: "Caminhão", status: "INATIVO" },
  { id: 69, nome: "CATERPILLAR 140B", placa: "OEH8635", chassi: "CAT0140B123456789", volume: 2500, marca: "CATERPILLAR", modelo: "140B", tipo: "Escavadeira", status: "DISPONIVEL" },
  { id: 70, nome: "KOMATSU WA380", placa: "OEH8636", chassi: "KOMWA38012345678", volume: 3200, marca: "KOMATSU", modelo: "WA380-8", tipo: "Carregadeira", status: "DISPONIVEL" },
  { id: 71, nome: "VOLVO L150H", placa: "OEH8637", chassi: "VNL150H123456789", volume: 4500, marca: "VOLVO", modelo: "L150H", tipo: "Carregadeira", status: "MANUTENCAO" },
  { id: 72, nome: "CATERPILLAR 950M", placa: "OEH8638", chassi: "CAT0950M98765432", volume: 5200, marca: "CATERPILLAR", modelo: "950M", tipo: "Carregadeira", status: "DISPONIVEL" },
  { id: 73, nome: "HYUNDAI HL770", placa: "OEH8639", chassi: "HYUHL77011223344", volume: 4800, marca: "HYUNDAI", modelo: "HL770-9A", tipo: "Carregadeira", status: "DISPONIVEL" },
  { id: 74, nome: "JCB 3CX", placa: "OEH8640", chassi: "JCB3CX1234567890", volume: 600, marca: "JCB", modelo: "3CX", tipo: "Escavadeira", status: "DISPONIVEL" },
  { id: 75, nome: "CASE CX210", placa: "OEH8641", chassi: "CASE2101234567890", volume: 900, marca: "CASE", modelo: "CX210D", tipo: "Escavadeira", status: "INATIVO" },
  { id: 76, nome: "NEW HOLLAND B110", placa: "OEH8642", chassi: "NHB1109876543210", volume: 1100, marca: "NEW HOLLAND", modelo: "B110B", tipo: "Trator", status: "DISPONIVEL" },
  { id: 77, nome: "KUBOTA M7-172", placa: "OEH8643", chassi: "KUBM717212345678", volume: 800, marca: "KUBOTA", modelo: "M7-172", tipo: "Trator", status: "DISPONIVEL" },
  { id: 78, nome: "JOHN DEERE 644K", placa: "OEH8644", chassi: "JD644K1234567890", volume: 3600, marca: "JOHN DEERE", modelo: "644K", tipo: "Carregadeira", status: "MANUTENCAO" },
  { id: 79, nome: "LIEBHERR LTM 1100", placa: "OEH8645", chassi: "LH1100X123456789", volume: 40000, marca: "LIEBHERR", modelo: "LTM 1100-4.2", tipo: "Guindaste", status: "DISPONIVEL" },
  { id: 80, nome: "GROVE GMK5150L", placa: "OEH8646", chassi: "GRVMK51501234567", volume: 45000, marca: "GROVE", modelo: "GMK5150L", tipo: "Guindaste", status: "DISPONIVEL" },
  { id: 81, nome: "TADANO ATF70G", placa: "OEH8647", chassi: "TAD70G12345678901", volume: 42000, marca: "TADANO", modelo: "ATF70G-4", tipo: "Guindaste", status: "DISPONIVEL" },
  { id: 82, nome: "TEREX AC 100/10L", placa: "OEH8648", chassi: "TRXAC10012345678", volume: 38000, marca: "TEREX", modelo: "AC 100/10L", tipo: "Guindaste", status: "INATIVO" },
];