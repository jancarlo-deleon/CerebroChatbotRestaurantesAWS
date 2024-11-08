import axios from 'axios';
import dotenv from 'dotenv'; 

//Obtener las variables de sesion desde el .env
dotenv.config();

//Constantes
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
const OPENAI_API_URL = process.env.OPENAI_API_URL;

export const handler = async (event) => {



}



//Metodos para consultar a ChatGPT a traves de la API de OpenAI
async function llamadaAChatGPTParaOrdenar(userInput) {

    const systemPrompt = `Eres un asistente especializado en tomar órdenes para una pizzería que maneja un menú específico con solo 4 productos:

    1. Combo 1 ($4.75):
       - 1 Pizza Personal de 1 ingrediente (Peperoni o Jamón)
       - Pan con ajo supremo (2 rodajas)
       - 1 Soda Pepsi de 12 onz.

    2. Banquete 1 ($12.75):
       - 1 Pizza Gigante de 8 pedazos (Peperoni o Jamón)
       - Orden de Minipalitroques (6 piezas)
       - Pan con ajo supremo (4 rodajas)
       - 1 Soda Pepsi de 1.5 ltrs

    3. Banquete 2 ($17.25):
       - 2 Pizzas Gigante de 8 pedazos (Peperoni o Jamón)
       - Orden de Minipalitroques (6 piezas)
       - Pan con ajo supremo (4 rodajas)
       - 1 Soda Pepsi de 1.5 ltrs

    4. Banquete 3 ($21.75):
       - 1 Pizza Super Gigante de 12 pedazos (Peperoni o Jamón)
       - Orden de Nuditos (6 piezas)
       - Orden de Salchipanes (6 piezas)
       - Orden de Alitas (6 piezas)
       - 1 Soda Pepsi de 1.5 ltrs

    Solo puedes procesar órdenes que incluyan estos productos exactos. Los únicos ingredientes disponibles para las pizzas son Peperoni y Jamón.
    Y tambien puedes procesar comentarios, los cuales serian cosas extras que pediria el cliente como por ejemplo servilletas y entre otras cosas
    Igual puedes procesar si se escriben de manera distinta los elementos del menu, como combo #1, banquete numero 3, etc. y si se escribe combos o banquete en singular o plural
        Toda escritura que haga referencia al menu de los 4 elementos que se te listaron es válida.`;

    const userPrompt = `Analiza el siguiente pedido de pizzería y extrae la información relevante:
    "${userInput}"
    
    Debes responder con un objeto JSON que contenga exactamente estas propiedades:
    {
        "ordenInvalida": " tienes que escribir lo siguiente para este clave valor: "Lo siento, no se puede procesar tu pedido ya que estas pidiendo algo que no existe en nuestro menu". Si por otro lado, la orden es válida, dejar vacío",
        "orden": "Solo incluir un resumen conciso del pedido si es válido",
        "unidadesCombo1": "número de Combo 1 pedidos",
        "ingredienteCombo1": "Especificar ingredientes según estas reglas:
            - Si no se especifica: 'Peperoni'
            - Si se pide otro ingrediente que no sea Peperoni o Jamón: 'Pepperoni'
            - Si son múltiples unidades con mismo ingrediente: 'Todas de Peperoni' o 'Todas de Jamón'
            - Si son diferentes ingredientes: 'X de Jamón y Y de Peperoni'",
        "unidadesBanquete1": "número de Banquete 1 pedidos",
        "ingredienteBanquete1": "Aplican las mismas reglas de ingredientes que Combo 1",
        "unidadesBanquete2": "número de Banquete 2 pedidos",
        "ingredienteBanquete2": "Aplican las mismas reglas de ingredientes que Combo 1",
        "unidadesBanquete3": "número de Banquete 3 pedidos",
        "ingredienteBanquete3": "Aplican las mismas reglas de ingredientes que Combo 1",
        "totalUnidades": "suma total de unidades pedidas",
        "comentarios": "información adicional sobre especificaciones del cliente",
        "totalCosto": "cálculo del costo total basado en: Combo 1 = $4.75, Banquete 1 = $12.75, Banquete 2 = $17.25, Banquete 3 = $21.75"
    }

    Solo responde con el objeto JSON, sin texto adicional ni marcadores de código.`;

    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4o-mini",  
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3  
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}

