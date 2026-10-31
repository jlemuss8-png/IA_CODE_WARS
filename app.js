// ======================================
// 1. OBTENER LOS ELEMENTOS DEL HTML
// ======================================

const formulario = document.getElementById("formulario-expediente");

const campoSolicitante = document.getElementById("solicitante");
const campoAsunto = document.getElementById("asunto");
const campoResponsable = document.getElementById("responsable");

const listaExpedientes = document.getElementById("lista-expedientes");
const campoBusqueda = document.getElementById("busqueda");

const CLAVE_ALMACENAMIENTO = "expedientes";


// ======================================
// 2. PREPARAR HISTORIAL DE CIERRES
// ======================================

function prepararHistorialCierres(expediente) {

    if (!Array.isArray(expediente.cierres)) {

        expediente.cierres = [];

        // Conservar cierres de versiones anteriores
        if (expediente.motivoCierre) {

            expediente.cierres.push({
                fecha: expediente.fechaCierre || "Fecha anterior no registrada",
                motivo: expediente.motivoCierre
            });

        }
    }
}


// ======================================
// 3. CARGAR EXPEDIENTES GUARDADOS
// ======================================

function cargarExpedientes() {

    try {

        const datos = JSON.parse(
            localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]"
        );

        if (!Array.isArray(datos)) {
            return [];
        }

        return datos.map(function(expediente) {

            expediente.actividades =
                Array.isArray(expediente.actividades)
                ? expediente.actividades : [];

            prepararHistorialCierres(expediente);

            return expediente;

        });

    } catch (error) {

        console.error("Error al cargar expedientes:", error);

        alert("No fue posible cargar los expedientes.");

        return [];
    }
}

let expedientes = cargarExpedientes();


// ======================================
// 4. GENERAR CÓDIGO AUTOMÁTICO
// ======================================

function generarCodigo() {

    return "EXP-" + Date.now() + "-" +
        Math.floor(Math.random() * 1000);

}


// ======================================
// 5. GUARDAR EXPEDIENTES
// ======================================

function guardarExpedientes() {

    try {

        localStorage.setItem(
            CLAVE_ALMACENAMIENTO,
            JSON.stringify(expedientes)
        );

        return true;

    } catch (error) {

        console.error("Error al guardar:", error);

        alert("No se pudieron guardar los cambios.");

        return false;
    }
}


// ======================================
// 6. REGISTRAR UN EXPEDIENTE
// ======================================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const solicitante = campoSolicitante.value.trim();
    const asunto = campoAsunto.value.trim();
    const responsable = campoResponsable.value.trim();

    if (!solicitante || !asunto || !responsable) {

        alert("Completa todos los campos.");

        return;
    }

    const nuevoExpediente = {

        codigo: generarCodigo(),

        solicitante: solicitante,

        asunto: asunto,

        responsable: responsable,

        fecha: new Date().toLocaleString("es-GT"),

        estado: "Abierto",

        actividades: [],

        cierres: []

    };

    expedientes.push(nuevoExpediente);

    if (!guardarExpedientes()) {

        expedientes.pop();

        return;
    }

    formulario.reset();

    campoBusqueda.value = "";

    mostrarExpedientes();

    alert("¡Expediente registrado correctamente!");

});


// ======================================
// 7. CREAR ELEMENTOS HTML
// ======================================

function crearParrafo(texto) {

    const parrafo = document.createElement("p");

    parrafo.textContent = texto;

    return parrafo;
}


function crearBoton(texto, accion) {

    const boton = document.createElement("button");

    boton.type = "button";

    boton.textContent = texto;

    boton.addEventListener("click", accion);

    return boton;
}


// ======================================
// 8. REGISTRAR ACTIVIDADES
// ======================================

function registrarActividad(expediente, descripcion, datosExtra = {}) {

    if (expediente.estado === "Cerrado") {

        alert("No se pueden agregar actividades a un expediente cerrado.");

        return false;
    }

    expediente.actividades.push({

        fecha: new Date().toLocaleString("es-GT"),

        descripcion: descripcion,

        ...datosExtra

    });

    return guardarExpedientes();
}


// ======================================
// 9. MOSTRAR LOS EXPEDIENTES
// ======================================

