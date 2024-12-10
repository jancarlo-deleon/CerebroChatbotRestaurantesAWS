import axios from 'axios';
import dotenv from 'dotenv';

//Obtener las variables de sesion desde el .env
dotenv.config();

//Constantes
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL;
const SHEET_BEST_API_URL = process.env.SHEET_BEST_API_URL;
const MAX_FALLBACKS = 5;

export const handler = async (event) => {

    console.log("Evento recibido:", JSON.stringify(event, null, 2));

    let sessionAttributes = event.sessionState.sessionAttributes || {};
    console.log("Atributos de sesión actuales:", JSON.stringify(sessionAttributes, null, 2));

    let userInput = event.inputTranscript.toLowerCase();
    console.log("Input obtenido de la conversación: ", userInput);

    let intentName = event.sessionState.intent.name;
    console.log("Intent recibido:", intentName);

    if (intentName == 'InicioIntent') {
        console.log("Se esta activando esta parte por medio de InicioIntent");

        const chatGPTResponse = await interpretarIntent(userInput);

        // Extraer el JSON de la respuesta de ChatGPT
        const jsonMatch = chatGPTResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta de ChatGPT relacionada con la interpretacion de intención");
        }

        const intentInfo = JSON.parse(jsonMatch[0]);
        console.log("El contenido de la intrepretación del input para manejar el intent es: ", intentInfo);

        return handlerIntents(event, sessionAttributes, intentInfo);
    }

    if (intentName == 'OrdenarIntent') {
        console.log("Se esta activando esta parte por medio de OrdenarIntent");

        return handleOrdenarIntent(event, sessionAttributes, userInput);

    }

    if (intentName == 'AgregarAOrdenIntent') {
        console.log("Se esta activando esta parte por medio de AgregarAOrdenIntent");

        return handleAgregarAOrdenIntent(event, sessionAttributes, userInput);

    }

    if (intentName == 'CancelarOrdenIntent') {
        console.log("Se esta activando esta parte por medio de CancelarOrdenIntent");

        return handleCancelarOrdenIntent(event, sessionAttributes);

    }

    if (intentName == 'FinalizarOrdenIntent') {
        console.log("Se esta activando esta parte por medio de FinalizarOrdenIntent");

        return handleFinalizarOrdenIntent(event, sessionAttributes);

    }

    if (intentName == 'MenuIntent') {
        console.log("Se esta activando esta parte por medio de MenuIntent");

        handleConsultarMenuIntent(event, sessionAttributes, userInput);

    }

    if (intentName == 'GraciasIntent') {
        console.log("Se esta activando esta parte por medio de GraciasIntent");

        return handleAgradecimientoIntent(event, sessionAttributes, userInput);

    }

    if (intentName == 'VisualizarIntent') {
        console.log("Se esta activando esta parte por medio de VisualizarIntent");

        return handleVisualizarIntent(event, sessionAttributes, userInput);

    }

    if (intentName == 'ConectarAAgenteIntent') {
        console.log("Se esta activando esta parte por medio de ConectarAAgenteIntent");

        return handleConectarAAgenteIntent(event, sessionAttributes, userInput);

    }

    const chatGPTResponse = await interpretarIntent(userInput);

    // Extraer el JSON de la respuesta de ChatGPT
    const jsonMatch = chatGPTResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("No se pudo extraer JSON válido de la respuesta de ChatGPT relacionada con la interpretacion de intención");
    }

    const intentInfo = JSON.parse(jsonMatch[0]);
    console.log("El contenido de la intrepretación del input para manejar el intent es: ", intentInfo);

    return handlerIntents(event, sessionAttributes, intentInfo);

}


//Handler de intenciones
async function handlerIntents(event, sessionAttributes, intentInfo) {
    console.log('=== Inicio de handlerIntents ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Se ha activado el manejador de intenciones");
    const userInput = event.inputTranscript.toLowerCase();

    let intentHandler = intentInfo.handle;
    console.log("Valor de handler obtenido de la interpretación de input: ", intentHandler);

    switch (intentHandler) {
        case 'handleBienvenidaIntent':
            console.log("Se estará redirigiendo hacia handleBienvenidaIntent");
            return handleBienvenidaIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleOrdenarIntent':
            console.log("Se estará redirigiendo hacia handleOrdenarIntent");
            return handleOrdenarIntent(event, sessionAttributes, userInput);

        case 'handleAgregarAOrdenarIntent':
            console.log("Se estará redirigiendo hacia handleAgregarAOrdenarIntent");
            return handleAgregarAOrdenIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleFinalizarOrdenIntent':
            console.log("Se estará redirigiendo hacia handleFinalizarOrdenIntent");
            return handleFinalizarOrdenIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleCancelarOrdenIntent':
            console.log("Se estará redirigiendo hacia handleCancelarOrdenIntent");
            return handleCancelarOrdenIntent(event, sessionAttributes, intentInfo);

        case 'handleConsultarMenuIntent':
            console.log("Se estará redirigiendo hacia handleConsultarMenuIntent");
            return handleConsultarMenuIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleConsultaPreciosMenuIntent':
            console.log("Se estará redirigiendo hacia handleConsultaPreciosMenuIntent");
            return handleConsultaPreciosMenuIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleConsultaElementosMenuIntent':
            console.log("Se estará redirigiendo hacia handleConsultaElementosMenuIntent");
            return handleConsultaElementosMenuIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleAgradecimientoIntent':
            console.log("Se estará redirigiendo hacia handleAgradecimientoIntent");
            return handleAgradecimientoIntent(event, sessionAttributes, userInput);

        case 'handleMetodosDePagoIntent':
            console.log("Se estará redirigiendo hacia handleMetodosDePagoIntent");
            return handleMetodosDePagoIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleMetodosDeEnvioIntent':
            console.log("Se estará redirigiendo hacia handleMetodosDeEnvioIntent");
            return handleMetodosDeEnvioIntent(event, sessionAttributes, intentInfo, userInput);

        case 'handleVisualizarIntent':
            return handleVisualizarIntent(event, sessionAttributes, userInput);
            
        case 'handleConectarAAgenteIntent':
            return handleConectarAAgenteIntent(event, sessionAttributes, userInput);

        default:
            console.log("No hay coincidencia con categorias, por lo cual, se procede con el Fallback normal");

            if (!sessionAttributes.fallbackCount) {
                sessionAttributes.fallbackCount = 1;
            } else {
                sessionAttributes.fallbackCount++;
            }

            console.log("Valor de fallbackCount en estos momentos:", sessionAttributes.fallbackCount)

            if (sessionAttributes.fallbackCount >= MAX_FALLBACKS) {
                return {
                    sessionState: {
                        dialogAction: {
                            type: "Close"
                        },
                        intent: {
                            name: event.sessionState.intent.name,
                            state: "Failed"
                        },
                        sessionAttributes: {
                            ...sessionAttributes,
                            requiresHumanIntervention: true,
                            reason: "El cliente realizó multiples intentos para obtener respuestas que no maneja el restaurante. Contactar para validar si tiene dificultadoes"
                        }
                    },
                    messages: [
                        {
                            contentType: "PlainText",
                            content: "Veo que estás teniendo dificultades. Te conectaré con un agente humano que podrá ayudarte mejor."
                        }
                    ]
                };
            }

            let fallbackMessage = await generarMensajeFallback(userInput, intentInfo);
            console.log("Contenido de fallbackMessage generado desde OpenAI: ", fallbackMessage);

            return {
                sessionState: {
                    dialogAction: {
                        type: "Close"
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Failed"
                    },
                    sessionAttributes: sessionAttributes
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: fallbackMessage.mensaje
                    }
                ]
            };
    }
}

//Funciones para las intenciones
async function handleBienvenidaIntent(event, sessionAttributes, intentInfo, userInput) {
    console.log('=== Inicio de handleBienvenidaIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para bienvenida");

    try {
        // Obtener el mensaje de bienvenida
        const mensajeBienvenida = await generarMensajeBienvenida(userInput);
        console.log("Mensaje de bienvenida generado:", mensajeBienvenida);

        /** 
        const consultaInicio = await getInicio();
        console.log("informacion obtenida de la hoja INICIO a traves de shee.best: ", consultaInicio);

        const consultaMenu = await getMenu();
        console.log("informacion obtenida de la hoja MENU a traves de shee.best: ", consultaMenu);
        */

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: mensajeBienvenida.mensaje
                }
            ]
        };
    } catch (error) {
        console.error("Error en handleBienvenidaIntent:", error);

        // En caso de error, devolver un mensaje de error genérico
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, ha ocurrido un error al procesar [BienvenidaIntent]"
                }
            ]
        };
    }

}

