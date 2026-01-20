
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyReportData, CollectionPlan, DelinquencyData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedTransaction {
  date: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
  entity?: string; // Cliente ou Fornecedor
}

/**
 * Processa qualquer documento financeiro (PDF, Imagem, Planilha base64) 
 * para extrair contas a pagar ou a receber.
 */
export const processFinancialDocument = async (
  base64Data: string, 
  mimeType: string, 
  context: 'payable' | 'receivable'
): Promise<ExtractedTransaction[]> => {
  const modelName = 'gemini-3-flash-preview';

  const contextText = context === 'payable' 
    ? "Contas a Pagar (identifique Fornecedores, Datas de Vencimento e Valores de Saída)" 
    : "Contas a Receber (identifique Clientes, Datas de Vencimento e Valores de Entrada)";

  try {
    const prompt = `
      Atue como um especialista em BPO Financeiro. Analise este documento que contém um relatório de ${contextText}.
      O documento pode vir de sistemas como Omie, Conta Azul, RD Station ou planilhas customizadas.
      
      Extraia rigorosamente:
      1. date: Data de vencimento (formato YYYY-MM-DD)
      2. description: Descrição do serviço ou produto
      3. value: Valor monetário (número positivo)
      4. entity: Nome do Cliente (se for receber) ou Fornecedor (se for pagar)
      5. type: 'entrada' para recebíveis ou 'saida' para pagáveis

      Retorne estritamente um array JSON de objetos. Se não encontrar dados claros, retorne um array vazio [].
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              value: { type: Type.NUMBER },
              entity: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['entrada', 'saida'] }
            },
            required: ['date', 'description', 'value', 'entity', 'type']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]") as ExtractedTransaction[];
  } catch (error) {
    console.error("Erro ao processar documento financeiro:", error);
    return [];
  }
};

// Funções anteriores mantidas para compatibilidade
export const processStatementFile = async (base64Data: string, mimeType: string): Promise<ExtractedTransaction[]> => {
  return processFinancialDocument(base64Data, mimeType, 'receivable');
};

export const generateFinancialReport = async (contextData: string): Promise<string> => {
  const modelName = 'gemini-3-flash-preview';
  try {
    const prompt = `Analise os dados e forneça um resumo executivo: ${contextData}`;
    const response = await ai.models.generateContent({ model: modelName, contents: prompt });
    return response.text || "";
  } catch (error) { return "Erro na IA."; }
};

export const generateCollectionPlan = async (clientName: string, debtData: DelinquencyData, toneOverride?: 'friendly' | 'firm' | 'legal'): Promise<CollectionPlan | null> => {
  const modelName = 'gemini-3-flash-preview';
  try {
    const prompt = `Gere plano de cobrança para ${clientName}. Tom: ${toneOverride}. Dados da dívida: ${JSON.stringify(debtData)}. 
    Retorne um JSON com as chaves: analysis, whatsappMessage, emailSubject, emailBody.`;
    const response = await ai.models.generateContent({ 
      model: modelName, 
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            whatsappMessage: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            emailBody: { type: Type.STRING }
          },
          required: ['analysis', 'whatsappMessage', 'emailSubject', 'emailBody']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
};

export const generateMeetingReport = async (clientName: string, month: string, summaryData: any): Promise<MonthlyReportData | null> => {
  const modelName = 'gemini-3-flash-preview';
  try {
    const prompt = `Gere relatório mensal para ${clientName} ref ${month}. Dados: ${JSON.stringify(summaryData)}`;
    const response = await ai.models.generateContent({ 
      model: modelName, 
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                revenue: { type: Type.NUMBER },
                expenses: { type: Type.NUMBER },
                result: { type: Type.NUMBER },
                delinquencyRate: { type: Type.NUMBER },
                aiComment: { type: Type.STRING }
              }
            },
            revenueByService: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            },
            expensesByCostCenter: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            },
            topClients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  percent: { type: Type.NUMBER }
                }
              }
            },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  message: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
};
