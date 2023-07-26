# GUÍA DE INSTALACIÓN API REST

## Dependencias 

Las versiones y los nombres de las librerías utilizadas en el desarrollo del api rest son las siguientes:

* Node.js v14.17.3  
* MySQL versión 2.35.1.  
* bcrypt: 5.0.1   
* cors: 2.8.5  
* dayjs: 1.11.3  
* express: 4.17.2   
* google-auth-library: 7.14.1  
* http-errors: 2.0.0  
* jwt-simple: 0.5.6   
* moment: 2.29.1  
* mysql2: 2.2.5  
* nodemailer: 6.7.2    
* socket.io: 4.5.2  

     
## Herramientas 

* Git versión 2.35.1. 
* MySQL Workbench 8.0 CE. 
* Visual Studio Code. 


## Servicios proveídos por el api rest

* Áreas de experticia:    Maneja toda la información relacionada con las áreas de experticia de los usuarios.

* Asociaciones:  Administra toda la información relacionada con las asociaciones de los usuarios.

* Buscar granjas: Utiliza toda la información relacionada con la búsqueda de las granjas en el sistema.

* Buscar pescadores:   Permite obtener toda la información relacionada con la búsqueda de los pescadores en el sistema.

* Buscar piscicultores: Permite adquirir toda la información relacionada con la búsqueda de los piscicultores en el sistema.

* Buscar usuarios por email: Obtiene toda la información relacionada con la búsqueda de los usuarios por email en el sistema.

* Categorías:  Maneja toda la información relacionada con las categorías de temas y novedades.

* Chat:  Adquiere toda la información relacionada con los mensajes en el chat.

* Compartir:  Permite compartir un enlace a un email.

* Conócenos:  Nos muestra una descripción breve de Dory.

* Contáctenos:   Permite la comunicación de los usuarios con Dory.

* Corregimientos: Nos muestra toda la información relacionada con los corregimientos del departamento donde nos ubicamos.

* Dashboard: Muestra la información del dashboard.

* Departamentos: Muestra toda la información relacionada con los departamentos del territorio colombiano.

* Enlaces rápidos: Muestra todos los enlaces de las imágenes ubicadas debajo del dashboard.

* Especies:  Presenta toda la información de las especies en las granjas.

* Etnias: Expone toda la información de las etnias de los usuarios.

* Eventos: Muestra toda la información relacionada con los eventos.

* Fotos:   Administra todas las fotos de las granjas.

* Granjas: Manipula toda la información relacionada con las granjas.

* Infraestructuras: Maneja toda la información relacionada con las infraestructuras que tienen las granjas.

* Integrantes: Expone toda la información relacionada con los integrantes del equipo de trabajo.

* Login: Presenta toda la información relacionada con los login de usuarios.

* Mensajes:  Expone toda la información relacionada con los mensajes del chat.

* Modalidades: Muestra toda la información relacionada con las modalidades de los eventos.

* Municipios: Enseña toda la información relacionada con los municipios de los departamentos del territorio colombiano.

* Negocios: Maneja toda la información relacionada con los negocios de los usuarios.

* Normatividades: Muestra toda la información relacionada con las normatividades.

* Nosotros: Maneja toda la información relacionada con la plataforma piscícola Dory.

* Novedades: Expone toda la información relacionada con las novedades.

* Pescadores:  Permite exhibir toda la información de los pescadores en el sistema.

* Piscicultores: Permite exhibir toda la información de los piscicultores en el sistema.

* Proveedores: Muestra toda la información de los proveedores en el sistema.

* Proyectos: Expone toda la información de los proyectos.

* Publicaciones: Enseña toda la información de las publicaciones de los usuarios.

* Reseñas: Muestra todas las reseñas de los usuarios con las granjas.

* Search: Muestra todas las búsquedas en el índex de la plataforma Dory.

* Sectores: Expone toda la información de los sectores del municipio.

* Sexos: Exhibe toda la información de los sexos de los usuarios.

* Slider: Expone toda la información del carrusel de slide usado en la plataforma piscícola Dory.

* Subregiones: Muestra toda la información de las subregiones de los departamentos.

* Tipos de asociaciones: Exhibe todos los tipos de asociaciones en la plataforma piscícola Dory.

* Tipos de eventos: Expone toda la información de los tipos de eventos en el sistema.

* Tipos de normatividades: Enseña toda la información de los tipos de normatividades en el sistema.

* Tipos de novedades:  Muestra toda la información de los tipos de novedades en el sistema.

* Tipos de Usuarios: Exhibe toda la información de los tipos de usuarios en el sistema.

* Top Alert: Expone la información del top alert.

* Usuarios: Administrar toda la información relacionada con los usuarios.

* Vehículos: Permite mostrar toda la información de los vehículos de los usuarios.

* Veredas: Muestra la información de las veredas de los diferentes municipios.

## 1. Configuraciones previas

* Instalar servidor de base de datos MySQL

* Instale el servidor de base de datos en un servicio de la nube de su preferencia. Guarde el hostname, nombre de la base de datos, nombre de usuario y password de la base de datos. Estos se usarán en los siguientes pasos.	    