async function handleOrdenarIntent(event, sessionAttributes, userInput) {
    console.log('=== Inicio de handleOrdenarIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    // Guardar el input inicial si no existe en la sesión
    if (!sessionAttributes.initialInput && userInput) {
        sessionAttributes.initialInput = userInput;
        console.log("Input inicial guardado:", sessionAttributes.initialInput);
    }

    // Verificar slots requeridos antes de proceder con la orden
    let slots = event.sessionState.intent.slots || {};

    try {

        console.log("----Se empezará a tomar datos del cliente antes de proceder con la toma de orden----")

        // Función auxiliar para verificar si un slot está completo
        const isSlotComplete = (slotName) => {
            const isComplete = slots[slotName] &&
                slots[slotName].value &&
                slots[slotName].value.interpretedValue;
            console.log(`Verificando slot ${slotName}: ${isComplete ? 'Completo' : 'Incompleto'}`);
            return isComplete;
        };

        // Verificar datos del cliente primero
        const requiredSlots = [
            'nombreCliente',
            'telefonoCliente',
            'direccionEntrega'
        ];

        // Verificar cada slot y solicitar el primero que falte
        for (const slotName of requiredSlots) {
            if (!isSlotComplete(slotName)) {
                let message = "";
                if (slotName === 'nombreCliente') {
                    message = "Para empezar con tu orden, ¿podrías decirme tu nombre por favor?";
                } else if (slotName === 'telefonoCliente') {
                    message = "¿Cuál es tu número de teléfono?";
                } else if (slotName === 'direccionEntrega') {
                    message = "¿Cuál sería tu dirección de entrega? También puedes indicar si prefieres recoger en el establecimiento.";
                }

                return {
                    sessionState: {
                        dialogAction: {
                            type: "ElicitSlot",
                            slotToElicit: slotName
                        },
                        intent: {
                            name: "OrdenarIntent",
                            slots: slots,
                            state: "InProgress"
                        },
                        sessionAttributes: sessionAttributes
                    },
                    messages: [{
                        contentType: "PlainText",
                        content: message
                    }]
                };
            }
        }

        // Guardar la información del cliente en las variables de sesión
        sessionAttributes.nombreCliente = slots.nombreCliente.value.interpretedValue;
        sessionAttributes.telefonoCliente = slots.telefonoCliente.value.interpretedValue;
        sessionAttributes.direccionEntrega = slots.direccionEntrega.value.interpretedValue;

        // Recuperar el input inicial para procesar la orden
        userInput = sessionAttributes.initialInput;
        console.log("Recuperando input inicial para procesar:", userInput);

        console.log("Preparando respuesta para ordenar");

        console.log("Input de Entrada del usuario:", userInput);

        // Obtener datos actualizados del menú
        const menuData = await getMenu();

        // Verificar si hay un elemento previo guardado en la sesión
        const elementoPrevio = sessionAttributes.orden;
        console.log("Existe elemento previo? :", elementoPrevio)

        if (elementoPrevio) {

            console.log("Detectada orden contextual basada en consulta previa");
            userInput = elementoPrevio + userInput;
            console.log("El input a procesar quedaria de la siguiente manera: ", userInput);
        }

        // Verificar si es una orden directa 
        const isDirectOrder = await verificarSiEsOrdenDirecta(userInput, menuData);
        console.log("Es orden directa? :", isDirectOrder);

        if (!isDirectOrder && !elementoPrevio) {
            console.log("No es una orden directa. Se verificará el slot 'ordenUsuario'.");

            // Verificar si el slot 'ordenUsuario' tiene valor
            const slotOrdenUsuario = event.sessionState.intent.slots?.ordenUsuario?.value?.interpretedValue;

            if (!slotOrdenUsuario) {
                console.log("El slot 'ordenUsuario' está vacío. Solicitando al usuario...");

                return {
                    sessionState: {
                        dialogAction: {
                            type: "ElicitSlot",
                            slotToElicit: "ordenUsuario"
                        },
                        intent: {
                            name: "OrdenarIntent",
                            state: "InProgress",
                            slots: event.sessionState.intent.slots
                        },
                        sessionAttributes: sessionAttributes
                    },
                    messages: [
                        {
                            contentType: "PlainText",
                            content: "¿Qué te gustaría ordenar?"
                        }
                    ]
                };
            }

            userInput = slotOrdenUsuario;

            console.log("Valor de userInput tomado desde el slot: ", userInput)

        }

        console.log("El usuario ha hecho una orden directa");


        console.log("Ahora, se empezará a validar si es una orden válida")


        let isValidOrder = await verificarSiEsOrdenValida(userInput, menuData);

        console.log("Es orden valida? :", isValidOrder.isValidOrder);

        if (!isValidOrder.isValidOrder) {
            return {
                sessionState: {
                    dialogAction: {
                        type: "Close"
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Failed"
                    }
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: "Lo siento, lo que tratas de ordenar no forma parte del lo que ofrecemos."
                    },
                    {
                        contentType: "PlainText",
                        content: "Puedes consultar el menú para poder hacer tu orden."
                    }
                ]
            };
        }


        console.log("Se procederá a utilizar ChatGPT para empezar con el proceso de toma de orden")
        let ordenarGPT = await llamadaAChatGPTParaOrdenar(userInput, menuData);

        // Extraer el JSON de la respuesta de ChatGPT
        const jsonMatch = ordenarGPT.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta de ChatGPT");
        }

        const orderInfo = JSON.parse(jsonMatch[0]);

        // Guardar la información en las variables de sesión
        sessionAttributes.orden = orderInfo.orden;
        sessionAttributes.totalUnidades = orderInfo.totalUnidades;
        sessionAttributes.comentariosOrden = orderInfo.comentarios;
        sessionAttributes.totalCosto = orderInfo.totalCosto;

        console.log("Se han actualizado los atributos de sesión actuales para ordenar:", JSON.stringify(sessionAttributes, null, 2));

        // Construir los mensajes separados
        let mensajes = [];

        // Agregar el resumen al primer mensaje
        mensajes.push({
            contentType: "PlainText",
            content: `Has pedido:\n\n${orderInfo.orden}`
        });

        // Agregar el total en un segundo mensaje
        mensajes.push({
            contentType: "PlainText",
            content: `Total a pagar: $${orderInfo.totalCosto}`
        });

        // Agregar los comentarios como un tercer mensaje, si existen
        if (orderInfo.comentarios) {
            mensajes.push({
                contentType: "PlainText",
                content: `Comentarios:\n ${orderInfo.comentarios}`
            });
        }

        // Mensaje adicional preguntando si necesita más ayuda
        mensajes.push({
            contentType: "PlainText",
            content: "¿Hay algo más en lo que te pueda ayudar?"
        });

        // Retornar el resultado con los mensajes construidos
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: mensajes
        };


    } catch (error) {
        console.error("Error al procesar la toma de orden:", error);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, hubo un problema al tratar de tomar tu orden. Por favor, intenta nuevamente en unos momentos."
                }
            ]
        };
    }

}