function mostrarExpedientes(filtro = "") {

    listaExpedientes.innerHTML = "";

    const textoFiltro = filtro.trim().toLocaleLowerCase("es");

    const resultados = expedientes.filter(function(expediente) {

        const codigo = String(expediente.codigo || "")
            .toLocaleLowerCase("es");

        const solicitante = String(expediente.solicitante || "")
            .toLocaleLowerCase("es");

        return (
            codigo.includes(textoFiltro) ||
            solicitante.includes(textoFiltro)
        );

    });


    if (resultados.length === 0) {

        listaExpedientes.textContent =
            "No se encontraron expedientes.";

        return;
    }


    resultados.forEach(function(expediente) {

        prepararHistorialCierres(expediente);

        expediente.actividades =
            Array.isArray(expediente.actividades)
            ? expediente.actividades : [];


        const tarjeta = document.createElement("div");

        tarjeta.style.border = "1px solid #cbd5e1";
        tarjeta.style.padding = "15px";
        tarjeta.style.marginBottom = "15px";
        tarjeta.style.borderRadius = "8px";


        // DATOS DEL EXPEDIENTE

        const titulo = document.createElement("h3");

        titulo.textContent = expediente.codigo;

        tarjeta.appendChild(titulo);

        tarjeta.appendChild(crearParrafo(
            "Solicitante: " + (expediente.solicitante || "")
        ));

        tarjeta.appendChild(crearParrafo(
            "Asunto: " + (expediente.asunto || "")
        ));

        tarjeta.appendChild(crearParrafo(
            "Responsable: " + (expediente.responsable || "")
        ));

        tarjeta.appendChild(crearParrafo(
            "Fecha: " + (expediente.fecha || "")
        ));

        tarjeta.appendChild(crearParrafo(
            "Estado: " + (expediente.estado || "Abierto")
        ));


        // HISTORIAL DE ACTIVIDADES

        const subtitulo = document.createElement("h4");

        subtitulo.textContent = "Historial de actividades";

        tarjeta.appendChild(subtitulo);


        if (expediente.actividades.length === 0) {

            tarjeta.appendChild(crearParrafo(
                "Todavía no hay actividades registradas."
            ));

        } else {

            expediente.actividades.forEach(function(actividad) {

                const elemento = crearParrafo(
                    (actividad.fecha || "Fecha no registrada") +
                    " - " + (actividad.descripcion || "")
                );

                tarjeta.appendChild(elemento);

            });
        }


        // ======================================
        // 10. EXPEDIENTES ABIERTOS O EN SEGUIMIENTO
        // ======================================

        if (expediente.estado !== "Cerrado") {


            // AGREGAR ACTIVIDAD

            const campoActividad = document.createElement("textarea");

            campoActividad.placeholder =
                "Escribe una nueva actividad...";

            campoActividad.setAttribute(
                "aria-label",
                "Nueva actividad"
            );

            tarjeta.appendChild(campoActividad);


            tarjeta.appendChild(crearBoton(
                "Agregar actividad",
                function() {

                    const descripcion = campoActividad.value.trim();

                    if (descripcion === "") {

                        alert("Escribe una actividad antes de continuar.");

                        return;
                    }

                    if (registrarActividad(expediente, descripcion)) {

                        mostrarExpedientes(campoBusqueda.value);

                    }

                }
            ));


            // CAMBIAR A EN SEGUIMIENTO

            if (expediente.estado !== "En seguimiento") {

                tarjeta.appendChild(crearBoton(
                    "En seguimiento",
                    function() {

                        const estadoAnterior = expediente.estado;

                        expediente.estado = "En seguimiento";

                        expediente.actividades.push({

                            fecha: new Date().toLocaleString("es-GT"),

                            descripcion:
                                "Cambio de estado: " +
                                estadoAnterior +
                                " → En seguimiento",

                            tipo: "Cambio de estado",

                            estadoAnterior: estadoAnterior,

                            estadoNuevo: "En seguimiento"

                        });


                        if (guardarExpedientes()) {

                            mostrarExpedientes(campoBusqueda.value);

                        } else {

                            expediente.estado = estadoAnterior;

                            expediente.actividades.pop();

                        }

                    }
                ));

            }


            // ======================================
            // 11. CERRAR EXPEDIENTE
            // ======================================

            tarjeta.appendChild(crearBoton(
                "Cerrar expediente",
                function() {

                    if (expediente.actividades.length === 0) {

                        alert(
                            "Debe agregar al menos una actividad antes de cerrar."
                        );

                        return;
                    }


                    const motivo = prompt(
                        "Escribe el motivo del cierre:"
                    );


                    if (!motivo || motivo.trim() === "") {

                        alert("Debes indicar el motivo del cierre.");

                        return;
                    }


                    prepararHistorialCierres(expediente);


                    const cierre = {

                        fecha: new Date().toLocaleString("es-GT"),

                        motivo: motivo.trim()

                    };


                    expediente.cierres.push(cierre);

                    expediente.motivoCierre = motivo.trim();

                    expediente.fechaCierre = cierre.fecha;


                    const estadoAnterior = expediente.estado;

                    expediente.estado = "Cerrado";


                    expediente.actividades.push({

                        fecha: cierre.fecha,

                        descripcion:
                            "Expediente cerrado. Motivo: " +
                            cierre.motivo,

                        tipo: "Cierre",

                        motivo: cierre.motivo,

                        estadoAnterior: estadoAnterior,

                        estadoNuevo: "Cerrado"

                    });


                    if (guardarExpedientes()) {

                        mostrarExpedientes(campoBusqueda.value);

                        alert("Expediente cerrado correctamente.");

                    } else {

                        expediente.cierres.pop();

                        expediente.estado = estadoAnterior;

                        expediente.actividades.pop();

                    }

                }
            ));

        } else {


            // ======================================
            // 12. HISTORIAL DE CIERRES
            // ======================================

            const subtituloCierres = document.createElement("h4");

            subtituloCierres.textContent = "Historial de cierres";

            tarjeta.appendChild(subtituloCierres);


            if (expediente.cierres.length === 0) {

                tarjeta.appendChild(crearParrafo(
                    "No hay detalles de cierres anteriores."
                ));

            } else {

                expediente.cierres.forEach(function(cierre, indice) {

                    tarjeta.appendChild(crearParrafo(

                        "Cierre " + (indice + 1) +

                        " - Fecha: " +
                        (cierre.fecha || "No registrada") +

                        " - Motivo: " +
                        (cierre.motivo || "No registrado")

                    ));

                });

            }


            // ======================================
            // 13. BOTÓN PARA REABRIR
            // ======================================

            tarjeta.appendChild(crearBoton(
                "Reabrir expediente",
                function() {

                    const motivo = prompt(
                        "Escribe el motivo por el cual deseas reabrir el expediente:"
                    );


                    if (!motivo || motivo.trim() === "") {

                        alert("Debes indicar un motivo válido.");

                        return;
                    }


                    const confirmado = reabrirExpediente(
                        expediente,
                        motivo
                    );


                    if (confirmado) {

                        mostrarExpedientes(campoBusqueda.value);

                        alert("Expediente reabierto correctamente.");

                    }

                }
            ));

        }


        listaExpedientes.appendChild(tarjeta);

    });

}