async function llamadaAChatGPTParaAgregarAOrden(userInput, ordenActual) {

    const systemPrompt = `Eres un asistente especializado en tomar órdenes para una pizzería que maneja un menú específico con solo 4 productos:

    1. Combo 1 ($4.75):
       - 1 Pizza Personal de 1 ingrediente (Peperoni o Jamón)
       - Pan con ajo supremo (2 rodajas)
       - 1 Soda Pepsi de 12 onz.

    2. Banquete 1 ($12.75):
       - 1 Pizza Gigante de 8 pedazos (Peperoni o Jamón)
       - Orden de Minipalitroques (6 piezas)
       - Pan con ajo supremo (4 rodajas)
       - 1 Soda Pepsi de 1.5 ltrs

    3. Banquete 2 ($17.25):
       - 2 Pizzas Gigante de 8 pedazos (Peperoni o Jamón)
       - Orden de Minipalitroques (6 piezas)
       - Pan con ajo supremo (4 rodajas)
       - 1 Soda Pepsi de 1.5 ltrs

    4. Banquete 3 ($21.75):
       - 1 Pizza Super Gigante de 12 pedazos (Peperoni o Jamón)
       - Orden de Nuditos (6 piezas)
       - Orden de Salchipanes (6 piezas)
       - Orden de Alitas (6 piezas)
       - 1 Soda Pepsi de 1.5 ltrs

    Solo puedes procesar órdenes que incluyan estos productos exactos. Los únicos ingredientes disponibles para las pizzas son Peperoni y Jamón.
    Tu tarea es procesar adiciones a órdenes existentes, sumando las nuevas cantidades a las existentes y tambien en caso se indique, remover elementos de la orden y actualizar la informacion.
     Y tambien puedes procesar comentarios, los cuales serian cosas extras que pediria el cliente como por ejemplo servilletas y entre otras cosas`;

    const userPrompt = `Analiza el siguiente pedido adicional para una orden de pizzería existente:
    
    Orden actual:
    - Orden: ${ordenActual.orden}
    - Combo 1: ${ordenActual.unidadesCombo1} (${ordenActual.ingredienteCombo1})
    - Banquete 1: ${ordenActual.unidadesBanquete1} (${ordenActual.ingredienteBanquete1})
    - Banquete 2: ${ordenActual.unidadesBanquete2} (${ordenActual.ingredienteBanquete2})
    - Banquete 3: ${ordenActual.unidadesBanquete3} (${ordenActual.ingredienteBanquete3})
    - Total unidades actuales: ${ordenActual.totalUnidades}
    - Total costo actual: $${ordenActual.totalCosto}
    - Comentarios actuales: ${ordenActual.comentarios}

    Pedido adicional del cliente:
    "${userInput}"
    
    Debes devolver un objeto JSON exactamente con estas propiedades:
    {
        "orden": "Solo incluir un resumen conciso del pedido actualizado",
        "unidadesCombo1": "número TOTAL de Combo 1 (existentes + nuevos)",
        "ingredienteCombo1": "Especificar ingredientes según estas reglas:
            - Si no se especifica: 'Peperoni'
            - Si se pide otro ingrediente que no sea Peperoni o Jamón: 'Pepperoni'
            - Si son múltiples unidades con mismo ingrediente: 'Todas de Peperoni' o 'Todas de Jamón'
            - Si son diferentes ingredientes: 'X de Jamón y Y de Peperoni'",
        "unidadesBanquete1": "número TOTAL de Banquete 1 (existentes + nuevos)",
        "ingredienteBanquete1": "Aplican las mismas reglas de ingredientes que Combo 1",
        "unidadesBanquete2": "número TOTAL de Banquete 2 (existentes + nuevos)",
        "ingredienteBanquete2": "Aplican las mismas reglas de ingredientes que Combo 1",
        "unidadesBanquete3": "número TOTAL de Banquete 3 (existentes + nuevos)",
        "ingredienteBanquete3": "Aplican las mismas reglas de ingredientes que Combo 1",
        "totalUnidades": "suma TOTAL de todas las unidades (existentes + nuevas)",
        "comentarios": "combina los comentarios existentes con los nuevos si los hay",
        "totalCosto": "cálculo del costo total basado en: Combo 1 = $4.75, Banquete 1 = $12.75, Banquete 2 = $17.25, Banquete 3 = $21.75"
    }

    Solo responde con el objeto JSON, sin texto adicional ni marcadores de código.`;

    try {
        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para adición a orden:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        if (error.response) {
            console.error("Detalles del error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }
        throw error;
    }
    
}

async function verificarSiEsSeOrdenaDirectamente(userInput) {

    try {
        const systemPrompt = `Eres un asistente especializado en analizar si un texto contiene una orden directa para una pizzería.
        Debes verificar si el texto incluye menciones específicas a productos del menú con cantidades.
        
        El menú incluye:
        - Combo 1
        - Banquete 1
        - Banquete 2
        - Banquete 3
        
        Igual puedes procesar si se escriben de manera distinta, como combo #1, banquete numero 3, etc.
        Toda escritura que haga referencia al menu de los 4 elementos que se te listaron es válida.`;

        const userPrompt = `Analiza el siguiente texto y determina si contiene una orden directa con productos y cantidades:
        "${userInput}"
        
        Responde solo con un objeto JSON con este formato:
        {
            "isDirectOrder": boolean,
            "reason": "Explicación breve de por qué es o no una orden directa"
        }`;

        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta");
        }

        const result = JSON.parse(jsonMatch[0]);
        return result.isDirectOrder;

    } catch (error) {
        console.error("Error al verificar si es orden directa:", error);
        return false;
    }
}

async function extraerInformacionEnvioCliente(userInput) {

    try {
        const systemPrompt = `Eres un asistente especializado en extraer información de pedidos para una pizzería.
        Debes analizar el texto del cliente y extraer la siguiente información si está presente:
        - Nombre del cliente
        - Número de teléfono
        - Método de pago (efectivo o tarjeta)
        - Dirección de entrega o si pasa a recoger

        Debes ser flexible en la interpretación pero preciso en la extracción.`;

        const userPrompt = `Analiza el siguiente texto y extrae la información del pedido:
        "${userInput}"
        
        Responde solo con un objeto JSON con este formato:
        {
            "nombreCliente": "nombre completo, o sea nombre ya apellidos. Si se encuentran ambos. Devuelve null si no",
            "telefonoCliente": "número de telefono si se encuentra, null si no",
            "metodoPago": "método de pago si se encuentra, null si no",
            "direccionEntrega": "dirección de entrega o la indicacion de pasar a recoger al establecimiento si se encuentra, null si no"
        }`;

        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de OpenAI:", JSON.stringify(response.data, null, 2));

        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta");
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error("Error al procesar input con OpenAI:", error);
        return null;
    }
}

async function consultarElementosIndividualesOpenAI(userInput) {

    try {
        const systemPrompt = `Eres un asistente especializado en analizar si un texto hace referencia a elementos específicos del menú de una pizzería.
        
        El menú incluye:
        - Combo 1
        - Banquete 1
        - Banquete 2
        - Banquete 3
        
        Analiza el texto y determina si hace referencia a alguno de estos elementos.
        Si el texto hace referencia a algún elemento del menú, devuelve exactamente uno de estos valores:
        - "Combo 1"
        - "Banquete 1"
        - "Banquete 2"
        - "Banquete 3"
        
        Ten en cuenta variaciones en la escritura como "combo #1", "banquete numero 3", etc.`;

        const userPrompt = `Analiza el siguiente texto y determina si hace referencia a algún elemento del menú:
        "${userInput}"
        
        Responde solo con un objeto JSON con este formato:
        {
            "valor": "nombre_exacto_del_elemento" // Debe ser uno de los 4 valores especificados
        }
        Si no hace referencia a ningún elemento del menú, devuelve null como valor.`;

        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta");
        }

        console.log('[-] JSON extraído de la respuesta:', jsonMatch[0]);
        
        const result = JSON.parse(jsonMatch[0]);
        console.log('[-] Resultado parseado:', result);

        return result.valor; 

    } catch (error) {
        console.error("Error al consultar OpenAI:", error);
        return null;
    }
}

