-- Elimina la base de datos si ya existe
DROP DATABASE IF EXISTS BITness_GYM;

-- Crea la base de datos
CREATE DATABASE BITness_GYM;

-- Usa la base de datos
USE BITness_GYM;

-- Creación de la Tabla Usuario
CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    contraseña VARCHAR(255),
    rol ENUM('cliente', 'admin', 'entrenador', 'contable') NOT NULL,
    ci INT,
    nombre VARCHAR(50),
    altura INT,
    fecha_registro DATE
);

-- Creación de la Tabla Perfil referencia a Usuario
CREATE TABLE PERFIL (
    id_usuario INT PRIMARY KEY,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Contable referencia a Usuario
CREATE TABLE CONTABLE (
    id_usuario INT PRIMARY KEY,
    departamento VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Administrador referencia a Usuario
CREATE TABLE ADMINISTRADOR (
    id_usuario INT PRIMARY KEY,
    cargo VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Entrenador referencia a Perfil
CREATE TABLE ENTRENADOR (
    id_usuario INT PRIMARY KEY,
    especialidades VARCHAR(150),
    detalles VARCHAR(255),
    precio VARCHAR(10),
    disponibilidad_dia VARCHAR(30),
    disponibilidad_hora VARCHAR(30),
    certificaciones VARCHAR(200),
    años_experiencia INT,
    formato VARCHAR(100),
    telefono VARCHAR(50),
    ruta_perfil VARCHAR(255),
    ruta_carousel VARCHAR(10000),
    FOREIGN KEY (id_usuario) REFERENCES PERFIL(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Cliente referencia a Perfil
CREATE TABLE CLIENTE (
    id_usuario INT PRIMARY KEY NOT NULL,
    estado_sus VARCHAR(50) CHECK (estado_sus IN ('Activo', 'Inactivo')),
    sus_preferida VARCHAR(50),
	peso INT,
    edad INT,
    genero ENUM('Masculino', 'Femenino', 'Prefiero no decirlo'),
    nivel_act ENUM('Sedentario', 'Ligeramente Activo', 'Moderadamente Activo', 'Muy Activo', 'Atleta Profesional'),
    descripcion TEXT,
    ruta_perfil VARCHAR(255),
    concurrencia INT,
    FOREIGN KEY (id_usuario) REFERENCES PERFIL(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Carrito
CREATE TABLE CARRITO (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    estado INT CHECK (estado IN(1, 2, 3)),
    cant_productos INT,  
    precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0),
    precio_sin_iva DECIMAL(10,2) NOT NULL CHECK(precio_sin_iva >=0),
    fecha_add DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES CLIENTE (id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Creación de la Tabla Suscripción
CREATE TABLE SUSCRIPCION (
    id_suscripcion INT PRIMARY KEY,
    descripcion_sus TEXT NOT NULL, -- Ventajas de la suscripción
    precio_sus DECIMAL(10,2) NOT NULL CHECK (precio_sus >= 0),
    duracion_sus ENUM('Mensual', 'Anual') NOT NULL,
    categoria_sus VARCHAR(24) NOT NULL
);

-- Creación de la Tabla Sucursal
CREATE TABLE SUCURSAL (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    calle VARCHAR(100),
    localidad VARCHAR(50),
    ciudad VARCHAR(50),
    codigo_postal VARCHAR(10),
    telefono VARCHAR(15),
    horario_apertura TIME,
    horario_cierre TIME,
    latitud INT,
    longitud INT
);

-- Creación de la Tabla Producto
CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_sucursal INT,
    nombre VARCHAR(50),
    precio DECIMAL(10,2),
    descripcion TEXT,
    stock INT,
    imagen_url VARCHAR(255),
    FOREIGN KEY (id_sucursal) REFERENCES SUCURSAL (id_sucursal) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Creación de la Tabla Factura
CREATE TABLE FACTURA (
	id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito INT,
    id_suscripcion INT,
    fecha_emision DATE,
    total DECIMAL(10,2),
    fecha_pago DATE,
    metodo_pago VARCHAR(50),
    ruta_pdf VARCHAR(255),
    FOREIGN KEY (id_carrito) REFERENCES CARRITO (id_carrito) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_suscripcion) REFERENCES SUSCRIPCION (id_suscripcion) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Agenda
CREATE TABLE AGENDA (
    id_agenda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    nombre VARCHAR(50),
    descripcion TEXT,
    fecha_actividad DATE,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Actividad
CREATE TABLE ACTIVIDAD (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
	hora_inicio TIME,
    hora_fin TIME,
    dia ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo')
);

-- Creación de la Tabla Clase
CREATE TABLE CLASE (
    id_actividad INT PRIMARY KEY,
    nombre ENUM('boxeo', 'gap', 'calistenia', 'kickboxing', 'aerobicos'),
    FOREIGN KEY (id_actividad) REFERENCES ACTIVIDAD (id_actividad) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Entrenamiento
CREATE TABLE ENTRENAMIENTO (
    id_actividad INT PRIMARY KEY,
    id_usuario INT,
    nombre VARCHAR(50),
    FOREIGN KEY (id_actividad) REFERENCES ACTIVIDAD (id_actividad) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES PERFIL (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Repetición
CREATE TABLE REPETICION (
    id_repeticion INT AUTO_INCREMENT PRIMARY KEY,
    peso DECIMAL(5,2),
    cantidad INT
);

-- Creación de la Tabla Ejercicio
CREATE TABLE EJERCICIO (
    id_ejercicio INT AUTO_INCREMENT PRIMARY KEY,
    id_repeticion INT,
    nombre VARCHAR(50),
    descripcion TEXT,
    orden INT,
    ruta_gif VARCHAR(255),
    ruta_img VARCHAR(255),
    musculo_img VARCHAR(255),
	musculos VARCHAR(250),
    equipamiento VARCHAR(250),
    FOREIGN KEY (id_repeticion) REFERENCES REPETICION (id_repeticion) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Compone (relación N a N entre Entrenamiento y Ejercicio)
CREATE TABLE Compone (
    id_actividad_FK INT NOT NULL,
    id_ejercicio_FK INT NOT NULL,
    PRIMARY KEY (id_actividad_FK, id_ejercicio_FK),
    FOREIGN KEY (id_actividad_FK) REFERENCES ENTRENAMIENTO (id_actividad) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_ejercicio_FK) REFERENCES EJERCICIO (id_ejercicio) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Contiene (relación N a N entre Carrito y Producto)
CREATE TABLE Contiene (
    id_carrito_FK INT,
    id_producto_FK INT,
    cantidad INT,
    PRIMARY KEY (id_carrito_FK, id_producto_FK),
    FOREIGN KEY (id_carrito_FK) REFERENCES CARRITO (id_carrito) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto_FK) REFERENCES PRODUCTO (id_producto) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Pertenece (relación N a N entre Sucursal y Producto)
CREATE TABLE Pertenece (
    id_sucursal_FK INT,
    id_producto_FK INT,
    PRIMARY KEY (id_sucursal_FK, id_producto_FK),
    FOREIGN KEY (id_sucursal_FK) REFERENCES SUCURSAL (id_sucursal) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto_FK) REFERENCES PRODUCTO (id_producto) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Posee (relación entre Cliente y Suscripcion)
CREATE TABLE Paga (
	id_usuario_FK INT PRIMARY KEY,
	id_suscripcion_FK INT,
	fecha_inicio DATE,
	fecha_fin DATE,
	FOREIGN KEY (id_suscripcion_FK) REFERENCES SUSCRIPCION (id_suscripcion) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (id_usuario_FK) REFERENCES CLIENTE (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Creación de la Tabla Posee (relación N a N entre Agenda y Actividad)
CREATE TABLE Posee (
    id_agenda_FK INT,
    id_actividad_FK INT,
    PRIMARY KEY (id_agenda_FK, id_actividad_FK),
    FOREIGN KEY (id_agenda_FK) REFERENCES AGENDA (id_agenda) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_actividad_FK) REFERENCES ACTIVIDAD (id_actividad) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Entrena (
	id_entrenador_FK INT,
    id_cliente_FK INT,
    PRIMARY KEY(id_entrenador_FK, id_cliente_FK),
    FOREIGN KEY (id_entrenador_FK) REFERENCES ENTRENADOR (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente_FK) REFERENCES CLIENTE (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Insertar usuarios en la tabla USUARIO
INSERT INTO USUARIO (email, contraseña, rol, ci, nombre, altura, fecha_registro) 
VALUES
-- Clientes
('client1@example.com', SHA2('cliente1', 256), 'cliente', 11111111, 'Benjamin', '0', '2024-10-15'),
('client2@example.com', SHA2('cliente2', 256), 'cliente', 22222222, 'Steven', 175, '2024-10-16'),
('client3@example.com', SHA2('cliente3', 256), 'cliente', 33333333, 'Cristian', 185, '2024-10-17'),
('client4@example.com', SHA2('cliente4', 256), 'cliente', 44444444, 'Yago', 170, '2024-10-17'),
('client5@example.com', SHA2('cliente5', 256), 'cliente', 55555555, 'Marcos', 160, '2024-10-20'),
-- Entrenadores
('trainer1@example.com', SHA2('train1', 256), 'entrenador', 22334455, 'Micaela', 185, '2024-10-18'),
('trainer2@example.com', SHA2('train2', 256), 'entrenador', 33445566, 'Jorge', 190, '2024-10-25'),
-- Contable
('contable1@example.com', SHA2('contable1', 256), 'contable', 44556677, 'Lorenzo', 175, '2024-10-11'),
('contable2@example.com', SHA2('contable2', 256), 'contable', 44556678, 'Lorena', 176, '2024-10-11'),
-- Admins
('admin@example.com', SHA2('admin1', 256), 'admin', 12345678, 'Admin One', 170, '2024-10-10');

-- Insertar perfiles para los usuarios en la tabla PERFIL (deben insertarse después de los usuaractividadios)
INSERT INTO PERFIL (id_usuario) 
VALUES
(1), (2), (3), (4), (5), (6), (7);

-- Insertar administradores en la tabla ADMINISTRADOR
INSERT INTO ADMINISTRADOR (id_usuario, cargo) 
VALUES
(1, 'Administrador');

INSERT INTO ENTRENADOR (id_usuario, especialidades, detalles, precio, disponibilidad_dia, disponibilidad_hora, certificaciones, años_experiencia, formato, telefono, ruta_perfil, ruta_carousel)
VALUES
(6, 'Personal Trainer|CrossFit|HIIT', 'detalles1', '500', 'Lun. a Sáb.', '7:00am a 13:00pm', 'CrossFit Level 2|CPR Certified', 5, 'Presencial & Online', '+59899888777', '/assets/imgEntrenador/carlitox.webp', '/assets/imgEntrenador/entrenador.png|/assets/imgEntrenador/carlitox.webp|/assets/imgEntrenador/entrenador.png'),
(7, 'Boxeo|Kickboxing|MMA', 'detalles2', '650', 'Lunes, Miércoles y Viernes', '20:00pm a 22:30pm', 'NASM Certified|First Aid Certified', 6, 'Presencial', '+59898343062', '/assets/imgEntrenador/entrenador.png', '/assets/imgEntrenador/entrenador.png|/assets/imgEntrenador/carlitox.webp|/assets/imgEntrenador/entrenador.png');

-- Insertar contables en la tabla CONTABLE
INSERT INTO CONTABLE (id_usuario, departamento) 
VALUES
(8, 'Contabilidad'),
(9, 'Administración');

-- Insertar clientes en la tabla CLIENTE
INSERT INTO CLIENTE (id_usuario, estado_sus, sus_preferida, concurrencia) 
VALUES
(1, 'Activo', 'Estándar', 78),
(2, 'Activo', 'Avanzada', 2),
(3, 'Activo', 'Estándar', 5),
(4, 'Activo', 'Avanzada', 65),
(5, 'Activo', 'Estándar', 31),
(6, 'Activo', 'Avanzada', 10);

-- Insertar sucursales en la tabla SUCURSAL
INSERT INTO SUCURSAL (nombre, calle, localidad, ciudad, codigo_postal, telefono, horario_apertura, horario_cierre, latitud, longitud) 
VALUES
('BITness GYM', 'Calle Garibaldi', 'Malvin Norte', 'Montevideo', '10001', '091234567', '06:00:00', '22:00:00', '-34.901112', '-56.164532'),
('BITness GYM 2', 'Av. Uruguay', 'Pocitos', 'Montevideo', '10001', '099888777', '07:00:00', '23:00:00', '-34.908333333333', '-56.15');

-- Insertar productos en la tabla PRODUCTO
INSERT INTO PRODUCTO (id_sucursal, nombre, precio, descripcion, stock, imagen_url) 
VALUES
(1, 'Monster', 29.99, 'Bebida energetica', 100, '../../../../assets/imgProducts/monster.png'),
(1, 'Galletas de Avena', 49.99, 'Galletas de Avena', 50, '../../../../assets/imgProducts/galletas.jpg'),
(2, 'Barra de cereal', 19.99, 'Barra de cereales', 30, '../../../../assets/imgProducts/cereal.jpg'),
(2, 'Agua Salus', 30.99, 'Agua Salus sin gas', 5, '../../../../assets/imgProducts/agua.jpg');

-- Insertar en la tabla CARRITO
INSERT INTO CARRITO (id_usuario, estado, cant_productos, precio_total, precio_sin_iva) 
VALUES
(1, 1, 2, 59.98, 39.99),  -- Cliente 1
(2, 2, 1, 34.98, 25.59);  -- Cliente 2

-- Insertar en la tabla SUSCRIPCION
INSERT INTO SUSCRIPCION (id_suscripcion, descripcion_sus, precio_sus, duracion_sus, categoria_sus) 
VALUES
(1, 'Acceso 1', 10.00, 'Mensual', 'Estándar'),
(2, 'Acceso 2', 100.00, 'Anual', 'Estándar'),
(3, 'Acceso 3', 20.00, 'Mensual', 'Avanzado'),
(4, 'Acceso 4', 200.00, 'Anual', 'Avanzado'),
(5, 'Acceso 5', 30.00, 'Mensual', 'Hardcore'),
(6, 'Acceso 6', 300.00, 'Anual', 'Hardcore');

-- Insertar en la tabla FACTURA
INSERT INTO FACTURA (id_carrito, id_suscripcion, fecha_emision, total, fecha_pago, metodo_pago, ruta_pdf)
VALUES 
(1, 1, NOW(), 150.00, NOW(), 'Tarjeta de crédito', '../../../../assets/pdfs/factura.pdf');

-- Insertar en la tabla AGENDA
INSERT INTO AGENDA (id_usuario, nombre, descripcion, fecha_subida) 
VALUES
(1, 'Entrenamiento de Fuerza', 'Entrenamiento semanal de fuerza', '2024-10-01'),
(2, 'Clases de Yoga', 'Clases de yoga para principiantes', '2024-10-02');

-- Insertar en la tabla ACTIVIDAD
INSERT INTO ACTIVIDAD (hora_inicio, hora_fin, dia) 
VALUES
('07:00:00', '09:00:00', 'Lunes'),
('10:00:00', '11:30:00', 'Martes'),
('10:00:00', '11:30:00', 'Sabado'),
('10:00:00', '11:30:00', 'Domingo');

-- Insertar en la tabla CLASE
INSERT INTO CLASE (id_actividad, nombre) 
VALUES
(1, 'boxeo'),
(3, 'calistenia'),
(4, 'gap');

-- Insertar en la tabla ENTRENAMIENTO
INSERT INTO ENTRENAMIENTO (id_actividad, id_usuario, nombre) 
VALUES 
(1, 1, 'Rutina de Fuerza'),
(2, 6, 'Entrenamiento de Resistencia'),
(3, 7, 'Sesión de Estiramiento');

-- Insertar en la tabla REPETICION
INSERT INTO REPETICION (peso, cantidad) 
VALUES 
(20.50, 12),
(15.00, 10),
(25.00, 8);

-- Insertar datos corregidos en la tabla EJERCICIO
INSERT INTO EJERCICIO (id_repeticion, nombre, descripcion, orden, ruta_gif, ruta_img, musculo_img, musculos, equipamiento) 
VALUES 
(1, 'Sentadilla', 'Ejercicio para fortalecer piernas y glúteos.', 1, '/assets/imgEjercicio/aaa.gif', '/assets/imgEjercicio/a.jpg', '/assets/imgEjercicio/bb.jpg', 'Cuádriceps, Glúteos', 'Barra, Mancuernas'),
(2, 'Press Banca', 'Ejercicio para trabajar pecho y brazos.', 2, '/assets/imgEjercicio/bbb.gif', '/assets/imgEjercicio/b.png', '/assets/imgEjercicio/cc.jpg', 'Pectorales, Tríceps', 'Barra, Discos'),
(3, 'Press Militar', 'Ejercicio para desarrollar hombros y brazos.', 3, '/assets/imgEjercicio/ccc.gif', '/assets/imgEjercicio/c.png', '/assets/imgEjercicio/aa.jpg', 'Deltoides, Tríceps', 'Barra, Mancuernas');

-- Insertar en la tabla Compone
INSERT INTO Compone (id_actividad_FK, id_ejercicio_FK) 
VALUES 
(1, 1), -- Rutina de Fuerza incluye Sentadilla
(1, 2), -- Rutina de Fuerza incluye Flexión de Brazos
(2, 3), -- Entrenamiento de Resistencia incluye Press Militar
(3, 2); -- Sesión de Estiramiento incluye Flexión de Brazos

-- Insertar en la tabla Contiene
INSERT INTO Contiene (id_carrito_FK, id_producto_FK) 
VALUES
(1, 1),  -- Carrito 1 incluye Protein Powder
(1, 2);  -- Carrito 1 incluye Dumbbells

-- Insertar en la tabla Pertenece
INSERT INTO Pertenece (id_sucursal_FK, id_producto_FK) 
VALUES
(1, 1),  -- Producto Protein Powder pertenece a Main Gym
(1, 2);  -- Producto Dumbbells pertenece a Main Gym

-- Insertar en la tabla Pertenece
INSERT INTO Paga (id_usuario_FK, id_suscripcion_FK, fecha_inicio, fecha_fin) 
VALUES
(2, 3, '2024-10-29', '2024-11-29');  

INSERT INTO Entrena (id_entrenador_FK, id_cliente_FK)
VALUES
(6, 1),
(7, 1),
(7, 2);