// ======================================
// 14. REABRIR EXPEDIENTE
// ======================================

function reabrirExpediente(expediente, motivo) {


    // VALIDAR ESTADO

    if (!expediente || expediente.estado !== "Cerrado") {

        alert("Solo se pueden reabrir expedientes cerrados.");

        return false;
    }


    // VALIDAR MOTIVO

    if (typeof motivo !== "string" || motivo.trim() === "") {

        alert("Debes ingresar un motivo para reabrir.");

        return false;
    }


    const estadoAnterior = expediente.estado;

    const estadoNuevo = "En seguimiento";

    const fechaActual = new Date().toLocaleString("es-GT");

    const motivoLimpio = motivo.trim();


    if (!Array.isArray(expediente.actividades)) {

        expediente.actividades = [];

    }


    // REGISTRAR EVENTO EN EL HISTORIAL

    expediente.actividades.push({

        fecha: fechaActual,

        descripcion:
            "Expediente reabierto. Motivo: " +
            motivoLimpio +
            ". Estado: " +
            estadoAnterior +
            " → " +
            estadoNuevo,

        tipo: "Reapertura",

        motivo: motivoLimpio,

        estadoAnterior: estadoAnterior,

        estadoNuevo: estadoNuevo

    });


    // CAMBIAR ESTADO

    expediente.estado = estadoNuevo;


    if (!guardarExpedientes()) {

        expediente.estado = estadoAnterior;

        expediente.actividades.pop();

        return false;
    }


    return true;

}


// ======================================
// 15. BUSCAR EXPEDIENTES
// ======================================

campoBusqueda.addEventListener("input", function() {

    mostrarExpedientes(campoBusqueda.value);

});


// ======================================
// 16. MOSTRAR EXPEDIENTES AL INICIAR
// ======================================

mostrarExpedientes();