async function handleAgregarAOrdenIntent(event, sessionAttributes, intentInfo, userInput) {
    console.log('=== Inicio de handleAgregarAOrdenarIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para agregar a la orden");

    // Obtener datos actualizados del menú
    const menuData = await getMenu();

    // Verificar si existe una orden activa chequeando todas las variables de sesión relevantes
    const tieneOrdenActiva = sessionAttributes.orden &&
        sessionAttributes.totalUnidades !== undefined &&
        (sessionAttributes.totalCosto !== undefined);

    console.log("Existe alguna orden activa? :", tieneOrdenActiva);

    if (!tieneOrdenActiva) {
        console.log("NO se ha encontrado alguna orden activa")
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, no hay una orden activa a la cual agregar elementos. Por favor, primero realiza un pedido."
                }
            ]
        };
    }

    // Obtener el input del usuario, ya sea del slot o del evento original
    let inputSlot = event.sessionState.intent.slots?.nuevaOrden?.value?.interpretedValue;
    console.log("Valor del Input capturado a partir del Slot: ", inputSlot);
    let inputDirecto = event.inputTranscript.toLowerCase();
    console.log("Valor del Input capturado directamente: ", inputDirecto);

    let nuevoInput;

    // Verificar si es una orden directa 
    const isDirectOrder = await verificarSiEsOrdenDirecta(inputDirecto, menuData);
    console.log("Es orden directa para agregar algo a la orden? :", isDirectOrder);

    if (!isDirectOrder && inputSlot == null) {

        console.log("NO es considerado una orden directa")

        nuevoInput = inputSlot;
        console.log("Valor de NuevoInput obtenido de inputSlot: ", nuevoInput);

        let resumenActual = `Tu orden actual incluye: ${sessionAttributes.orden} \n`;

        resumenActual += `\nTotal a pagar: $${sessionAttributes.totalCosto}`;


        if (sessionAttributes.comentariosOrden) {
            resumenActual += `\n\nComentarios:\n${sessionAttributes.comentariosOrden}`;
        }

        // Preparar los mensajes base
        const mensajes = [
            {
                contentType: "PlainText",
                content: resumenActual
            }
        ];

        // Obtener datos de imágenes
        const imagenesData = await getImagenes();

        // Buscar la imagen específica para el menú
        const imagenMenu = imagenesData.find(imagen => imagen.Nombre === "Menu");
        console.log("Contenido de imagenMenu:", imagenMenu);

        // Agregar mensaje inicial
        mensajes.push({
            contentType: "PlainText",
            content: "A continuación, te presento el menú:"
        });


        //Agregar imagen del menú
        if (imagenMenu) {
            console.log("La imagen del menu existe, se estará agregando la misma al mensaje.");
            mensajes.push({
                contentType: "ImageResponseCard",
                imageResponseCard: {
                    title: "Nuestro Menú",
                    imageUrl: imagenMenu.Link,

                }
            });
            console.log("Imagen agregada correctamente a la respuesta");
        }

        // Agregar mensaje final
        mensajes.push({
            contentType: "PlainText",
            content: "¿Qué te gustaria agregar a tu orden?"
        });


        return {
            sessionState: {
                dialogAction: {
                    type: "ElicitSlot",
                    slotToElicit: "nuevaOrden"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "InProgress"
                },
                sessionAttributes: sessionAttributes
            },
            messages: mensajes
        };

    } else {
        nuevoInput = inputDirecto;
    }

    try {

        // Preparar el mensaje para ChatGPT incluyendo la orden actual
        const ordenActual = {
            orden: sessionAttributes.orden || "",
            totalUnidades: sessionAttributes.totalUnidades || 0,
            totalCosto: sessionAttributes.totalCosto || 0,
            comentarios: sessionAttributes.comentariosOrden || ""
        };

        const chatGPTResponse = await llamadaAChatGPTParaAgregarAOrden(nuevoInput, ordenActual, menuData);

        // Extraer el JSON de la respuesta de ChatGPT
        const jsonMatch = chatGPTResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta de ChatGPT");
        }

        const orderInfo = JSON.parse(jsonMatch[0]);

        // Actualizar las variables de sesión 
        sessionAttributes.orden = orderInfo.orden;
        sessionAttributes.totalUnidades = orderInfo.totalUnidades;
        sessionAttributes.totalCosto = orderInfo.totalCosto;
        sessionAttributes.comentariosOrden = orderInfo.comentarios;

        console.log("Se han actualizado los atributos de sesión actuales para ordenar gracias a que se añadieron elementos:", JSON.stringify(sessionAttributes, null, 2));

        // Construir los mensajes separados
        let mensajes = [];

        // Agregar el resumen al primer mensaje
        mensajes.push({
            contentType: "PlainText",
            content: `Tu pedido actualizado es el siguiente:\n\n${orderInfo.orden}`
        });

        // Agregar el total en un segundo mensaje
        mensajes.push({
            contentType: "PlainText",
            content: `Total a pagar: $${orderInfo.totalCosto}`
        });

        // Agregar los comentarios como un tercer mensaje, si existen
        if (orderInfo.comentarios) {
            mensajes.push({
                contentType: "PlainText",
                content: `Comentarios:\n ${orderInfo.comentarios}`
            });
        }

        // Mensaje adicional preguntando si necesita más ayuda
        mensajes.push({
            contentType: "PlainText",
            content: "¿Hay algo más en lo que te pueda ayudar?"
        });

        // Retornar el resultado con los mensajes construidos
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: mensajes
        };



    } catch (error) {

        console.error("Error al tratar de agregar nuevos elementos a la orden:", error);
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                }
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, hubo un problema al tratar de agregar elementos a tu orden. Por favor, intenta de nuevo."
                }
            ]
        };

    }


}

