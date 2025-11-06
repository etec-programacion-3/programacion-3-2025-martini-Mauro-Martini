Instalacion requisitos:
winget install OpenJS.NodeJS o sudo apt install nodejs npm
npm install express multer
npm install sequelize sqlite3
con RestClient se pueden utilizar los Request
npm install cors
npm install adm-zip

Ejemplo Post con powershell:
 curl.exe -F "titulo=Mi Juego" -F "descripcion=Descripción del juego" -F "userId=1" -F "archivo=@E:\JuegoRandom.zip;type=application/zip" -F "imagen=@E:\portada.jpg;type=image/jpeg" http://localhost:3000/juegos
Utilize claude para que me de los archivos y su orden para empezar
con una buena base.

En la segunda clase más que nada defini los modelos bien, utilize un
archivo de index para por orden más que nada, y termine con los requisitos
de la issue 1 pudiendo definir los datos basicos de la database ya que
es muy posible que añada más por las caracteristicas de los juegos al subirlos.

para la tercera clase más que nada he estado preguntando varias cosas a clade para 
entender lo que hay que hacer y repoinendo los requerimientos

Utilizando ThunderClient pude ver si funcionaban o no las conexiones a la base de datos
en conjunto con el CRUD

en esta clase más que nada testee el subir archivos en si y estoy investigando el sistema
de verificacion de usuarios para la actualizacion, subida, borrado, etc, de juegos y sus modelos
relacionados, los test que hice fueron directamente de la terminal ya que ThunderClient requiere
premium para subir archivos.

en esta clase hice una verificacion muy simple donde si se quiere editar un juego utilizando la id
y al intentar modificarlo la id de usuario no es la misma del que posteo el juego en si da un error.
por ahora es algo simple pero parece que en la issue 5 lo profundisare mejor.