* Ejecutar el script NewCreateDB.sql en la base de datos creada en el punto anterior. 

Nota: Debe ingresar al script y cambiar el nombre de la base de datos.
 ![image](https://user-images.githubusercontent.com/118612137/204650017-d7aab7bf-8388-43f6-a6f8-e02e74332296.png)


* Ejecutar el script PoblarBD.sql en la base de datos creada en el punto 1, para establecer los datos iniciales.


## 2.  Instale GIT

Ingrese al enlace https://git-scm.com y siga las instrucciones para llevar a cabo la instalación.


## 3. Ingrese a GitHub

Cree una cuenta en GitHub en https://github.com  o ingrese si ya tiene una.


## 4. Cree un nuevo repositorio privado
![image](https://user-images.githubusercontent.com/118612137/204652250-2a79b4ee-3c19-4bf8-8fb4-aaac8d068811.png)
![image](https://user-images.githubusercontent.com/118612137/204652354-b1b017c5-8ff3-4852-aecf-54fca9e4d521.png)

Guarde la dirección del nuevo repositorio será usada más adelante.

## 5. Acceda al código fuente

* Alternativa 1 (recomendada): 

git clone https://github.com/doryteam1/dory-api-rest.git
cd dory-api-rest

* Alternativa 2:

cd src/dory-api-rest
git init

Ahora usted se encuentra en el directorio que contiene el código fuente de la aplicación.


## 6. Adicione un nuevo remoto

Estando en el directorio dory-api-rest ejecute el siguiente comando:

git remote add dory https://github.com/***.git

Remplace la url usada en el comando por la url del nuevo repositorio guardada en el punto 3.
Esto adiciona un nuevo remoto en el repositorio dory-api-rest




## 7. Cree la rama “master”

git checkout -b master 

## 8. Suba el código al nuevo repositorio

git push dory master

Ahora el código fuente de la aplicación se encuentra en el nuevo repositorio. 

Nota: Asegúrese de tener configurada la cuenta de git con un usuario que tenga los permisos necesarios para realizar este procedimiento.


## 9. Ingrese a Heroku

Cree una cuenta en Heroku en https://signup.heroku.com/login o ingrese si ya tiene una.


## 10. Cree una app en Heroku
 ![image](https://user-images.githubusercontent.com/118612137/204652564-a46c75f9-6b0f-49f1-9e08-473a98142de4.png)
![image](https://user-images.githubusercontent.com/118612137/204652624-1d1e418a-0494-4e69-afce-4a7ace689fb0.png)

Heroku usa contenedores para ejecutar y escalar todas las aplicaciones. Estos contenedores se denominan Dynos. 

Remplace el nombre de la aplicación (App name) por el de su preferencia.
Diligencie el formulario y haga clic en el botón Create app

## 11. Configurar App 

Para configurar la app en Heroku realice los siguientes pasos:
	
### 1. Seleccione GitHub como método de despliegue.
![image](https://user-images.githubusercontent.com/118612137/204652723-26073aa2-0afb-413a-945d-612c1da5b70a.png)

### 2. Presione el botón Connect to GitHub
![image](https://user-images.githubusercontent.com/118612137/204652765-c288031a-0b06-409c-9a63-abbcaf4c41d9.png)
	
### 3. Inicie sesión con su usuario y contraseña de GitHub para conectarse a Heroku

### 4. Conecte la App con el nuevo repositorio
![image](https://user-images.githubusercontent.com/118612137/204652834-54b4098a-a0f7-4750-bf7b-08cf725bb295.png)

Seleccione el nuevo repositorio creado en el punto 3

### 5. Seleccione la rama master para despliegues automáticos.
![image](https://user-images.githubusercontent.com/118612137/204652871-8e29e608-266e-4079-8cd5-66ef8377219d.png)
 
Presione el botón Enable Automatic Deploys para activar los despliegues automáticos.

## 12. Despliegue la App
![image](https://user-images.githubusercontent.com/118612137/204652962-f883ac89-142d-4040-b1d7-097b5ca83735.png)

Presione el botón Deploy Branch para realizar un despliegue manual de la rama master.
Una vez terminado el proceso la app se encuentra online.

## 13. Configure las Variables de entorno en Heroku
![image](https://user-images.githubusercontent.com/118612137/204653009-c72b2e56-b418-4042-a7ed-6b533251eb1e.png)
En la pestaña “Settings” de la aplicación en la sección “Config Vars” configurar las siguientes variables de entorno:

* DB_HOST: Host donde se encuentra alojado el servidor de bases de datos mysql.
 
* DB_NAME: Nombre de la base de datos.

* DB_USER:  Usuario de la base de datos.

* DB_PASSWORD: Password de usuario de la base de datos

* DORY_WEB_APP_URL: Url de la aplicación web dory (La puede obtener una vez termine la guía de instalación de la aplicación web).



## 14. Verifique
![image](https://user-images.githubusercontent.com/118612137/204653139-90ff5942-0e70-4a06-9994-f1c87f3555a4.png)
 
En la sección Settings de la app encontrará la sección “Domains”. En esta encontrará la url base para acceder al api rest. Añada el sufijo api al final de la dirección y verifique su funcionamiento en postman.