async function handleFinalizarOrdenIntent(event, sessionAttributes, intentInfo) {
    console.log('=== Inicio de handleFinalizarOrdenIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para finalizar orden");

    // Verificar si existe una orden activa chequeando todas las variables de sesión relevantes
    const tieneOrdenActiva = sessionAttributes.orden &&
        sessionAttributes.totalUnidades !== undefined &&
        (sessionAttributes.totalCosto !== undefined);

    console.log("Existe alguna orden activa? :", tieneOrdenActiva);

    if (!tieneOrdenActiva) {
        console.log("NO se ha encontrado alguna orden activa")
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, no hay una orden activa para poder finalizarla. Por favor, primero realiza un pedido."
                }
            ]
        };
    }

    // Obtener slots actuales
    console.log("\n=== SLOTS INICIALES ===");
    let slots = event.sessionState.intent.slots || {};
    console.log("Slots actuales:", JSON.stringify(slots, null, 2));

    let inputUsuario = event.inputTranscript.toLowerCase();

    // Procesar input con OpenAI si existe un input inicial
    console.log("\n=== PROCESAMIENTO CON OPENAI ===");

    if (inputUsuario) {

        console.log("Procesando input para extraer información de envío:", event.inputTranscript);
        const openAIResponse = await extraerInformacionEnvioCliente(event.inputTranscript);

        console.log("Se ha extraido la información del cliente: ", openAIResponse)

        // Actualizar solo los slots que OpenAI haya devuelto valores
        if (openAIResponse) {

            console.log("Iniciando actualización de slots con respuesta de OpenAI");
            const slotMapping = {
                metodoPago: openAIResponse.metodoPago,
            };

            console.log("Mapping de slots a actualizar:", slotMapping);

            // Actualizar solo los slots que tienen valor en la respuesta de OpenAI
            for (const [slotName, value] of Object.entries(slotMapping)) {
                if (value) {
                    console.log(`Actualizando slot ${slotName} con valor: ${value}`);
                    slots[slotName] = {
                        value: {
                            originalValue: value,
                            interpretedValue: value,
                            resolvedValues: [value]
                        }
                    };
                } else {
                    console.log(`Slot ${slotName} no tiene valor en la respuesta de OpenAI`);
                }
            }

            console.log("Slots actualizados después de OpenAI:", JSON.stringify(slots, null, 2));

        } else {
            console.log("No se recibió respuesta válida de OpenAI");
        }

    } else {
        console.log("No hay input del usuario para procesar para extraer información de envío");
    }

    // Función auxiliar para verificar si un slot está completo
    const isSlotComplete = (slotName) => {
        const isComplete = slots[slotName] &&
            slots[slotName].value &&
            slots[slotName].value.interpretedValue;
        console.log(`Verificando slot ${slotName}: ${isComplete ? 'Completo' : 'Incompleto'}`);
        return isComplete;
    };

    console.log("\n=== VERIFICACIÓN DE SLOTS REQUERIDOS ===");
    // Verificar cada slot requerido y solicitar el primero que falte
    const requiredSlots = ['metodoPago'];

    for (const slotName of requiredSlots) {
        if (!isSlotComplete(slotName)) {
            return {
                sessionState: {
                    dialogAction: {
                        type: "ElicitSlot",
                        slotToElicit: slotName
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        slots: slots,
                        state: "InProgress"
                    },
                    sessionAttributes: sessionAttributes
                },
                messages: [{
                    contentType: "PlainText",
                    content: "¿Cuál será tu método de pago?"
                }]
            };
        }
    }

    console.log("\n=== GENERANDO RESUMEN DE ORDEN ===");

    // Generar número de orden aleatorio
    const numeroOrden = Math.floor(Math.random() * 9000) + 1000; // Genera número entre 1000 y 9999
    console.log("Número de orden generado:", numeroOrden);

    sessionAttributes.numeroOrden = numeroOrden;

    // Crear mensaje de resumen
    const mensajeResumen = `
    Tu orden es la #${numeroOrden} \n
    
    • Nombre de quien recibe: ${sessionAttributes.nombreCliente} \n
    • Número de Teléfono: ${sessionAttributes.telefonoCliente} \n
    • Entrega: ${sessionAttributes.direccionEntrega} \n
    • Orden: ${sessionAttributes.orden} \n
    • Comentarios: ${sessionAttributes.comentariosOrden || 'Sin comentarios'} \n
    • Método de pago: ${slots.metodoPago.value.interpretedValue} \n
    • Total a pagar: $${sessionAttributes.totalCosto}
    `;

    // Limpiar todas las variables de sesión
    console.log("\n=== FINALIZANDO ORDEN ===");

    console.log("\n==== PREPARANDO REGISTRO DE ORDEN EN GOOGLE SHEETS ====");

    try {

        // Preparar los datos para el registro
        const fechaHora = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}:${String(new Date().getSeconds()).padStart(2, '0')}`;

        console.log("Preparando datos para registro en Google Sheets:");

        // Preparar el objeto de nueva orden
        const nuevaOrden = {
            "No. Orden": sessionAttributes.numeroOrden || 'N/A',
            "Fecha y Hora": fechaHora,
            "Cliente": sessionAttributes.nombreCliente || 'N/A',
            "Numero de Telefono": sessionAttributes.telefonoCliente || 'N/A',
            "Elementos Ordenados": sessionAttributes.orden || 'N/A',
            "Direccion": sessionAttributes.direccionEntrega || 'N/A',
            "Metodo de Pago": slots.metodoPago?.value?.interpretedValue || 'N/A',
            "Total": sessionAttributes.totalCosto || 'N/A',
            "Estado": "Pendiente",
            "Observaciones": sessionAttributes.comentariosOrden || 'Sin comentarios'
        };

        console.log("Datos de nueva orden a registrar:", JSON.stringify(nuevaOrden, null, 2));

        // Realizar el registro en Google Sheets
        try {

            console.log("Iniciando registro de orden en Google Sheets");
            const response = await registrarOrden(
                nuevaOrden["No. Orden"],
                nuevaOrden["Fecha y Hora"],
                nuevaOrden["Cliente"],
                nuevaOrden["Numero de Telefono"],
                nuevaOrden["Elementos Ordenados"],
                nuevaOrden["Direccion"],
                nuevaOrden["Metodo de Pago"],
                nuevaOrden["Total"],
                nuevaOrden["Estado"],
                nuevaOrden["Observaciones"]
            );

            console.log("Resultado del registro en Google Sheets:", JSON.stringify(response, null, 2));


        } catch (registroError) {

            console.error("Error al intentar registrar la orden en Google Sheets:", registroError);

        }

    } catch (error) {
        console.error("Error general al preparar el registro de orden:", error);
    }

    console.log("\n==== PREPARANDO REGISTRO DE CLIENTE EN GOOGLE SHEETS ====");

    try {

        console.log("Preparando datos para registrar Cliente en Google Sheets:");

        // Generar un número aleatorio entre 1000 y 2000
        let codigo = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;

        // Preparar el objeto de nueva orden
        const nuevoCliente = {
            "Codigo": codigo || 'N/A',
            "Nombre": sessionAttributes.nombreCliente || 'N/A',
            "Numero de Telefono": sessionAttributes.telefonoCliente || 'N/A',
            "Direccion": sessionAttributes.direccionEntrega || 'N/A',
        };

        console.log("Datos de nuevo cliente a registrar:", JSON.stringify(nuevoCliente, null, 2));

        // Realizar el registro en Google Sheets
        try {

            console.log("Iniciando registro de cliente en Google Sheets");
            const response = await registrarCliente(
                nuevoCliente["Codigo"],
                nuevoCliente["Nombre"],
                nuevoCliente["Numero de Telefono"],
                nuevoCliente["Direccion"]
            );

            console.log("Resultado del registro de cliente en Google Sheets:", JSON.stringify(response, null, 2));


        } catch (registroError) {

            console.error("Error al intentar registrar al cliente en Google Sheets:", registroError);

        }

    } catch (error) {
        console.error("Error general al preparar el registro de cliente:", error);
    }

    console.log("=== FIN DE FINALIZAR ORDEN INTENT ===\n");

    sessionAttributes = {};
    console.log("Variables de sesión limpiadas");

    // Retornar respuesta final
    const finalResponse = {
        sessionState: {
            dialogAction: {
                type: "Close"
            },
            intent: {
                name: event.sessionState.intent.name,
                state: "Fulfilled"
            },
            sessionAttributes: {
                ...sessionAttributes,
                requiresHumanIntervention: true,
                reason: "Orden Completada. Verificar conversacion y validar directamente con el cliente",
            }
        },
        messages: [
            {
                contentType: "PlainText",
                content: mensajeResumen
            },
            {
                contentType: "PlainText",
                content: "Tu pedido estará listo entre 25 a 30 minutos."
            },
            {
                contentType: "PlainText",
                content: "Muchas gracias por tu preferencia."
            },
            {
                contentType: "PlainText",
                content: "En un momento un agente se pondrá en contacto contigo para confirmar los detalles."
            }
        ]
    };

    console.log("Respuesta final:", JSON.stringify(finalResponse, null, 2));
    console.log("=== FIN DE FINALIZAR ORDEN INTENT ===\n");

    return finalResponse;

}

async function handleCancelarOrdenIntent(event, sessionAttributes, intentInfo) {
    console.log('=== Inicio de handleCancelarOrdenIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para cancelar orden");

    // Verificar si existe una orden activa chequeando todas las variables de sesión relevantes
    const tieneOrdenActiva = sessionAttributes.orden &&
        sessionAttributes.totalUnidades !== undefined &&
        (sessionAttributes.totalCosto !== undefined);

    console.log("Existe alguna orden activa? :", tieneOrdenActiva);

    if (!tieneOrdenActiva) {
        console.log("NO se ha encontrado alguna orden activa")
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "No hay ninguna orden activa para cancelar. Para realizar un pedido, puedo mostrarte nuestro menú."
                }
            ]
        };
    }

    // Verificar si está esperando confirmacion para cancelar la orden
    if (!sessionAttributes.esperandoConfirmacionCancelar) {

        let resumenActual = `Tu pedido en estos momentos es: ${sessionAttributes.orden} \n`;

        resumenActual += `\nTotal a pagar: $${sessionAttributes.totalCosto}`;


        if (sessionAttributes.comentariosOrden) {
            resumenActual += `\n\nComentarios:\n${sessionAttributes.comentariosOrden}`;
        }

        // Actualizar estado para esperar confirmación
        sessionAttributes.esperandoConfirmacionCancelar = true;

        return {
            sessionState: {
                dialogAction: {
                    type: "ConfirmIntent"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "InProgress"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: resumenActual
                },
                {
                    contentType: "PlainText",
                    content: "¿Estás seguro de querer cancelar esta orden? "
                }
            ]
        };

    } else {

        // Procesar la respuesta del usuario
        const userInput = event.inputTranscript.toLowerCase();
        const esConfirmacion = await verificarConfirmacion(userInput);

        console.log("Es confirmacion? :", esConfirmacion.isConfirmacion)

        if (esConfirmacion.isConfirmacion) {
            // Si el usuario confirma, limpiar todas las variables de sesión
            return {
                sessionState: {
                    dialogAction: {
                        type: "Close"
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Fulfilled"
                    },
                    sessionAttributes: {} // Limpia todas las variables de sesión
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: "Tu orden ha sido cancelada exitosamente."
                    },
                    {
                        contentType: "PlainText",
                        content: "Si deseas realiar alguna otra acción, con gusto puedes indicármelo"
                    }
                ]
            };
        } else {
            // Si el usuario no confirma, mantener las variables de sesión
            const sessionAttributesActualizados = { ...sessionAttributes };
            delete sessionAttributesActualizados.esperandoConfirmacionCancelar;

            return {
                sessionState: {
                    dialogAction: {
                        type: "Close"
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Fulfilled"
                    },
                    sessionAttributes: sessionAttributesActualizados
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: "Entendido, tu orden se mantiene sin cambios"
                    },
                    {
                        contentType: "PlainText",
                        content: "Si gustas hacer alguna otra acción, estoy a la orden"
                    }

                ]
            };
        }

    }

}

async function handleConsultarMenuIntent(event, sessionAttributes, userInput) {
    console.log('=== Inicio de handleConsultarMenuIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para mostrar menú completo");

    try {

        // Obtener datos de imágenes
        const imagenesData = await getImagenes();

        // Buscar la imagen específica para el menú
        const imagenMenu = imagenesData.find(imagen => imagen.Nombre === "Menu");
        console.log("Contenido de imagenMenu:", imagenMenu);
        console.log("Tipo de imagenMenu", typeof imagenMenu);

        // Preparar array de mensajes
        const mensajes = [];

        // Agregar mensaje inicial
        mensajes.push({
            contentType: "PlainText",
            content: "Aquí te comparto nuestro menú:"
        });

        //Agregar imagen del menú
        if (imagenMenu) {
            console.log("La imagen del menu existe, se estará agregando la misma al mensaje.");
            mensajes.push({
                contentType: "ImageResponseCard",
                imageResponseCard: {
                    title: "Nuestro Menú",
                    imageUrl: imagenMenu.Link,

                }
            });
            console.log("Imagen agregada correctamente a la respuesta");
        }

        // Agregar mensaje final
        mensajes.push({
            contentType: "PlainText",
            content: "¿Te gustaría ordenar algo o tienes alguna pregunta sobre nuestros platillos?"
        });



        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: mensajes
        };
    } catch (error) {
        console.error("Error al procesar la consulta del menú completo:", error);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, hubo un problema al mostrar el menú. Por favor, intenta nuevamente en unos momentos."
                }
            ]
        };
    }
}

async function handleConsultaPreciosMenuIntent(event, sessionAttributes, intentInfo, userInput) {
    console.log('=== Inicio de handleConsultaPreciosMenuIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para consultar precios del menu");

    try {
        // Obtener datos actualizados del menú
        const menuData = await getMenu();

        // Generar respuesta personalizada sobre precios
        const respuesta = await generarRespuestaPreciosMenu(userInput, menuData);

        console.log("Valor de la respuesta obtenida:", respuesta)

        sessionAttributes.orden = respuesta.nombreElemento;

        console.log("Se ha actualiazdo las variables de sesion actuales:", JSON.stringify(sessionAttributes, null, 2));

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: respuesta.mensaje
                }
            ]
        };
    } catch (error) {
        console.error("Error al procesar la consulta de precios:", error);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, hubo un problema al consultar los precios. Por favor, intenta nuevamente en unos momentos."
                }
            ]
        };
    }
}

async function handleConsultaElementosMenuIntent(event, sessionAttributes, intentInfo, userInput) {
    console.log('=== Inicio de handleConsultaElementosMenuIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para consultar por elementos del menu");

    try {
        // Obtener datos actualizados del menú
        const menuData = await getMenu();

        // Generar respuesta personalizada basada en la consulta del usuario
        const respuesta = await generarRespuestaElementoMenu(userInput, menuData);

        console.log("Valor de la respuesta obtenida:", respuesta)

        sessionAttributes.orden = respuesta.nombreElemento;

        console.log("Se ha actualiazdo las variables de sesion actuales:", JSON.stringify(sessionAttributes, null, 2));

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: respuesta.mensaje
                }
            ]
        };
    } catch (error) {
        console.error("Error al procesar la consulta del elemento del menú:", error);

        // En caso de error, devolver un mensaje de error genérico
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, hubo un problema al consultar el elemento del menú que mencionas. Por favor, intenta nuevamente en unos momentos."
                }
            ]
        };
    }
}

async function handleAgradecimientoIntent(event, sessionAttributes, userInput) {
    console.log('=== Inicio de handleAgradecimientoIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para agradecimiento");

    try {
        // Obtener el mensaje de agradecimiento
        const mensajeAgradecimiento = await generarMensajeAgradecimiento(userInput);
        console.log("Mensaje de agradecimiento generado:", mensajeAgradecimiento);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: mensajeAgradecimiento.mensaje
                }
            ]
        };
    } catch (error) {
        console.error("Error en handleAgradecimientoIntent:", error);

        // En caso de error, devolver un mensaje de error genérico
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, ha ocurrido un error al procesar [AgradecimientoIntent]"
                }
            ]
        };
    }

}

async function handleMetodosDePagoIntent(event, sessionAttributes, intentInfo, userInput) {
    console.log('=== Inicio de handleMetodosDePagoIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para metodos de pago");

    try {
        // Obtener el mensaje de metodos de pago
        const mensajeMetodosDePago = await generarMensajeMetodosDePago(userInput);
        console.log("Mensaje de metodos de pago generado:", mensajeMetodosDePago);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: mensajeMetodosDePago.mensaje
                }
            ]
        };
    } catch (error) {
        console.error("Error en handleMetodosDePagoIntent:", error);

        // En caso de error, devolver un mensaje de error genérico
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, ha ocurrido un error al procesar [MetodosDePagoIntent]"
                }
            ]
        };
    }

}

async function handleMetodosDeEnvioIntent(event, sessionAttributes, intentInfo, userInput) {
    console.log('=== Inicio de handleMetodosDeEnvioIntent ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para metodos de envio");

    try {
        // Obtener el mensaje de metodos de envio
        const mensajeMetodosDeEnvio = await generarMensajeMetodosDeEnvio(userInput);
        console.log("Mensaje de metodos de pago generado:", mensajeMetodosDeEnvio);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: mensajeMetodosDeEnvio.mensaje
                }
            ]
        };
    } catch (error) {
        console.error("Error en handleMetodosDeEnvioIntent:", error);

        // En caso de error, devolver un mensaje de error genérico
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, ha ocurrido un error al procesar [MetodosDeEnvioIntent]"
                }
            ]
        };
    }

}

async function handleVisualizarIntent(event, sessionAttributes, userInput) {
    console.log('=== Inicio de handleVisualizar ===');
    console.log('[-] Evento recibido:', JSON.stringify(event, null, 2));
    console.log('[-] Atributos de sesión actuales:', JSON.stringify(sessionAttributes, null, 2));

    console.log("Preparando respuesta para visualizar elemento del menú");

    try {

        // Obtener datos actualizados del menú
        const menuData = await getMenu();

        // Generar respuesta personalizada basada en la consulta del usuario
        const respuestaElementoMenu = await generarRespuestaElementoMenu(userInput, menuData);

        // Obtener datos de imágenes
        const imagenesData = await getImagenes();

        let imagenElemento;

        if (sessionAttributes.orden) {
            // Buscar la imagen que coincida parcialmente con el nombre del orden de atributo de sesion
            imagenElemento = imagenesData.find(imagen =>
                imagen.Nombre.toLowerCase().includes(sessionAttributes.orden.toLowerCase())
            );
            console.log("Valor de imagenElemento usando orden de atributo de sesion:", imagenElemento);
        } else {
            // Buscar la imagen que coincida parcialmente con el nombre procesado del input
            imagenElemento = imagenesData.find(imagen =>
                imagen.Nombre.toLowerCase().includes(respuestaElementoMenu.nombreElemento.toLowerCase())
            );
            console.log("Valor de imagenElemento usando nombre procesado del input:", imagenElemento);
        }


        // Si no se encuentra imagen
        if (!imagenElemento) {
            return {
                sessionState: {
                    dialogAction: {
                        type: "Close"
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Failed"
                    }
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: `Lo siento, no se encontró una imagen para ${sessionAttributes.orden}.`
                    }
                ]
            };
        }

        // Preparar respuesta con imagen
        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                },
                sessionAttributes: sessionAttributes
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: `Aquí tienes una imagen de referencia:`
                },
                {
                    contentType: "ImageResponseCard",
                    imageResponseCard: {
                        title: imagenElemento.Nombre,
                        imageUrl: imagenElemento.Link,

                    }
                }
            ]
        };
    } catch (error) {
        console.error("Error al procesar la visualización del elemento del menú:", error);

        return {
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                }
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "Lo siento, hubo un problema al buscar la imagen del elemento del menú. Por favor, intenta nuevamente en unos momentos."
                }
            ]
        };
    }
}

async function handleConectarAAgenteIntent(event, sessionAttributes, userInput){

    sessionAttributes.reason = "El cliente desea contactar directamente a un agente humano.";
    sessionAttributes.requiresHumanIntervention =true;

    console.log("Se ha actualiazdo las variables de sesion actuales:", JSON.stringify(sessionAttributes, null, 2));

    return {
        sessionState: {
            dialogAction: {
                type: "Close"
            },
            intent: {
                name: event.sessionState.intent.name,
                state: "Failed"
            },
            sessionAttributes: sessionAttributes
        },
        messages: [
            {
                contentType: "PlainText",
                content: "Veo que estás teniendo dificultades. Te conectaré con un agente humano que podrá ayudarte mejor."
            }
        ]
    };
}


//Metodos para usar sheet.best
async function getInicio() {
    console.log("Iniciando consulta a la hoja 'INICIO'");

    try {
        const response = await axios.get(`${SHEET_BEST_API_URL}/tabs/INICIO`);
        console.log("Datos crudos de la hoja INICIO:", response.data);

        // Encuentra la primera fila que tiene algún valor y extrae su clave y valor
        const filaValida = response.data.find(fila => {
            const claves = Object.keys(fila);
            return claves.length > 0 && fila[claves[0]] !== null;
        });

        // Si se encuentra una fila válida, se asignan clave y valor
        const resultado = filaValida
            ? { nombre: Object.keys(filaValida)[0], descripcion: filaValida[Object.keys(filaValida)[0]].trim() }
            : { nombre: '', descripcion: '' };

        console.log("Información obtenida de la hoja INICIO:", resultado);
        return resultado;
    } catch (error) {
        console.error("Error al obtener la información de inicio desde Sheet.best:", error);
        throw error;
    }
}

export async function getMenu() {
    console.log("Iniciando consulta a la hoja 'MENU'");

    try {
        const response = await axios.get(`${SHEET_BEST_API_URL}/tabs/MENU`);
        console.log("Respuesta completa de la hoja 'MENU':", response.data);

        //Obtener datos 
        const menu = response.data;
        console.log("Datos del menú a partir de la fila A2:", menu);

        return menu;
    } catch (error) {
        console.error("Error al obtener datos de la hoja 'MENU':", error);
        throw error;
    }
}

export async function getImagenes() {
    console.log("Iniciando consulta a la hoja 'IMAGENES'");

    try {
        const response = await axios.get(`${SHEET_BEST_API_URL}/tabs/IMAGENES`);
        console.log("Respuesta completa de la hoja 'IMAGENES':", response.data);

        // Obtener datos de la hoja de imágenes
        const imagenes = response.data;
        console.log("Links de imágenes:", imagenes);

        return imagenes;
    } catch (error) {
        console.error("Error al obtener datos de la hoja 'IMAGENES':", error);
        throw error;
    }
}

export async function registrarOrden(noOrden, fechaHora, cliente, telefono, elementos, direccion, metodoPago, totalCosto, estado, observaciones) {
    console.log("Iniciando registro de nueva orden en la hoja 'ORDENES'");

    const nuevaOrden = {
        "No. Orden": noOrden,
        "Fecha y Hora": fechaHora,
        "Cliente": cliente,
        "Numero de Telefono": telefono,
        "Elementos Ordenados": elementos,
        "Direccion": direccion,
        "Metodo de Pago": metodoPago,
        "Total": totalCosto,
        "Estado": estado,
        "Observaciones": observaciones
    };

    console.log("Datos de la nueva orden a registrar:", nuevaOrden);

    try {
        const response = await axios.post(`${SHEET_BEST_API_URL}/tabs/ORDENES`, nuevaOrden);
        console.log("Respuesta de registro en la hoja 'ORDENES':", response.data);

        return response.data;
    } catch (error) {
        console.error("Error al registrar la nueva orden en la hoja 'ORDENES':", error);
        throw error;
    }
}

export async function registrarCliente(codigo, nombre, telefono, direccion) {
    console.log("Iniciando registro de nueva orden en la hoja 'CLIENTES'");

    const nuevoCliente = {
        "Codigo": codigo,
        "Nombre": nombre,
        "Numero de Telefono": telefono,
        "Direccion": direccion
    };

    console.log("Datos del nuevo cliente a registrar:", nuevoCliente);

    try {
        const response = await axios.post(`${SHEET_BEST_API_URL}/tabs/CLIENTES`, nuevoCliente);
        console.log("Respuesta de registro en la hoja 'CLIENTES':", response.data);

        return response.data;
    } catch (error) {
        console.error("Error al registrar al cliente en la hoja 'CLIENTES':", error);
        throw error;
    }
}

async function buscarClienteExistente(nombre, telefono) {
    console.log("Buscando cliente con nombre:", nombre, "y teléfono:", telefono);

    try {
        // Obtener todos los clientes de la hoja
        const response = await axios.get(`${SHEET_BEST_API_URL}/tabs/CLIENTES`);
        const clientes = response.data;

        // Buscar coincidencia exacta de nombre y teléfono
        const clienteEncontrado = clientes.find(cliente =>
            cliente['Nombre'].toLowerCase() === nombre.toLowerCase() &&
            cliente['Numero de Telefono'] === telefono
        );

        if (clienteEncontrado) {
            console.log("Cliente encontrado:", clienteEncontrado);
            return {
                encontrado: true,
                direccion: clienteEncontrado['Direccion']
            };
        }

        return { encontrado: false };
    } catch (error) {
        console.error("Error al buscar cliente:", error);
        throw error;
    }
}


//Metodos para consultar a ChatGPT a traves de la API de OpenAI
async function interpretarIntent(userInput) {
    const systemPrompt = `Eres un asistente altamente especializado en la interpretación de intenciones para un chatbot de restaurante. 
    Tu única función es categorizar precisamente las intenciones del usuario en categorías predefinidas.

    CATEGORÍAS PERMITIDAS Y SUS DEFINICIONES ESPECÍFICAS:

    1. Saludo
       - INCLUYE: Saludos iniciales, presentaciones
       - EJEMPLOS: "hola", "buenos días", "qué tal"
       
    2. Ordenar
       - INCLUYE: Intención clara de hacer un pedido nuevo
       - EJEMPLOS: "quiero ordenar", "deseo hacer un pedido", "quisiera pedir", "me puedes tomar el pedido"
       
    3. Agregar a Orden
       - INCLUYE: Añadir items a un pedido existente
       - EJEMPLOS: "también quiero agregar", "suma a mi pedido", "agrega una porción más", "añadir a mi orden/pedido"
       
    4. Cancelar Orden
       - INCLUYE: Solicitudes explícitas de cancelación
       - EJEMPLOS: "cancela mi pedido", "ya no quiero la orden", "anula mi pedido"
       
    5. Consulta de Menu
       - INCLUYE: Preguntas sobre el menú completo
       - EJEMPLOS: "muéstrame el menú", "qué tienen?", "cuál es su carta"
       - NO INCLUYE: Preguntas sobre recomendaciones o items específicos
       
    6. Consulta de Precios
       - INCLUYE: Preguntas específicas sobre costos
       - EJEMPLOS: "cuánto cuesta", "precio de", "valor del"
       
    7. Consulta de elementos individuales del Menu
       - INCLUYE: Preguntas sobre platos específicos
       - EJEMPLOS: "qué lleva la hamburguesa", "cómo es el combo 1"
       
    8. Agradecimiento
       - INCLUYE: Expresiones de gratitud
       - EJEMPLOS: "gracias", "muchas gracias", "te lo agradezco"
       
    9. Metodos de Pago
       - INCLUYE: Preguntas sobre formas de pago
       - EJEMPLOS: "aceptan tarjeta", "puedo pagar con", "qué métodos de pago tienen"
       
    10. Metodos de Envío
        - INCLUYE: Consultas sobre delivery o recojo
        - EJEMPLOS: "hacen delivery", "puedo recoger", "cómo me lo envían"
    
    11. Finalizar Orden
    - INCLUYE: 
      * Solicitudes explícitas de terminar el pedido
      * Indicaciones de que el pedido está completo
      * Frases que sugieren conclusión del proceso de pedido
      * Menciones de la intencion de querer pagar o confirmar la orden
      * Expresiones que impliquen que no se desean más items
    - EJEMPLOS: 
      * "solo eso, gracias"
      * "quiero finalizar mi orden" 
      * "eso seria todo"
      * "me gustaria pagar"
      * "listo para pagar"
      * "confirmar pedido"
      * "estoy listo para pagar"
    
    12. Visualizar Elemento del Menu
        - INCLUYE: Deseo del cliente de querer ver/visualizar una foto/imagen del elemento del menu
        - EJEMPLOS: "me lo puedes mostrar", "quiero ver como es la pizza", "puedo ver fotos?"

    REGLAS CRÍTICAS DE CATEGORIZACIÓN:

    1. De momento, NO categorizar preguntas sobre recomendaciones o sugerencias en ninguna categoría existente.
    2. NO intentar interpretar intenciones que no coincidan exactamente con las categorías definidas.
    3. Las preguntas sobre promociones, ofertas o recomendaciones NO deben categorizarse como consultas de menú.
    4. Solo categorizar como "Ordenar" cuando hay una intención EXPLÍCITA de realizar un pedido.
    5. CONTEXTO Y SEMÁNTICA:
        - Analizar no solo palabras individuales, sino el contexto y la intención general
        - Prestar especial atención a frases que impliquen conclusión del proceso de pedido
    6. NO SUGIERAS COSAS QUE NO SE ESTAN TOMANDO EN CONSIDERACION DENTRE DE LAS CATEGORIAS. Ejemplo: sugerir horarios, promociones, reservas,etc.


    IMPORTANTE: 
        - Evaluar holísticamente la intención del usuario
        - Priorizar la categoría que mejor capture el propósito final de la comunicación
        - No sugieras en general alternativas que no estan dentro de las capacidades. Las capacidades son las 12 categorias, por lo mismo, no ofrezcas cosas como reservas, visitar pagina web, horarios, promociones y entre otras cosas.`;

    const userPrompt = `Analiza el siguiente input y categorízalo según las reglas estrictas definidas:
    "${userInput}"
    
    Debes responder únicamente con uno de estos dos formatos JSON:

    Para categorías válidas:
    {
        "categoria": "[Categoría exacta de la lista]",
        "handle": "[Handle correspondiente según esta lista:]"
        - Saludo -> handleBienvenidaIntent
        - Ordenar -> handleOrdenarIntent
        - Agregar a Orden -> handleAgregarAOrdenarIntent
        - Cancelar Orden -> handleCancelarOrdenIntent
        - Consulta de Menu -> handleConsultarMenuIntent
        - Consulta de Precios -> handleConsultaPreciosMenuIntent
        - Consulta de elementos individuales del Menu -> handleConsultaElementosMenuIntent
        - Agradecimiento -> handleAgradecimientoIntent
        - Metodos de Pago -> handleMetodosDePagoIntent
        - Metodos de Envío -> handleMetodosDeEnvioIntent
        - Finalizar Orden -> handleFinalizarOrdenIntent
        - Visualizar Elemento del Menu -> handleVisualizarIntent
    }

    Para categorías inválidas:
    {
        "categoriaInvalida": "No pertenece a ninguna categoria",
        "mensaje": "[Mensaje corto y claro explicando por qué no podemos procesar esta solicitud]"
    }

    NOTA: no menciones nada relacionado con paginas web u otros medios para consultar informacion.

    Responde ÚNICAMENTE con el JSON correspondiente, sin texto adicional ni marcadores de código.`;

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

async function generarMensajeFallback(userInput, intentInfo) {
    const systemPrompt = `
    Eres un asistente de chatbot para un restaurante. Tu tarea es generar un mensaje amigable y apropiado cuando un usuario solicita algo que no está dentro de las capacidades o servicios del restaurante.

    El mensaje debe ser corto, claro y educado, explicando de manera sencilla que la solicitud no puede ser procesada, pero ofreciendo una alternativa o sugerencia cuando sea posible.

    Formato de respuesta:
    {
        "mensaje": "Aquí va el mensaje de fallback generado por usted"
    }
    `;

    let userPrompt;
    if (intentInfo.categoriaInvalida) {
        userPrompt = `
        El usuario ha hecho la siguiente solicitud que no pertenece a ninguna categoría válida:
        "${userInput}"

        Por favor, genera un mensaje de fallback apropiado que explique de manera amigable por qué no podemos procesar esta solicitud, y si es posible, ofrece una alternativa o sugerencia.
        `;
    } else {
        userPrompt = `
        Hubo un error al procesar la intención del usuario. Genera un mensaje de fallback apropiado.
        `;
    }

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
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para mensaje de fallback:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}

async function generarMensajeBienvenida(userInput) {

    let contextoRestaurante = await getInicio();

    const systemPrompt = `
    Eres un chatbot amigable para un restaurante. Tu tarea es generar mensajes de bienvenida cálidos y acogedores.
    Debes mencionar que puedes ayudar a tomar pedidos y responder preguntas sobre el menú.
    Las respuestas deben ser breves pero acogedoras.

    Y basate en la siguiente informacion: ${JSON.stringify(contextoRestaurante, null, 2)}

    La cual es la del restaurante al cual estas apoyando. Basa tu respuesta para que este en sincronía con el tipo de restaurante.

    Formato de respuesta:
    {
        "mensaje": "Aquí va el mensaje de bienvenida"
    }
    `;

    const userPrompt = `
    El cliente ha iniciado una conversación o ha saludado con el siguiente mensaje:
    "${userInput}"

    Genera un mensaje de bienvenida que:
    1. Salude de manera cálida
    2. Mencione que puedes ayudar con pedidos
    3. Invite al cliente a preguntar sobre el menú
    La respuesta debe ser concisa pero amigable.

    NO USES EMOJIS.

    Y trata de que no siempre se genere el mismo mensaje de saludo, sino que sea variado.
    `;

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
            temperature: 0.6
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para mensaje de bienvenida:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}


async function generarRespuestaElementoMenu(userInput, menuData) {
    const systemPrompt = `
    Eres un asistente de restaurante amigable y servicial. Tienes acceso al siguiente menú actualizado:
    ${JSON.stringify(menuData, null, 2)}

    Tu tarea es:
    1. Responder preguntas específicas sobre el menú
    2. Ser flexible con la escritura/ortografía de los nombres de los platillos
    3. Si el cliente pregunta por algo que no está en el menú, indicarlo amablemente y opcionalmente sugerir algo similar del menú disponible
    4. NO listar el menú completo, solo responder sobre los elementos específicos por los que se pregunta
    5. Incluir precios y detalles relevantes de los elementos consultados

    Formato de respuesta:
    {
        "mensaje": "Tu respuesta aquí, mencionando los detalles relevantes del elemento consultado",
        "nombreElemento": "Nombre exacto del elemento del menú consultado (si aplica)"
    }
    `;

    const userPrompt = `
    El cliente ha realizado la siguiente consulta sobre el menú:
    "${userInput}"
    
    Por favor, genera una respuesta apropiada siguiendo las instrucciones dadas.
    `;

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
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para consulta de elementos especificos del menú:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");

        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}

async function generarRespuestaPreciosMenu(userInput, menuData) {
    const systemPrompt = `
    Eres un asistente de restaurante especializado en informar sobre precios. Tienes acceso al siguiente menú actualizado:
    ${JSON.stringify(menuData, null, 2)}

    Tu tarea es:
    1. Responder ÚNICAMENTE sobre los precios de los elementos consultados
    2. Ser flexible con la escritura/ortografía de los nombres de los platillos
    3. Si el cliente pregunta por algo que no está en el menú, indicar amablemente que ese elemento no está disponible
    4. Mantener las respuestas concisas y enfocadas en los precios
    5. Si el cliente pregunta por varios elementos, listar los precios de todos los elementos mencionados
    6. No incluir descripciones detalladas de los platillos, solo nombres y precios

    Formato de respuesta:
    {
        "mensaje": "Tu respuesta aquí, mencionando solo los precios de los elementos consultados"
        "nombreElemento": "Nombre exacto del elemento del menú consultado (si aplica)"
    }
    `;

    const userPrompt = `
    El cliente ha realizado la siguiente consulta sobre precios:
    "${userInput}"
    
    Por favor, genera una respuesta enfocada únicamente en los precios solicitados.
    `;

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
            temperature: 0.5 // Temperatura más baja para respuestas más consistentes sobre precios
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para consulta de precios:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");

        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT para consulta de precios:", error);
        throw error;
    }
}

async function generarMensajeAgradecimiento(userInput) {

    let contextoRestaurante = await getInicio();

    const systemPrompt = `
    Eres un chatbot amable para un restaurante. El restaurante tiene la siguiente informacion: ${JSON.stringify(contextoRestaurante, null, 2)}
    Tu tarea es generar respuestas variadas y amigables a los agradecimientos de los clientes.
    Las respuestas deben ser breves, cordiales y mantener un tono positivo.

    Formato de respuesta:
    {
        "mensaje": "Aquí va tu respuesta al agradecimiento"
    }
    `;

    const userPrompt = `
    El cliente ha expresado agradecimiento con el siguiente mensaje:
    "${userInput}"

    Por favor, genera una respuesta amable y cordial que transmita que estamos contentos de poder ayudar.
    La respuesta debe ser breve y natural.

    NO digas hola cada vez que generes el mensaje.

    NO USES EMOJIS.

    Y trata de que no siempre se genere el mismo mensaje, sino que sea variado.


    `;

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
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para agradecimiento:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}

async function generarMensajeMetodosDePago(userInput) {
    const systemPrompt = `
    Eres un chatbot de restaurante que informa sobre métodos de pago aceptados.
    Solo debes mencionar dos opciones: tarjeta y efectivo.
    Las respuestas deben ser concisas y claras.

    Formato de respuesta:
    {
        "mensaje": "Aquí va la información sobre métodos de pago"
    }
    `;

    const userPrompt = `
    El cliente ha preguntado sobre métodos de pago con el siguiente mensaje:
    "${userInput}"

    Genera una respuesta amable que explique claramente que aceptamos únicamente tarjeta y efectivo.
    La respuesta debe ser breve y directa.

    NO digas hola cada vez que generes el mensaje.

    NO USES EMOJIS.

    Y trata de que no siempre se genere el mismo mensaje, sino que sea variado.
    `;

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
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para métodos de pago:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}

async function generarMensajeMetodosDeEnvio(userInput) {
    const systemPrompt = `
    Eres un chatbot de restaurante que informa sobre las opciones de entrega disponibles.
    Solo debes mencionar dos opciones: entrega a domicilio en la ciudad y recoger en el establecimiento.
    Las respuestas deben ser informativas y amables.

    Formato de respuesta:
    {
        "mensaje": "Aquí va la información sobre métodos de envío"
    }
    `;

    const userPrompt = `
    El cliente ha preguntado sobre las opciones de entrega con el siguiente mensaje:
    "${userInput}"

    Genera una respuesta amable que explique las dos opciones disponibles: entrega a domicilio en la ciudad y recoger en el establecimiento.
    La respuesta debe ser clara y concisa.

    NO digas hola cada vez que generes el mensaje.

    NO USES EMOJIS.

    Y trata de que no siempre se genere el mismo mensaje, sino que sea variado.
    `;

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
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para métodos de envío:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error al llamar a la API de ChatGPT:", error);
        throw error;
    }
}

async function llamadaAChatGPTParaOrdenar(userInput, menuData) {

    // Convertir precios del menú a números
    const menuPreprocesado = menuData.map(item => ({
        ...item,
        Precio: parseFloat(item.Precio.replace('$', '')) // Eliminar "$" y convertir a número
    }));

    const systemPrompt = `Eres un asistente especializado en tomar órdenes para un restaurante.
    Tienes acceso al siguiente menú actualizado:
    ${JSON.stringify(menuPreprocesado, null, 2)}

    Tu tarea es tomar la orden del usuario pero SOLO PUEDES TOMAR ORDENES QUE SI TENGAN ELEMENTOS QUE ESTEN PRESENTES EN EL MENU QUE SE TE HA COMPARTIDO

    Solo puedes procesar órdenes que incluyan estos productos exactos. 
    Y tambien puedes procesar comentarios, los cuales serian cosas extras que pediría el cliente como por ejemplo servilletas o si desea agregar algun ingrediente o quitar y entre otras cosas
    Igual puedes procesar si se escriben de manera distinta los elementos del menu, ya sea que sean variaciones en su escritura pero que hagan referencia valida a algo del menu
    Toda escritura que haga referencia al menu es válida.`;

    const userPrompt = `Analiza el siguiente pedido  y extrae la información relevante:
    "${userInput}"
    
    Debes responder con un objeto JSON.

    El objeto JSON de respuesta tiene que contener exactamente estas propiedades:
    {
        "orden": "Solo incluir un resumen conciso del pedido, debe incluir algo como: '(nombre del elemento del menu) - (cantidad de unidades) unidad(es)'. Si la orden incluye varios elementos del menu, se deben de separar por coma. Despues del valor de la cantidad mira si es necesario colocar unidad o unidades dependiendo de la cantidad de elementos que se piden del elemento del menu",
        "totalUnidades": "suma total de unidades pedidas",
        "comentarios": "información adicional sobre especificaciones del cliente",
        "totalCosto": "cálculo del costo total basado en los precios del menu que se te compartió"
    }

    Realiza el cálculo de manera precisa y sin redondeos adicionales. Respeta los precios exactos del menú compartido.

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