async function consultarPreciosIndividualesOpenAI(userInput) {


    try {
        const systemPrompt = `Eres un asistente especializado en analizar si un texto hace referencia a consultas de precios de elementos específicos del menú de una pizzería.
        
        El menú incluye:
        - Combo 1
        - Banquete 1
        - Banquete 2
        - Banquete 3
        
        Analiza el texto y determina si está preguntando por el precio de alguno de estos elementos.
        Si el texto hace referencia a algún elemento del menú, devuelve exactamente uno de estos valores:
        - "Combo 1"
        - "Banquete 1"
        - "Banquete 2"
        - "Banquete 3"
        
        Ten en cuenta variaciones en la escritura como "cuánto cuesta el combo 1", "precio del banquete 3", etc.`;

        const userPrompt = `Analiza el siguiente texto y determina si pregunta por el precio de algún elemento del menú:
        "${userInput}"
        
        Responde solo con un objeto JSON con este formato:
        {
            "valor": "nombre_exacto_del_elemento" // Debe ser uno de los 4 valores especificados
        }
        Si no hace referencia al precio de ningún elemento del menú, devuelve null como valor.`;

        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log("No se pudo extraer JSON válido de la respuesta");
            return null;
        }

        console.log('[-] JSON extraído de la respuesta:', jsonMatch[0]);
        
        const result = JSON.parse(jsonMatch[0]);
        console.log('[-] Resultado parseado:', result);

        return result.valor;

    } catch (error) {
        console.error("Error al consultar OpenAI:", error);
        return null;
    }
}