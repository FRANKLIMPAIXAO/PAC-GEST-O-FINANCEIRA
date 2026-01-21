
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyReportData, CollectionPlan, DelinquencyData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedTransaction {
  date: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
  entity?: string;
  installments?: Array<{ dueDate: string; value: number }>;
  products?: Array<{ name: string; quantity: number; unitPrice: number; ncm: string }>;
}

/**
 * Analisa XML de NF-e para extrair produtos (Estoque) e parcelas (Contas a Pagar).
 */
export const parseNfeXml = async (xmlContent: string): Promise<ExtractedTransaction | null> => {
  try {
    const prompt = `
      Você é um motor de leitura fiscal. Analise o XML da NF-e abaixo e extraia:
      1. entity: Razão Social do Emitente (Fornecedor)
      2. products: Lista de produtos com (name, quantity, unitPrice, ncm)
      3. installments: Lista de parcelas de pagamento se houver nas tags <fat> ou <dup> (dueDate, value)
      4. value: Valor total da nota.

      XML CONTENT:
      ${xmlContent.substring(0, 10000)} // Limite para evitar estouro de token
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            entity: { type: Type.STRING },
            value: { type: Type.NUMBER },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  ncm: { type: Type.STRING }
                }
              }
            },
            installments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dueDate: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Erro ao processar XML:", error);
    return null;
  }
};

export const processFinancialDocument = async (
  base64Data: string, 
  mimeType: string, 
  context: 'payable' | 'receivable'
): Promise<ExtractedTransaction[]> => {
  const modelName = 'gemini-3-flash-preview';

  try {
    const prompt = `
      Extraia dados financeiros deste ${mimeType === 'text/plain' ? 'XML/Texto' : 'Documento'}.
      Identifique data, descrição, valor e entidade.
    `;

    let parts: any[] = [{ text: prompt }];
    const supportedBinaryTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    
    if (supportedBinaryTypes.includes(mimeType)) {
      parts.push({ inlineData: { data: base64Data, mimeType } });
    } else {
      parts.push({ text: atob(base64Data) });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
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
              type: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const generateFinancialReport = async (contextData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Gere um resumo executivo: ${contextData}` 
    });
    return response.text || "";
  } catch (error) { return "Erro."; }
};

export const generateMeetingReport = async (clientName: string, month: string, summaryData: any): Promise<MonthlyReportData | null> => {
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Gere relatório: ${JSON.stringify(summaryData)}`,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
};

export const generateCollectionPlan = async (clientName: string, debtData: DelinquencyData, toneOverride?: string): Promise<CollectionPlan | null> => {
  try {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Plano de cobrança para ${clientName}`,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
};