async function llamadaAChatGPTParaAgregarAOrden(userInput, ordenActual, menuData) {

    // Convertir precios del menú a números
    const menuPreprocesado = menuData.map(item => ({
        ...item,
        Precio: parseFloat(item.Precio.replace('$', '')) // Eliminar "$" y convertir a número
    }));

    const systemPrompt = `Eres un asistente especializado en tomar órdenes para un restaurante.
    Tienes acceso al siguiente menú actualizado:
    ${JSON.stringify(menuPreprocesado, null, 2)}

    Tu tarea es añadir elementos a la orden del usuario pero SOLO PUEDES PROCESAR SOLICITUDES RELACIONADAS CON AÑADIR A LA ORDEN QUE SI TENGAN ELEMENTOS QUE ESTEN PRESENTES EN EL MENU QUE SE TE HA COMPARTIDO

    Solo puedes procesar órdenes que incluyan estos productos exactos. 
    Y tambien puedes procesar comentarios, los cuales serian cosas extras que pediría el cliente como por ejemplo servilletas o si desea agregar algun ingrediente o quitar y entre otras cosas
    Tu tarea es procesar adiciones a órdenes existentes, sumando las nuevas cantidades a las existentes y tambien en caso se indique, remover elementos de la orden y actualizar la informacion.
    Tambien debes ajustar el total del costo a pagar`;

    const userPrompt = `Analiza el siguiente pedido para añadir a una orden existente:
    
    Orden actual:
    - Orden: ${ordenActual.orden}
    - Total unidades actuales: ${ordenActual.totalUnidades}
    - Total costo actual: $${ordenActual.totalCosto}
    - Comentarios actuales: ${ordenActual.comentarios}

    Pedido adicional del cliente:
    "${userInput}"
    
    Debes devolver un objeto JSON exactamente con estas propiedades:
    {
        "orden": "Al resumen que ya se tenia en ordenActual.orden, agregarle lo que interpretes que se esta agregando a la orden. Usa el mismo formato que ya usa ordenActual.orden",
        "totalUnidades": "suma TOTAL de todas las unidades (existentes + nuevas)",
        "comentarios": "combina los comentarios existentes con los nuevos si los hay",
        "totalCosto": "cálculo del costo total que ya se tenia mas la suma de lo que se acaba de agregar, basado en los precios del menu que se te compartió"
    }

    Realiza el cálculo de manera precisa y sin redondeos adicionales. Respeta los precios exactos del menú compartido.

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

async function verificarSiEsOrdenDirecta(userInput) {

    try {
        const systemPrompt = `Eres un asistente especializado en analizar si un texto contiene una orden directa para ordenar o añadir algo.

        Debes verificar si el texto se considera o no como una orden directa.

        Para saber si es directa o no, ten en cuenta lo siguiente:

        1. **Se considera una orden directa si:**
            - El texto tiene más de 16 caracteres (incluyendo espacios).
            - El contenido del texto especifica directamente algo que se desea ordenar o añadir/agregar. 
            Ejemplo: 
            - "Me gustaría añadir unas papas" (ORDEN DIRECTA porque especifica qué añadir).
            - "Quiero ordenar una pizza" (ORDEN DIRECTA porque menciona directamente el elemento a ordenar).

        2. **No se considera una orden directa si:**
            - El texto solo denota una intención general sin especificar lo que se desea ordenar o añadir/agregar.
            Ejemplo:
            - "Hola, me gustaría añadir algo a mi orden" (NO ES ORDEN DIRECTA porque no especifica qué añadir).
            - "Hola, me gustaría ordenar por favor" (NO ES ORDEN DIRECTA porque no menciona qué ordenar).

        3. **Si no se cumplen las condiciones anteriores, entonces NO ES UNA ORDEN DIRECTA.**

        Se flexible y acepta sinonimos de palabras para ordenar o añadir/agregar algo a la orden.

        Sé riguroso y responde basándote estrictamente en estas condiciones.`;

        const userPrompt = `Analiza el siguiente texto y determina si es una orden directa o no:
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

        console.log("Respuesta de ChatGPT para validar si es orden directa:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
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

async function verificarSiEsOrdenValida(userInput, menuData) {

    try {
        const systemPrompt = `Eres un asistente especializado en analizar órdenes de menú con un enfoque altamente flexible. 
        Tus objetivos son:

        Identificar elementos del menú con máxima flexibilidad:
        - Ignora diferencias de mayúsculas/minúsculas
        - Acepta variaciones con/sin acentos
        - Permite singular/plural
        - Tolera pequeñas variaciones ortográficas
        - Compara esencia del producto, no exactitud literal

        Menú disponible:
        ${JSON.stringify(menuData, null, 2)}

        Criterios de validación:
        - Prioriza la coincidencia sustancial sobre la precisión literal
        - Verifica que cada elemento mencionado exista en el menú
        - Sé generoso en la interpretación, pero mantén rigor en la validación
        `;

        const userPrompt = `Analiza el siguiente texto de orden con MÁXIMA FLEXIBILIDAD:
        "${userInput}"
        
        Instrucciones para tu respuesta:
        - Evalúa si TODOS los elementos mencionados corresponden al menú
        - Usa un criterio amplio de coincidencia
        - Si hay al menos una coincidencia parcial razonable con un elemento del menú, considera la orden VÁLIDA
        - La cantidad de elementos no es relevante para la validez

        Responde ÚNICAMENTE con este JSON:
        {
            "isValidOrder": boolean,
            "reason": "Explicación breve de la validación"
        }

        IMPORTANTE: 
        - Sé extremadamente flexible en la comparación
        - Prioriza la intención sobre la exactitud
        `;

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
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para validar si es orden valida:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta");
        }

        const result = JSON.parse(jsonMatch[0]);
        return result;

    } catch (error) {
        console.error("Error al verificar si es orden valida:", error);
        return false;
    }
}

async function verificarConfirmacion(userInput) {

    try {
        const systemPrompt = `Eres un asistente especializado en analizar texto para confimar cancelaciones de ordenes con un enfoque altamente flexible. 
        
        A partir del input que se te comparta, debes evaluarlo y concluir si lo que el input contiene es una afirmacion o no.

        Cualquier indicio de que se este confirmando la accion que describa el input, se considera como válida.

        `;

        const userPrompt = `Analiza el siguiente texto con MÁXIMA FLEXIBILIDAD:
        "${userInput}"
        
        Evalua si el texto indica si se esta confirmando, afirmando, etc. 

        Responde ÚNICAMENTE con este JSON:
        {
            "isConfirmacion": boolean,
            "reason": "Explicación breve de la validación"
        }

        `;

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
            temperature: 0.4
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Respuesta de ChatGPT para validar confirmacion:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");
        const jsonMatch = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No se pudo extraer JSON válido de la respuesta");
        }

        const result = JSON.parse(jsonMatch[0]);
        return result;

    } catch (error) {
        console.error("Error al verificar confirmacion:", error);
        return false;
    }
}

async function extraerInformacionEnvioCliente(userInput) {

    try {
        const systemPrompt = `Eres un asistente especializado en extraer información de pedidos para un restaurante.
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

        console.log("Respuesta de ChatGPT para extraer información de envío:");
        console.log("--------------------------------------");
        console.log(response.data.choices[0].message.content);
        console.log("--------------------------------------");

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