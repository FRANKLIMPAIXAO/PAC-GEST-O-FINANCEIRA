
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyReportData, CollectionPlan, DelinquencyData } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedTransaction {
  date: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
}

export const processStatementFile = async (base64Data: string, mimeType: string): Promise<ExtractedTransaction[]> => {
  const modelName = 'gemini-3-flash-preview';

  try {
    const prompt = `
      Analise este extrato bancário e extraia todas as transações financeiras.
      Para cada transação, identifique:
      1. Data (formato YYYY-MM-DD)
      2. Descrição (nome do favorecido ou histórico)
      3. Valor (apenas o número positivo)
      4. Tipo ('entrada' para créditos/recebimentos ou 'saida' para débitos/pagamentos)

      Retorne estritamente um array JSON de objetos.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ],
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
              type: { type: Type.STRING, enum: ['entrada', 'saida'] }
            },
            required: ['date', 'description', 'value', 'type']
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as ExtractedTransaction[];
  } catch (error) {
    console.error("Erro ao processar extrato com Gemini:", error);
    return [];
  }
};

export const generateFinancialReport = async (contextData: string): Promise<string> => {
  const modelName = 'gemini-3-flash-preview';

  try {
    const prompt = `
      Atue como um analista financeiro sênior de uma empresa de BPO.
      Analise os seguintes dados financeiros do dashboard e forneça um resumo executivo de 3 parágrafos.
      Foque em riscos, oportunidades e tendências.
      
      Dados:
      ${contextData}

      Responda em Markdown.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao comunicar com a IA.";
  }
};

export const generateCollectionPlan = async (
  clientName: string, 
  debtData: DelinquencyData, 
  toneOverride?: 'friendly' | 'firm' | 'legal'
): Promise<CollectionPlan | null> => {
  const modelName = 'gemini-3-flash-preview';
    
  try {
    let toneDescription = "";
    
    // Define tone based on override or automatic logic
    if (toneOverride === 'friendly') {
      toneDescription = "amigável, empático e focado em entender se houve algum erro no processamento do cliente.";
    } else if (toneOverride === 'firm') {
      toneDescription = "firme, assertivo, cobrando uma previsão de pagamento imediata e mencionando a importância da pontualidade para a manutenção do serviço.";
    } else if (toneOverride === 'legal') {
      toneDescription = "formal, jurídico e administrativo, alertando sobre a suspensão de serviços de BPO e envio para órgãos de proteção ao crédito.";
    } else {
      // Automatic logic if no override
      if (debtData.daysLate > 45) {
        toneDescription = "assertiva, formal e alertando sobre possíveis medidas administrativas.";
      } else if (debtData.daysLate > 15) {
        toneDescription = "firme, cobrando um posicionamento imediato sobre a previsão de pagamento.";
      } else {
        toneDescription = "amigável e lembrete cordial.";
      }
    }

    const formattedValue = debtData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const formattedDate = new Date(debtData.lastPayment).toLocaleDateString('pt-BR');

    const prompt = `
      Atue como um especialista em recuperação de crédito B2B para uma empresa de BPO Financeiro.
      Gere um plano de cobrança altamente personalizado para o cliente: ${clientName}.
      
      Dados da dívida:
      Valor Total: R$ ${formattedValue}
      Dias em atraso: ${debtData.daysLate} dias
      Quantidade de faturas: ${debtData.invoicesCount}
      Último pagamento registrado: ${formattedDate}

      O tom da abordagem deve ser: ${toneDescription}.

      Instruções para personalização:
      1. Mencione o valor em aberto (R$ ${formattedValue}) nos scripts.
      2. No WhatsApp, use emojis de forma moderada e seja direto.
      3. No Email, use uma estrutura profissional com saudações adequadas ao tom solicitado.
      4. Na análise, explique por que essa abordagem específica foi escolhida.

      A resposta deve ser um JSON contendo:
      1. analysis: Uma análise estratégica da situação em 1 parágrafo.
      2. whatsappMessage: Um script pronto para envio no WhatsApp.
      3. emailSubject: Assunto do email.
      4. emailBody: Corpo do email completo.
    `;

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
            emailBody: { type: Type.STRING },
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as CollectionPlan;
  } catch (error) {
    console.error("Erro ao gerar plano de cobrança:", error);
    return null;
  }
};

export const generateMeetingReport = async (clientName: string, month: string, summaryData: any): Promise<MonthlyReportData | null> => {
  const modelName = 'gemini-3-flash-preview';

  try {
    const prompt = `
      Gere um relatório financeiro mensal detalhado em JSON para o cliente: ${clientName}, mês: ${month}.
      Baseie-se nestes dados: ${JSON.stringify(summaryData)}
    `;

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
                properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }
              }
            },
            expensesByCostCenter: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }
              }
            },
            topClients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER }, percent: { type: Type.NUMBER } }
              }
            },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { type: { type: Type.STRING }, message: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as MonthlyReportData;
  } catch (error) {
    console.error("Erro na geração do relatório:", error);
    return null;
  }
};
